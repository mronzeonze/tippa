<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DiscoverController extends Controller
{
    /**
     * Slugs des rôles à exclure de la découverte.
     * Ces comptes sont des comptes d'administration/modération et ne doivent
     * pas apparaître dans les résultats publics de la plateforme.
     */
    private const EXCLUDED_ROLE_SLUGS = ['super-admin', 'admin', 'moderator'];

    /**
     * Afficher la page de découverte avec suggestions
     * GET /discover
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $search      = $request->get('search', '');

        // ── Requête de base ────────────────────────────────────────────────────
        // Exclure :
        //   1. L'utilisateur connecté lui-même
        //   2. Tout utilisateur possédant un rôle d'administration ou de modération
        $query = User::where('id', '!=', $currentUser->id)
                     ->whereDoesntHave('roles', function ($q) {
                         $q->whereIn('slug', self::EXCLUDED_ROLE_SLUGS);
                     });

        // ── Filtre de recherche textuelle ─────────────────────────────────────
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                  ->orWhere('username',  'LIKE', "%{$search}%")
                  ->orWhere('bio',       'LIKE', "%{$search}%")
                  ->orWhere('location',  'LIKE', "%{$search}%")
                  ->orWhere('email',     'LIKE', "%{$search}%");
            });
        }

        // ── Pagination ────────────────────────────────────────────────────────
        $users = $query
            ->select('id', 'full_name', 'username', 'bio', 'profile_picture', 'location')
            ->paginate(50);

        // ── Enrichir chaque utilisateur avec ses méta-données sociales ─────────
        $users->getCollection()->transform(function ($user) use ($currentUser) {
            return [
                'id'                  => $user->id,
                'full_name'           => $user->full_name,
                'username'            => $user->username,
                'bio'                 => $user->bio,
                'profile_picture'     => $user->profile_picture,
                'location'            => $user->location,
                'is_connected'        => $currentUser->isConnectedWith($user->id),
                'has_pending_request' => $currentUser->hasPendingConnectionWith($user->id),
                'is_following'        => $currentUser->isFollowing($user->id),
                'followers_count'     => $user->followers()->count(),
                'following_count'     => $user->following()->count(),
                'posts_count'         => $user->posts()->count(),
            ];
        });

        // ── Suggestions (seulement si pas de recherche active) ────────────────
        // Les mêmes règles d'exclusion de rôles s'appliquent aux suggestions.
        $suggestions = [];

        if (empty($search)) {
            $suggestions = User::where('id', '!=', $currentUser->id)
                ->whereDoesntHave('roles', function ($q) {
                    $q->whereIn('slug', self::EXCLUDED_ROLE_SLUGS);
                })
                ->whereNotIn('id', function ($query) use ($currentUser) {
                    // Exclure les utilisateurs déjà connectés (connexion acceptée)
                    $query->select('to_user_id')
                          ->from('connections')
                          ->where('from_user_id', $currentUser->id)
                          ->where('status', 'accepted')
                          ->union(
                              DB::table('connections')
                                  ->select('from_user_id')
                                  ->where('to_user_id', $currentUser->id)
                                  ->where('status', 'accepted')
                          );
                })
                ->withCount('followers')
                ->orderBy('followers_count', 'desc')
                ->limit(6)
                ->get()
                ->map(function ($user) use ($currentUser) {
                    return [
                        'id'              => $user->id,
                        'full_name'       => $user->full_name,
                        'username'        => $user->username,
                        'bio'             => $user->bio,
                        'profile_picture' => $user->profile_picture,
                        'followers_count' => $user->followers_count,
                        'is_following'    => $currentUser->isFollowing($user->id),
                    ];
                });
        }

        return Inertia::render('frontend/discover', [
            'users'        => $users,
            'suggestions'  => $suggestions,
            'search_query' => $search,
            'auth' => [
                'user' => tap(auth()->user()->load('roles'), fn ($u) => null),
            ]
        ]);
    }

    /**
     * Recherche AJAX pour l'autocomplétion
     * GET /api/discover/search?q=xxx
     *
     * Les rôles d'administration/modération sont également exclus de l'autocomplétion.
     */
    public function search(Request $request)
    {
        $search      = $request->get('q', '');
        $currentUser = auth()->user();

        if (strlen($search) < 2) {
            return response()->json(['results' => []]);
        }

        $results = User::where('id', '!=', $currentUser->id)
            ->whereDoesntHave('roles', function ($q) {
                $q->whereIn('slug', self::EXCLUDED_ROLE_SLUGS);
            })
            ->where(function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                  ->orWhere('username', 'LIKE', "%{$search}%");
            })
            ->select('id', 'full_name', 'username', 'profile_picture')
            ->limit(5)
            ->get();

        return response()->json(['results' => $results]);
    }
}