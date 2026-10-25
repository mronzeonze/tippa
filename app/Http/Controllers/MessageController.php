<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Afficher la liste des conversations
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $selectedUserId = $request->get('selectedUserId');

        $conversations = $user->conversations()->map(function ($otherUser) use ($user) {
            $lastMessage = Message::betweenUsers($user->id, $otherUser->id)
                ->recent()
                ->first();

            $unreadCount = Message::where('from_user_id', $otherUser->id)
                ->where('to_user_id', $user->id)
                ->unread()
                ->count();

            return [
                'user'         => $otherUser,
                'last_message' => $lastMessage,
                'unread_count' => $unreadCount,
            ];
        });

        $conversations = $conversations->sortByDesc('last_message.created_at')->values();

        $unreadTotal = Message::where('to_user_id', $user->id)
            ->unread()
            ->count();

        return Inertia::render('frontend/messages', [
            'conversations'    => $conversations,
            'unread_total'     => $unreadTotal,
            'selected_user_id' => $selectedUserId,
            'auth' => [
                'user' => tap(auth()->user()->load('roles'), fn ($u) => null),
            ]
        ]);
    }

    /**
     * Afficher une conversation spécifique
     */
    public function show(User $user)
    {
        $currentUser = auth()->user();

        $messages = Message::betweenUsers($currentUser->id, $user->id)
            ->with([
                'sender:id,full_name,username,profile_picture',
                'receiver:id,full_name,username,profile_picture',
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        // Marquer comme lus
        Message::where('from_user_id', $user->id)
            ->where('to_user_id', $currentUser->id)
            ->unread()
            ->update(['seen' => true]);

        return Inertia::render('frontend/chat-box', [
            'conversation_with' => $user,
            'messages'          => $messages,
            'auth'              => [
                'user' => $currentUser,
            ],
        ]);
    }

    /**
     * Envoyer un message avec notifications en temps réel
     */
    public function store(Request $request)
    {
        $request->validate([
            'to_user_id' => 'required|uuid|exists:users,id',
            'text'       => 'required_without:media|string|max:5000',
            'media'      => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ]);

        $currentUser = auth()->user();
        $receiver    = User::findOrFail($request->to_user_id);

        // Gérer l'upload de média
        $mediaUrl    = null;
        $messageType = 'text';

        if ($request->hasFile('media')) {
            $path     = $request->file('media')->store('messages', 'public');
            $mediaUrl = asset('storage/' . $path);
            $messageType = 'image';
        }

        // Créer le message
        $message = Message::create([
            'id'           => Str::uuid()->toString(),
            'from_user_id' => $currentUser->id,
            'to_user_id'   => $receiver->id,
            'text'         => $request->text,
            'message_type' => $messageType,
            'media_url'    => $mediaUrl,
        ]);

        // Charger les relations
        $message->load([
            'sender:id,full_name,username,profile_picture',
            'receiver:id,full_name,username,profile_picture',
        ]);

        // Déclencher l'événement temps réel
        broadcast(new MessageSent($message))->toOthers();

        // Enregistrer la notification en base de données
        $receiver->notify(new NewMessageNotification($message));

        return redirect()->back();
    }

    /**
     * Marquer un message comme lu
     */
    public function markAsRead(Message $message)
    {
        if ($message->to_user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $message->markAsSeen();

        return response()->json([
            'success' => true,
            'message' => 'Message marked as read',
        ]);
    }

    /**
     * Marquer tous les messages d'une conversation comme lus
     */
    public function markAllAsRead(User $user)
    {
        $currentUser = auth()->user();

        Message::where('from_user_id', $user->id)
            ->where('to_user_id', $currentUser->id)
            ->unread()
            ->update(['seen' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All messages marked as read',
        ]);
    }

    /**
     * Supprimer un message
     */
    public function destroy(Message $message)
    {
        if ($message->from_user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        if ($message->media_url) {
            $mediaPath = str_replace(asset('storage/'), '', $message->media_url);
            \Storage::disk('public')->delete($mediaPath);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully',
        ]);
    }

    /**
     * Obtenir le nombre de messages non lus
     */
    public function unreadCount()
    {
        $count = auth()->user()->unread_messages_count;

        return response()->json([
            'unread_count' => $count,
        ]);
    }

    /**
     * Récupérer toutes les notifications non lues
     */
    public function getNotifications()
    {
        $notifications = auth()->user()
            ->unreadNotifications()
            ->where('type', 'App\Notifications\NewMessageNotification')
            ->get()
            ->map(function ($notification) {
                return [
                    'id'         => $notification->id,
                    'data'       => $notification->data,
                    'created_at' => $notification->created_at,
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'count'         => $notifications->count(),
        ]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markNotificationAsRead($notificationId)
    {
        $notification = auth()->user()
            ->notifications()
            ->findOrFail($notificationId);

        $notification->markAsRead();

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Récupérer les messages en JSON (pour l'interface style LinkedIn)
     * GET /api/messages/{user}
     */
    public function getMessagesApi(User $user)
    {
        $currentUser = auth()->user();

        // Récupérer tous les messages entre les deux utilisateurs
        $messages = Message::betweenUsers($currentUser->id, $user->id)
            ->with([
                'sender:id,full_name,username,profile_picture',
                'receiver:id,full_name,username,profile_picture',
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        // Marquer tous les messages reçus comme lus
        Message::where('from_user_id', $user->id)
            ->where('to_user_id', $currentUser->id)
            ->unread()
            ->update(['seen' => true]);

        return response()->json([
            'messages' => $messages,
            'user'     => $user,
        ]);
    }

    /**
     * Récupérer les conversations récentes (pour le widget sidebar)
     * GET /api/recent-messages
     */
    public function getRecentMessages()
    {
        $user = auth()->user();

        // Récupérer les 5 dernières conversations
        $conversations = $user->conversations()
            ->map(function ($otherUser) use ($user) {
                $lastMessage = Message::betweenUsers($user->id, $otherUser->id)
                    ->recent()
                    ->first();

                $unreadCount = Message::where('from_user_id', $otherUser->id)
                    ->where('to_user_id', $user->id)
                    ->unread()
                    ->count();

                return [
                    'user'         => $otherUser,
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount,
                ];
            })
            ->filter(fn($conv) => $conv['last_message'] !== null)
            ->sortByDesc('last_message.created_at')
            ->take(5)
            ->values();

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    /**
     * Rechercher des contacts disponibles pour démarrer une nouvelle conversation.
     *
     * Inclut les connexions acceptées, les abonnés (followers) et les abonnements
     * (following) de l'utilisateur connecté. Les utilisateurs déjà présents dans
     * les conversations existantes sont filtrés en option côté client.
     *
     * GET /api/messages/contacts/search?query=xxx
     *
     * @param  Request  $request  Paramètre optionnel `query` pour filtrer par nom/username.
     * @return \Illuminate\Http\JsonResponse  Liste de contacts { id, full_name, username, profile_picture }
     */
    public function searchContacts(Request $request)
    {
        $currentUser = auth()->user();
        $query       = trim($request->get('query', ''));

        // ── 1. Collecter tous les IDs des contacts joignables ─────────────────
        // On fusionne connexions acceptées + abonnés + abonnements
        // puis on déduplique pour éviter des doublons dans les résultats.

        $connectionIds = $currentUser->connections()->pluck('id');
        $followerIds   = $currentUser->followers()->pluck('id');
        $followingIds  = $currentUser->following()->pluck('id');

        $contactIds = $connectionIds
            ->merge($followerIds)
            ->merge($followingIds)
            ->unique()
            ->reject(fn($id) => $id === $currentUser->id); // exclure soi-même

        // ── 2. Requêter les utilisateurs en base ───────────────────────────────
        $contacts = User::whereIn('id', $contactIds)
            ->when($query !== '', function ($q) use ($query) {
                // Recherche insensible à la casse sur nom complet ou username
                $q->where(function ($sub) use ($query) {
                    $sub->where('full_name', 'like', "%{$query}%")
                        ->orWhere('username', 'like', "%{$query}%");
                });
            })
            ->limit(30)
            ->get(['id', 'full_name', 'username', 'profile_picture']);

        return response()->json([
            'contacts' => $contacts,
        ]);
    }
}