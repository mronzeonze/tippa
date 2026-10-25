<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    
    /**
     * Suivre un utilisateur
     * POST /users/{user}/follow
     */
    public function follow(User $user)
    {
        $currentUser = auth()->user();
        
        // Vérifier qu'on ne se suit pas soi-même
        if ($currentUser->id === $user->id) {
            return back()->withErrors(['error' => 'You cannot follow yourself']);
        }
        
        // Vérifier si déjà suivi
        if ($currentUser->isFollowing($user->id)) {
            return back()->withErrors(['error' => 'Already following this user']);
        }
        
    // La méthode follow() gère maintenant les deux tables
    $currentUser->follow($user->id);
        
        return back()->with('success', 'User followed successfully');
    }

    /**
     * Ne plus suivre un utilisateur
     * POST /users/{user}/unfollow
     */
    public function unfollow(User $user)
    {
        $currentUser = auth()->user();
        
        // Vérifier qu'on suit cet utilisateur
        if (!$currentUser->isFollowing($user->id)) {
            return back()->withErrors(['error' => 'You are not following this user']);
        }
        
            // La méthode unfollow() gère maintenant les deux tables
    $currentUser->unfollow($user->id);
        return back()->with('success', 'User unfollowed successfully');
    }

    /**
     * Obtenir des suggestions d'utilisateurs à suivre
     * GET /users/suggestions
     */
    public function suggestions(Request $request)
    {
        $currentUser = auth()->user();
        $limit = $request->get('limit', 10);
        
        // Utilisateurs populaires que l'utilisateur ne suit pas
        $suggestions = User::where('id', '!=', $currentUser->id)
            ->whereNotIn('id', function($query) use ($currentUser) {
                $query->select('following_id')
                      ->from('followings')
                      ->where('user_id', $currentUser->id);
            })
            ->withCount('followers')
            ->orderBy('followers_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($user) use ($currentUser) {
                return [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'username' => $user->username,
                    'bio' => $user->bio,
                    'profile_picture' => $user->profile_picture,
                    'followers_count' => $user->followers_count,
                    'is_following' => $currentUser->isFollowing($user->id),
                    'is_connected' => $currentUser->isConnectedWith($user->id),
                ];
            });
        
        return response()->json([
            'suggestions' => $suggestions
        ]);
    }

        /**
     * ============================================================
     * Obtenir les statistiques en temps réel de l'utilisateur connecté
     * GET /api/user/stats
     * ============================================================
     *
     * Retourne :
     *  - connections_count  : nombre de connexions (amis) acceptées
     *  - profile_views      : total des vues du profil
     *  - new_views          : vues depuis la dernière consultation (badge "nouveau")
     *  - followers_count    : nombre d'abonnés
     *  - following_count    : nombre d'abonnements
     *
     * Utilisé par ProfileSidebar pour afficher des données fraîches
     * sans rechargement de page (polling toutes les 60 secondes).
     */
    public function stats()
    {
        $user = auth()->user();

        // ── 1. Connexions acceptées ──────────────────────────────────────
        // On passe par la relation définie sur le modèle User
        // (inclut from_user_id et to_user_id avec status = 'accepted')
        $connectionsCount = $user->connections()->count();

        // ── 2. Vues du profil ────────────────────────────────────────────
        // profile_views est incrémenté à chaque visite du profil par un tiers
        // (voir ProfileController@show → $user->increment('profile_views'))
        $profileViews = (int) $user->profile_views;

        // ── 3. Nouvelles vues depuis la dernière lecture ─────────────────
        // On stocke profile_views_last_seen dans la session pour calculer
        // le delta affiché comme badge "nouveau" côté client.
        $lastSeen     = session('profile_views_last_seen', $profileViews);
        $newViews     = max(0, $profileViews - $lastSeen);

        // Mettre à jour le repère session après lecture
        session(['profile_views_last_seen' => $profileViews]);

        // ── 4. Followers / Following (bonus sidebar) ─────────────────────
        $followersCount = $user->followers()->count();
        $followingCount = $user->following()->count();
        return response()->json([
            'connections_count' => $connectionsCount,
            'profile_views'     => $profileViews,
            'new_views'         => $newViews,        // badge rouge si > 0
            'followers_count'   => $followersCount,
            'following_count'   => $followingCount,
            'fetched_at'        => now()->toIso8601String(), // pour debug / cache-busting
        ]);
    }
}