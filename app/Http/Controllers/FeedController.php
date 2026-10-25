<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Share;
use App\Services\PlatformSettingsService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FeedController extends Controller
{
    // Injection du service de paramètres de la plateforme
    public function __construct(private PlatformSettingsService $settings) {}

    
    // ============================================================================
    // FIL D'ACTUALITÉ — RÈGLES DE VISIBILITÉ DES COMPTES PRIVÉS
    // ============================================================================
    //
    // Un post (original ou republication) est visible dans le feed si :
    //
    //   (a) l'auteur est l'utilisateur connecté lui-même
    //   (b) l'auteur a un compte public  (is_private = 0)
    //   (c) l'auteur a un compte privé   (is_private = 1)
    //       ET l'utilisateur connecté est abonné à cet auteur
    //
    // Cette logique est appliquée au niveau SQL pour éviter de charger
    // des données inutiles en mémoire.
    // ============================================================================

    public function index()
    {    
        $userId = auth()->id();

        // ------------------------------------------------------------------
        // ÉTAPE 1 : Récupérer les IDs des utilisateurs suivis
        //
        // On pré-charge cette liste une seule fois et on la réutilise
        // pour filtrer à la fois les posts originaux et les republications.
        // La table 'follows' est supposée avoir : follower_id, followed_id.
        // ------------------------------------------------------------------

        $followingIds = DB::table('followers')
            ->where('follower_id', $userId)
            ->pluck('user_id')
            ->toArray();

        // ------------------------------------------------------------------
        // ÉTAPE 2 : Charger les posts originaux avec filtre de confidentialité
        // ------------------------------------------------------------------

        $originalPosts = Post::with([
            'user:id,full_name,username,profile_picture,is_private',
            'images:id,post_id,image_url',
        ])
        ->withCount([
            'likedBy as likes_count',
            'comments as comments_count',
            'shares as shares_count',
            'reposts as reposts_count',
        ])
        // Filtre de confidentialité :
        // On garde uniquement les posts dont l'auteur est visible par le user courant
        ->where(function ($query) use ($userId, $followingIds) {
            $query
                // (a) Posts de l'utilisateur connecté lui-même
                ->where('user_id', $userId)

                // (b) Posts d'auteurs avec un compte public
                ->orWhereHas('user', fn ($q) => $q->where('is_private', false))

                // (c) Posts d'auteurs privés suivis par le user courant
                ->orWhereIn('user_id', $followingIds);
        })
        ->latest()
        ->get()
        ->map(function ($post) {
            $post->item_type   = 'post';
            $post->is_liked    = $post->isLikedBy(auth()->user());
            $post->is_reposted = $post->isRepostedBy(auth()->user());
            return $post;
        });

        // ------------------------------------------------------------------
        // ÉTAPE 3 : Charger les republications avec filtre de confidentialité
        //
        // Deux niveaux de confidentialité à respecter :
        //   • L'utilisateur qui republie (reposted_by) doit être visible
        //   • L'auteur du post original doit être visible
        // ------------------------------------------------------------------

        $reposts = Share::with([
            'user:id,full_name,username,profile_picture,is_private',
            'post.user:id,full_name,username,profile_picture,is_private',
            'post.images:id,post_id,image_url',
        ])
        ->where('share_type', 'repost')
        // Filtre sur l'utilisateur qui a republié
        ->where(function ($query) use ($userId, $followingIds) {
            $query
                ->where('user_id', $userId)
                ->orWhereHas('user', fn ($q) => $q->where('is_private', false))
                ->orWhereIn('user_id', $followingIds);
        })
        // Filtre sur l'auteur du post original republié
        ->whereHas('post', function ($query) use ($userId, $followingIds) {
            $query->where(function ($q) use ($userId, $followingIds) {
                $q->where('user_id', $userId)
                  ->orWhereHas('user', fn ($inner) => $inner->where('is_private', false))
                  ->orWhereIn('user_id', $followingIds);
            });
        })
        ->latest()
        ->get()
        ->map(function ($share) {
            $post = $share->post;

            $post->item_type      = 'repost';
            $post->reposted_by    = $share->user;
            $post->repost_content = $share->content;
            $post->repost_date    = $share->created_at;
            $post->original_author = $post->user;

            $post->likes_count    = $post->likedBy()->count();
            $post->comments_count = $post->comments()->count();
            $post->shares_count   = $post->shares()->count();
            $post->reposts_count  = $post->reposts()->count();
            $post->is_liked       = $post->isLikedBy(auth()->user());
            $post->is_reposted    = $post->isRepostedBy(auth()->user());

            return $post;
        });

        // ------------------------------------------------------------------
        // ÉTAPE 4 : Fusionner, trier et paginer
        // ------------------------------------------------------------------

        $allItems = $originalPosts->concat($reposts);

        // Trier par date décroissante
        // (reposts → repost_date, posts → created_at)
        $sortedItems = $allItems->sortByDesc(function ($item) {
            return $item->item_type === 'repost'
                ? $item->repost_date
                : $item->created_at;
        })->values();

        // Pagination manuelle
        $perPage     = 50;
        $currentPage = (int) request()->input('page', 1);
        $offset      = ($currentPage - 1) * $perPage;
        $total       = $sortedItems->count();
        $lastPage    = (int) ceil($total / $perPage);

        $paginatedItems = $sortedItems->slice($offset, $perPage)->values();

        $pagination = [
            'data'          => $paginatedItems,
            'current_page'  => $currentPage,
            'per_page'      => $perPage,
            'total'         => $total,
            'last_page'     => $lastPage,
            'next_page_url' => $currentPage < $lastPage
                ? url('/feeds?page=' . ($currentPage + 1))
                : null,
            'prev_page_url' => $currentPage > 1
                ? url('/feeds?page=' . ($currentPage - 1))
                : null,
        ];

        return Inertia::render('frontend/feed', [
            'posts' => $pagination,
            'auth'  => [
                // Inclure les rôles pour que HorizontalNavbar (userHasRole()) fonctionne
                'user' => tap(auth()->user()->load('roles'), fn ($u) => null),
            ],
            'likes'         => null,
            'comments'      => null,
            'commentsCount' => null,
            'settings'      => $this->settings->publicSettings(),
        ]);
    }
}