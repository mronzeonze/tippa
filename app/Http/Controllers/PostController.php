<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\PlatformSetting;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PostController extends Controller
{
    public function create()
    {
        $user = auth()->user();

        return inertia('frontend/create-post', [
            'auth' => [
                'user' => tap(auth()->user()->load('roles'), fn ($u) => null),
            ],
            // ✅ Passer les limites au frontend (validation UX temps réel)
            'post_limits' => [
                'max_length'        => (int) PlatformSetting::get('max_post_length', 5000),
                'max_images'        => (int) PlatformSetting::get('max_images_per_post', 10),
                'max_image_size_kb' => (int) PlatformSetting::get('max_image_size', 5120),
            ],
        ]);
    }

    public function store(Request $request)
    {
        // ── 1. Lire les limites depuis les paramètres plateforme ──────────────
        $maxLength  = (int) PlatformSetting::get('max_post_length',    5000);
        $maxImages  = (int) PlatformSetting::get('max_images_per_post', 10);
        $maxImageKb = (int) PlatformSetting::get('max_image_size',      5120);

        // ── 2. Validation Laravel ─────────────────────────────────────────────
        //   ✅ 'images'   => array|max:N   ← limite le NOMBRE d'images
        //   ✅ 'images.*' => ...max:K       ← limite la TAILLE de chaque image
        $request->validate([
            'content'  => "nullable|string|max:{$maxLength}",
            'images'   => "nullable|array|max:{$maxImages}",   // ← LA RÈGLE MANQUANTE
            'images.*' => "nullable|image|mimes:jpeg,jpg,png,gif,webp|max:{$maxImageKb}",
        ], [
            'content.max'   => "Le contenu ne peut pas dépasser {$maxLength} caractères.",
            'images.max'    => "Vous ne pouvez pas envoyer plus de {$maxImages} images par publication.",
            'images.*.max'  => "Chaque image ne peut pas dépasser {$maxImageKb} Ko.",
            'images.*.image'=> "Les fichiers doivent être des images valides.",
            'images.*.mimes'=> "Formats acceptés : JPEG, PNG, GIF, WebP.",
        ]);

        // ── 3. Vérification manuelle de sécurité (filet de sécurité) ─────────
        //   Laravel valide les fichiers uploadés via $request->allFiles()
        //   Ce double contrôle couvre les cas où le tableau serait mal parsé
        if ($request->hasFile('images')) {
            $uploadedCount = count($request->file('images'));

            if ($uploadedCount > $maxImages) {
                return back()->withErrors([
                    'images' => "Vous avez envoyé {$uploadedCount} images. "
                              . "La limite est de {$maxImages} par publication.",
                ])->withInput();
            }
        }

        // ── 4. Vérification contenu OU images ────────────────────────────────
        if (empty(trim($request->content ?? '')) && !$request->hasFile('images')) {
            return back()->withErrors([
                'content' => 'Veuillez ajouter du contenu ou des images pour créer une publication.',
            ]);
        }

        // ── 5. Déterminer le type de post ─────────────────────────────────────
        $hasContent = !empty(trim($request->content ?? ''));
        $hasImages  = $request->hasFile('images');

        $postType = match (true) {
            $hasContent && $hasImages  => 'text_with_image',
            $hasImages && !$hasContent => 'image',
            default                    => 'text',
        };

        // ── 6. Statut selon la modération ─────────────────────────────────────
        $isModerationEnabled = (bool) PlatformSetting::get('moderation_enabled', true);
        $status = $isModerationEnabled ? 'pending' : 'published';

        // ── 7. Créer post + images dans une TRANSACTION ───────────────────────
        //   ✅ Si l'upload d'une image échoue, le post n'est PAS sauvegardé
        //   ❌ AVANT : post créé AVANT la boucle → post orphelin en cas d'erreur
        $post = DB::transaction(function () use ($request, $hasImages, $hasContent, $postType, $status) {

            $post = Post::create([
                'id'        => Str::uuid()->toString(),
                'user_id'   => auth()->id(),
                'content'   => $request->content ?? '',
                'post_type' => $postType,
                'status'    => $status,
            ]);

            if ($hasImages) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('posts', 'public');

                    $post->images()->create([
                        'id'        => Str::uuid()->toString(),
                        'image_url' => asset('storage/' . $path),
                    ]);
                }
            }

            return $post;
        });

        $message = $status === 'pending'
            ? '📋 Publication soumise ! Elle sera visible après vérification par notre équipe.'
            : '✅ Publication créée avec succès !';

        return redirect()->route('feed.index')->with('success', $message);
    }

    /**
     * Toggle like/unlike sur un post
     */
    public function toggleLike(Post $post)
    {
        $user = auth()->user();
        $post->isLikedBy($user) ? $post->unlike($user) : $post->like($user);
        return back();
    }

    /**
     * Récupérer les détails d'un post (JSON)
     */
    public function getDetails(Post $post)
    {
        $post->load([
            'user:id,full_name,username,profile_picture',
            'images:id,post_id,image_url',
            'comments' => function ($query) {
                $query->whereNull('parent_id')
                    ->with('user:id,full_name,username,profile_picture')
                    ->withCount('likedBy as likes_count')
                    ->latest()
                    ->limit(10);
            },
        ]);

        return response()->json([
            'post' => [
                'id'             => $post->id,
                'content'        => $post->content,
                'post_type'      => $post->post_type,
                'created_at'     => $post->created_at,
                'user'           => $post->user,
                'images'         => $post->images,
                'likes_count'    => $post->likedBy()->count(),
                'comments_count' => $post->comments()->count(),
                'shares_count'   => $post->shares()->count(),
                'is_liked'       => $post->isLikedBy(auth()->user()),
                'comments'       => $post->comments,
            ],
        ]);
    }

    /**
     * Supprimer un post
     */
    public function destroy(Post $post)
    {
        if ($post->user_id !== auth()->id()) {
            return back()->withErrors(['error' => 'Vous n\'êtes pas autorisé à supprimer cette publication.']);
        }

        $post->images()->delete();
        $post->delete();

        return back()->with('success', 'Publication supprimée avec succès !');
    }

    public function getLikes($postId)
    {
        $post  = Post::findOrFail($postId);
        $likes = $post->likedBy()
            ->select('users.id', 'users.full_name', 'users.username', 'users.profile_picture')
            ->withPivot('created_at')
            ->orderBy('post_likes.created_at', 'desc')
            ->get();

        return response()->json(['likes' => $likes]);
    }

    public function getShares($postId)
    {
        $post   = Post::findOrFail($postId);
        $shares = $post->shares()
            ->with('user:id,full_name,username,profile_picture')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'user'       => $s->user,
                'share_type' => $s->share_type,
                'content'    => $s->content,
                'created_at' => $s->created_at,
            ]);

        return response()->json(['shares' => $shares]);
    }

    public function getComments($postId)
    {
        $post     = Post::findOrFail($postId);
        $comments = $post->comments()
            ->with(['user:id,full_name,username,profile_picture', 'replies.user:id,full_name,username,profile_picture'])
            ->withCount('replies')
            ->latest()
            ->get();

        return response()->json(['comments' => $comments, 'total' => $comments->count()]);
    }
}