<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConnectionController extends Controller
{
    /**
     * Afficher la page des connexions avec onglets
     * GET /connections
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $tab = $request->get('tab', 'Connexions'); // Onglet par défaut
        
        // Récupérer les connexions acceptées (amis)
        $connections = $user->connections()
                           ->with('followers', 'following')
                           ->get()
                           ->map(function ($connectedUser) use ($user) {
                               return [
                                   'user' => $connectedUser,
                                   'is_connected' => true,
                                   'followers_count' => $connectedUser->followers()->count(),
                                   'following_count' => $connectedUser->following()->count(),
                               ];
                           });
        
        // Récupérer les followers (ceux qui suivent l'utilisateur)
        $followers = $user->followers()
                         ->get()
                         ->map(function ($follower) use ($user) {
                             return [
                                 'user' => $follower,
                                 'is_connected' => $user->isConnectedWith($follower->id),
                                 'has_pending_request' => $user->hasPendingConnectionWith($follower->id),
                                 'is_following_back' => $user->isFollowing($follower->id),
                             ];
                         });
        
        // Récupérer les following (ceux que l'utilisateur suit)
        $following = $user->following()
                         ->get()
                         ->map(function ($followedUser) use ($user) {
                             return [
                                 'user' => $followedUser,
                                 'is_connected' => $user->isConnectedWith($followedUser->id),
                                 'has_pending_request' => $user->hasPendingConnectionWith($followedUser->id),
                                 'is_follower' => $followedUser->isFollowing($user->id),
                             ];
                         });
        
        // Récupérer les demandes en attente (reçues)
        $pendingRequests = $user->pendingConnectionRequests()
                                ->get()
                                ->map(function ($connection) use ($user) {
                                    return [
                                        'connection_id' => $connection->id,
                                        'user' => $connection->sender,
                                        'created_at' => $connection->created_at,
                                        'is_following' => $user->isFollowing($connection->sender->id),
                                    ];
                                });
        
        // Récupérer les demandes envoyées (en attente)
        $sentRequests = $user->sentPendingConnections()
                            ->get()
                            ->map(function ($connection) {
                                return [
                                    'connection_id' => $connection->id,
                                    'user' => $connection->receiver,
                                    'created_at' => $connection->created_at,
                                ];
                            });
        
        // Compteurs
        $counts = [
            'connections' => $connections->count(),
            'followers' => $followers->count(),
            'following' => $following->count(),
            'pending' => $pendingRequests->count(),
        ];
        
        return Inertia::render('frontend/connections', [
            'connections' => $connections,
            'followers' => $followers,
            'following' => $following,
            'pending_requests' => $pendingRequests,
            'sent_requests' => $sentRequests,
            'counts' => $counts,
            'active_tab' => $tab,
            'auth' => [
                'user' => tap(auth()->user()->load('roles'), fn ($u) => null),
            ]
        ]);
    }

    /**
     * Envoyer une demande de connexion
     * POST /connections
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|uuid|exists:users,id',
        ]);
        
        $currentUser = auth()->user();
        $targetUser = User::findOrFail($request->user_id);
        
        // Vérifier qu'on ne s'envoie pas une demande à soi-même
        if ($currentUser->id === $targetUser->id) {
            return back()->withErrors(['error' => 'You cannot connect with yourself']);
        }
        
        // Vérifier qu'il n'existe pas déjà une connexion
        if ($currentUser->hasConnectionRequestWith($targetUser->id)) {
            return back()->withErrors(['error' => 'Connection request already exists']);
        }
        
        try {
            $connection = $currentUser->sendConnectionRequestTo($targetUser);
            
            return back()->with('success', 'Connection request sent successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Accepter une demande de connexion
     * PATCH /connections/{connection}/accept
     */
    public function accept(Connection $connection)
    {
        $currentUser = auth()->user();
        
        // Vérifier que l'utilisateur est le destinataire
        if ($connection->to_user_id !== $currentUser->id) {
            abort(403, 'Unauthorized action.');
        }
        
        // Vérifier que la connexion est en attente
        if (!$connection->isPending()) {
            return back()->withErrors(['error' => 'Connection is not pending']);
        }
        
        $connection->accept();
        
        return back()->with('success', 'Connection accepted successfully');
    }

    /**
     * Rejeter/Supprimer une connexion
     * DELETE /connections/{connection}
     */
    public function destroy(Connection $connection)
    {
        $currentUser = auth()->user();
        
        // Vérifier que l'utilisateur est impliqué dans la connexion
        if ($connection->from_user_id !== $currentUser->id && 
            $connection->to_user_id !== $currentUser->id) {
            abort(403, 'Unauthorized action.');
        }
        
        $connection->delete();
        
        return back()->with('success', 'Connection removed successfully');
    }

    /**
     * Supprimer une connexion avec un utilisateur spécifique
     * DELETE /connections/remove/{user}
     */
    public function remove(User $user)
    {
        $currentUser = auth()->user();
        
        try {
            $currentUser->removeConnectionWith($user);
            
            return back()->with('success', 'Connection removed successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to remove connection']);
        }
    }

    /**
     * Obtenir le statut de connexion avec un utilisateur
     * GET /connections/status/{user}
     */
    public function status(User $user)
    {
        $currentUser = auth()->user();
        
        $connection = $currentUser->getConnectionWith($user);
        
        return response()->json([
            'is_connected' => $currentUser->isConnectedWith($user->id),
            'has_request' => $currentUser->hasConnectionRequestWith($user->id),
            'is_pending' => $currentUser->hasPendingConnectionWith($user->id),
            'connection' => $connection,
        ]);
    }
}