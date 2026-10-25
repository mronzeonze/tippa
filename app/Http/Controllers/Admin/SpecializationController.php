<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialization;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SpecializationController extends AdminController
{
    /**
     * Afficher la liste des spécialisations avec leurs statistiques
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $query = Specialization::query()
            ->withCount('users')
            ->orderBy('name', 'asc');

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('slug', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $specializations = $query->get()->map(function ($spec) {
            return [
                'id' => $spec->id,
                'name' => $spec->name,
                'slug' => $spec->slug,
                'description' => $spec->description,
                'users_count' => $spec->users_count,
                'icon' => $spec->icon ? asset('storage/' . $spec->icon) : null,
                'is_active' => $spec->is_active,
                'created_at' => $spec->created_at->toIso8601String(),
            ];
        });

        $stats = [
            'total' => $specializations->count(),
            'active' => $specializations->where('is_active', true)->count(),
            'inactive' => $specializations->where('is_active', false)->count(),
            'total_users' => $specializations->sum('users_count'),
        ];

        return Inertia::render('admin/specializations/index', [
            'specializations' => $specializations,
            'stats' => $stats,
            'search' => $search,
            'auth'=> $this->buildAuthPayload(),
        ]);
    }

    /**
     * Créer une nouvelle spécialisation
     */
    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:specializations,name',
            'slug' => 'required|string|max:255|unique:specializations,slug|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|image|mimes:jpeg,jpg,png,gif,svg|max:2048',
            'is_active' => 'required|boolean',
        ]);

        $iconPath = null;
        if ($request->hasFile('icon')) {
            $iconPath = $request->file('icon')->store('specializations/icons', 'public');
        }

        $specialization = Specialization::create([
            'id' => Str::uuid()->toString(),
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'icon' => $iconPath,
            'is_active' => $validated['is_active'],
        ]);
        ActivityLog::logActivity(
            'specialization_created',
            Specialization::class,
            $specialization->id,
            "Spécialisation créée : {$specialization->name}",
            ['name' => $specialization->name, 'slug' => $specialization->slug]
        );

        return redirect()->back()->with('success', 'Spécialisation créée avec succès');
    }

    /**
     * Modifier une spécialisation
     */
    public function update(Request $request, Specialization $specialization)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:specializations,name,' . $specialization->id,
            'slug' => 'required|string|max:255|unique:specializations,slug,' . $specialization->id,
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|image|mimes:jpeg,jpg,png,gif,svg|max:2048',
            'is_active' => 'required|boolean',
        ]);

        $iconPath = $specialization->icon;
        if ($request->hasFile('icon')) {
            if ($specialization->icon && Storage::disk('public')->exists($specialization->icon)) {
                Storage::disk('public')->delete($specialization->icon);
            }
            $iconPath = $request->file('icon')->store('specializations/icons', 'public');
        }

        $specialization->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'icon' => $iconPath,
            'is_active' => $validated['is_active'],
        ]);

        return redirect()->back()->with('success', 'Spécialisation mise à jour');
    }

    /**
     * Supprimer une spécialisation
     */
    public function destroy(Specialization $specialization)
    {
        if ($specialization->users()->count() > 0) {
            return redirect()->back()->withErrors([
                'error' => 'Impossible de supprimer : spécialisation assignée à des utilisateurs'
            ]);
        }

        if ($specialization->icon && Storage::disk('public')->exists($specialization->icon)) {
            Storage::disk('public')->delete($specialization->icon);
        }

        $specialization->delete();

        return redirect()->back()->with('success', 'Spécialisation supprimée');
    }

    /**
     * Exporter en CSV
     */
    public function export()
    {
        $specs = Specialization::withCount('users')->get();
        $filename = 'specializations_' . date('Y-m-d_His') . '.csv';

        return response()->streamDownload(function() use ($specs) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Nom', 'Slug', 'Description', 'Utilisateurs', 'Statut', 'Date']);
            
            foreach ($specs as $s) {
                fputcsv($file, [
                    $s->id, $s->name, $s->slug, $s->description ?? '',
                    $s->users_count, $s->is_active ? 'Actif' : 'Inactif',
                    $s->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}