<?php

namespace App\Http\Middleware;

use App\Models\Message;
use App\Services\PlatformSettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
{
    $user = $request->user();
    $unreadMessages = null;
    $settings = app(PlatformSettingsService::class);
    
    if ($user) {
        // Récupérer conversations avec messages non lus
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
                    'user' => $otherUser,
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount,
                ];
            })
            ->filter(fn($conv) => $conv['unread_count'] > 0)
            ->sortByDesc('last_message.created_at')
            ->take(5)
            ->values();
        
        $unreadTotal = Message::where('to_user_id', $user->id)
            ->unread()
            ->count();

        $notifications = $conversations->map(function ($conv) {
            return [
                'sender' => [
                    'id' => $conv['user']->id,
                    'full_name' => $conv['user']->full_name,
                    'username' => $conv['user']->username,
                    'profile_picture' => $conv['user']->profile_picture,
                ],
                'message' => [
                    'text' => $conv['last_message']->text ?? '',
                    'message_type' => $conv['last_message']->message_type ?? 'text',
                    'created_at' => $conv['last_message']->created_at ?? now(),
                ],
                'unread_count' => $conv['unread_count'],
            ];
        });

        $unreadMessages = [
            'notifications' => $notifications,
            'unread_count' => $unreadTotal,
        ];
    }

    return array_merge(parent::share($request), [
        // ── Utilisateur connecté ──────────────────────────────────
        'auth' => [
            'user' => $request->user(),
        ],
        'unread_messages' => $unreadMessages, // ← Ajouter cette ligne

        // ── Flash messages (succès, erreurs, infos) ───────────────
        'flash' => [
            'success' => session('success'),
            'error'   => session('error'),
            'info'    => session('info'),
            'warning' => session('warning'),
        ],

        // ── Paramètres publics de la plateforme ───────────────────
        // Disponibles dans TOUS les composants React via usePage().props.app_settings
        // Seuls les paramètres is_public:true sont exposés côté client
        'app_settings' => fn () => $settings->publicSettings(),

        // ── Informations de la plateforme ─────────────────────────
        'app' => [
            'name'        => $settings->appName(),
            'description' => $settings->appDescription(),
        ],

        // ── Statut global de la plateforme ────────────────────────
        // Utile pour afficher des bannières, bloquer des actions, etc.
        'platform_status' => fn () => [
            'maintenance_mode'   => $settings->isMaintenanceMode(),
            'registration_open'  => $settings->isRegistrationOpen(),
            'moderation_enabled' => $settings->isModerationEnabled(),
            'two_factor_enabled' => $settings->isTwoFactorEnabled(),
            'push_enabled'       => $settings->isPushNotificationsEnabled(),
        ],
    ]);
}
}
