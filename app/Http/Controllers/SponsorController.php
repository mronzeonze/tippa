<?php

namespace App\Http\Controllers;

use App\Models\Sponsor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SponsorController extends Controller
{
    // ═════════════════════════════════════════════════════════════════════════
    //  ROUTES PUBLIQUES
    // ═════════════════════════════════════════════════════════════════════════

    public function index(): JsonResponse
    {
        $sponsors = Sponsor::active()
            ->ordered()
            ->select([
                'id', 'title', 'description',
                'image_url', 'link_url', 'cta_label',
            ])
            ->get();

        return response()->json(['data' => $sponsors]);
    }

    public function trackView(Sponsor $sponsor): JsonResponse
    {
        if ($sponsor->isLive()) {
            $sponsor->recordImpression();
        }

        return response()->json(['success' => true]);
    }

    public function trackClick(Sponsor $sponsor): JsonResponse
    {
        if ($sponsor->isLive()) {
            $sponsor->recordClick();
        }

        return response()->json([
            'success'  => true,
            'redirect' => $sponsor->link_url,
        ]);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  ROUTES ADMIN
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * GET /admin/sponsors
     *
     * Affiche la page admin de gestion des sponsors (Inertia).
     * 
     * ✅ CORRIGÉ : Gestion correcte des filtres et exclusion des soft-deleted
     */
    public function indexPage(Request $request)
    {
        // ── Construire la query de base selon le filtre ──────────────────────
        
        // Par défaut : exclure les sponsors supprimés
        $query = Sponsor::query();
        
        // Si on veut voir SEULEMENT les supprimés
        if ($request->status === 'deleted') {
            $query = Sponsor::onlyTrashed();
        }
        
        // Si on veut voir TOUS (actifs + inactifs + supprimés)
        if ($request->status === 'all_with_deleted') {
            $query = Sponsor::withTrashed();
        }
        
        // ── Ajouter les relations et tri ─────────────────────────────────────
        $query->with('creator:id,full_name,username')
              ->orderBy('sort_order')
              ->orderByDesc('created_at');

        // ── Filtres additionnels (actif/inactif) ─────────────────────────────
        // Ces filtres ne s'appliquent que si on ne filtre pas par "deleted"
        if ($request->status === 'active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'inactive') {
            $query->where('is_active', false);
        }

        // ── Pagination avec métriques calculées ──────────────────────────────
        $sponsors = $query->paginate(15)->through(function (Sponsor $s) {
            return [
                ...$s->toArray(),
                'ctr'     => $s->ctr,
                'is_live' => $s->isLive(),
                'deleted_at' => $s->deleted_at,
            ];
        });

        // ── Calculer les stats GLOBALES (tous sponsors) ──────────────────────
        $globalStats = [
            'total' => Sponsor::count(),
            'active' => Sponsor::where('is_active', true)->count(),
            'inactive' => Sponsor::where('is_active', false)->count(),
            'deleted' => Sponsor::onlyTrashed()->count(),
            'total_impressions' => Sponsor::sum('impressions_count'),
            'total_clicks' => Sponsor::sum('clicks_count'),
        ];

        // ── Retourner la vue Inertia ─────────────────────────────────────────
        return Inertia::render('admin/sponsors/index', [
            'sponsors' => $sponsors,
            'globalStats' => $globalStats, // ← NOUVEAU : Stats globales
            'filters' => [
                'status' => $request->status ?? 'all',
            ],
            'auth' => [
                'user' => tap(auth()->user()->load('roles'), fn ($u) => null),
            ],
        ]);
    }

    /**
     * POST /admin/sponsors
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:120',
            'description' => 'required|string|max:500',
            'image'       => 'nullable|image|mimes:jpeg,jpg,png,webp|max:3072',
            'image_url'   => 'nullable|url|max:500',
            'link_url'    => 'required|url|max:500',
            'cta_label'   => 'nullable|string|max:60',
            'is_active'   => 'boolean',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date|after_or_equal:starts_at',
            'sort_order'  => 'integer|min:0|max:9999',
        ]);

        $imageUrl = $this->resolveImageUrl($request, $validated['image_url'] ?? null);

        if (! $imageUrl) {
            return back()->withErrors([
                'image' => 'Une image (fichier ou URL) est requise.',
            ]);
        }

        Sponsor::create([
            'id'          => Str::uuid()->toString(),
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'image_url'   => $imageUrl,
            'link_url'    => $validated['link_url'],
            'cta_label'   => $validated['cta_label'] ?? 'En savoir plus',
            'is_active'   => $validated['is_active'] ?? true,
            'starts_at'   => $validated['starts_at'] ?? null,
            'ends_at'     => $validated['ends_at'] ?? null,
            'sort_order'  => $validated['sort_order'] ?? 0,
            'created_by'  => auth()->id(),
        ]);

        return back()->with('success', 'Sponsor créé avec succès.');
    }

    /**
     * PUT /admin/sponsors/{sponsor}
     */
    public function update(Request $request, Sponsor $sponsor)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:120',
            'description' => 'sometimes|required|string|max:500',
            'image'       => 'nullable|image|mimes:jpeg,jpg,png,webp|max:3072',
            'image_url'   => 'nullable|url|max:500',
            'link_url'    => 'sometimes|required|url|max:500',
            'cta_label'   => 'nullable|string|max:60',
            'is_active'   => 'boolean',
            'starts_at'   => 'nullable|date',
            'ends_at'     => [
                'nullable',
                'date',
                Rule::when(
                    isset($validated['starts_at']),
                    'after_or_equal:starts_at'
                ),
            ],
            'sort_order'  => 'integer|min:0|max:9999',
        ]);

        if ($request->hasFile('image') || isset($validated['image_url'])) {
            $newImageUrl = $this->resolveImageUrl($request, $validated['image_url'] ?? null);
            if ($newImageUrl) {
                $this->deleteOldImage($sponsor->image_url);
                $validated['image_url'] = $newImageUrl;
            }
        }

        $sponsor->update(array_filter($validated, fn ($v) => $v !== null));

        return back()->with('success', 'Sponsor mis à jour avec succès.');
    }

    /**
     * PATCH /admin/sponsors/{sponsor}/toggle
     */
    public function toggle(Sponsor $sponsor)
    {
        $sponsor->update(['is_active' => ! $sponsor->is_active]);

        return back()->with(
            'success',
            $sponsor->is_active ? 'Sponsor activé.' : 'Sponsor désactivé.'
        );
    }

    /**
     * DELETE /admin/sponsors/{sponsor}
     */
    public function destroy(Sponsor $sponsor)
    {
        $sponsor->delete();

        return back()->with('success', 'Sponsor supprimé avec succès.');
    }

    /**
     * POST /admin/sponsors/{id}/restore
     * 
     * ✨ NOUVEAU : Restaure un sponsor soft-deleted
     */
    public function restore(string $id)
    {
        $sponsor = Sponsor::onlyTrashed()->findOrFail($id);
        $sponsor->restore();
        
        return back()->with('success', 'Sponsor restauré avec succès ! 🎉');
    }

    /**
     * GET /admin/sponsors/{sponsor}
     */
    public function show(Sponsor $sponsor): JsonResponse
    {
        $sponsor->load('creator:id,full_name,username,profile_picture');

        return response()->json([
            'data' => [
                ...$sponsor->toArray(),
                'ctr'     => $sponsor->ctr,
                'is_live' => $sponsor->isLive(),
            ],
        ]);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  MÉTHODES PRIVÉES
    // ═════════════════════════════════════════════════════════════════════════

    private function resolveImageUrl(Request $request, ?string $externalUrl): ?string
    {
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('sponsors', 'public');
            return asset('storage/' . $path);
        }

        return $externalUrl ?: null;
    }

    private function deleteOldImage(string $imageUrl): void
    {
        $storageUrl = asset('storage/');
        if (str_starts_with($imageUrl, $storageUrl)) {
            $relativePath = str_replace($storageUrl . '/', '', $imageUrl);
            Storage::disk('public')->delete($relativePath);
        }
    }
}