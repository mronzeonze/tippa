<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\ContentReportController;
use App\Http\Controllers\DiscoverController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\SponsorController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\UserController;
use App\Services\PlatformSettingsService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

//===============================
    // Page Apropos,Aide,Confidentialité,Conditions
    Route::get('/about', function () {
        return Inertia::render('frontend/about', [
            'settings' => app(PlatformSettingsService::class)->all(),
        ]);
    })->name('about');
    Route::get('/help', function () {
        return Inertia::render('frontend/help',[
            'settings' => app(PlatformSettingsService::class)->all(),
        ]);
    })->name('help');
    Route::get('/privacy', function () {
        return Inertia::render('frontend/privacy',[
            'settings' => app(PlatformSettingsService::class)->all(),
        ]);
    })->name('privacy');
    Route::get('/terms', function () {
        return Inertia::render('frontend/terms',[
            'settings' => app(PlatformSettingsService::class)->all(),
        ]);
    })->name('terms');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // ========================================
    // FEED & POSTS
    // ========================================
    Route::get('/feeds', [FeedController::class, 'index'])->name('feed.index');
    Route::get('/create-post', [PostController::class, 'create'])->name('create-post');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
    //=====================================
    // Détails d'un post (API)
    Route::get('/api/posts/{post}/details', [PostController::class, 'getDetails'])
    ->name('posts.details');

    // Likes
    Route::get('/posts/{post}/likes', [PostController::class, 'getLikes'])->name('posts.likes');
    Route::post('/posts/{post}/like', [PostController::class, 'toggleLike'])->name('posts.like');

    // Commentaires
    Route::get('/posts/{post}/comments', [CommentController::class, 'index'])->name('posts.comments');
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::post('/comments/{comment}/like', [CommentController::class, 'toggleLike'])->name('comments.like');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // Partages
    Route::post('/posts/{post}/repost', [ShareController::class, 'repost'])->name('posts.repost');
    Route::post('/posts/{post}/share', [ShareController::class, 'shareExternal'])->name('posts.share');
    Route::get('/posts/{post}/share-stats', [ShareController::class, 'getShareStats'])->name('posts.share-stats');

    // ========================================
    // MESSAGES
    // ========================================
    Route::prefix('messages')->group(function () {
        // Liste des conversations (page principale)
        Route::get('', [MessageController::class, 'index'])->name('messages.index');
        
        //  Envoyer un message
        Route::post('', [MessageController::class, 'store'])->name('messages.store');
        
        //  Marquer un message spécifique comme lu
        Route::patch('/{message}/mark-as-read', [MessageController::class, 'markAsRead'])
            ->name('messages.mark-as-read');
        
        // Marquer tous les messages d'un utilisateur comme lus
        Route::patch('/mark-all-read/{user}', [MessageController::class, 'markAllAsRead'])
            ->name('messages.mark-all-read');
        
        // Supprimer un message
        Route::delete('/{message}', [MessageController::class, 'destroy'])
            ->name('messages.destroy');
        
        // Obtenir le nombre de messages non lus
        Route::get('/unread-count', [MessageController::class, 'unreadCount'])
            ->name('messages.unread-count');
        
        // Récupérer toutes les notifications
        Route::get('/notifications', [MessageController::class, 'getNotifications'])
            ->name('messages.notifications');
        
        // Marquer une notification comme lue
        Route::post('/notifications/{notification}/mark-as-read', [MessageController::class, 'markNotificationAsRead'])
            ->name('messages.notifications.mark-read');
    });

    // Routes API (JSON)
    Route::prefix('api')->group(function () {
        
        // Récupérer les conversations récentes pour le widget sidebar
        // GET /api/recent-messages
        Route::get('/recent-messages', [MessageController::class, 'getRecentMessages'])
            ->name('api.messages.recent');
        
        // Récupérer les messages d'une conversation (JSON)
        // GET /api/messages/{user}
        Route::get('/messages/{user}', [MessageController::class, 'getMessagesApi'])
            ->name('api.messages.show');
        
        // Marquer un message comme lu
        // PATCH /api/messages/{message}/mark-as-read
        Route::patch('/messages/{message}/mark-as-read', [MessageController::class, 'markAsRead'])
            ->name('api.messages.mark-read');
        
        // Marquer tous les messages d'une conversation comme lus
        // PATCH /api/messages/mark-all-read/{user}
        Route::patch('/messages/mark-all-read/{user}', [MessageController::class, 'markAllAsRead'])
            ->name('api.messages.mark-all-read');
        
        // Obtenir le nombre de messages non lus
        // GET /api/messages/unread-count
        Route::get('/messages/unread-count', [MessageController::class, 'unreadCount'])
            ->name('api.messages.unread-count');
        
        // Récupérer les notifications non lues
        // GET /api/notifications/messages
        Route::get('/notifications/messages', [MessageController::class, 'getNotifications'])
            ->name('api.notifications.messages');
        
        // Marquer une notification comme lue
        // PATCH /api/notifications/{notification}/read
        Route::patch('/notifications/{notification}/read', [MessageController::class, 'markNotificationAsRead'])
            ->name('api.notifications.mark-read');

        
        //────────────────────────────────────────────────────────────
        // Rechercher des contacts disponibles pour démarrer une nouvelle conversation.
        // DOIT être déclaré AVANT le wildcard /{user} pour éviter les conflits de routing.
        // GET /api/messages/contacts/search?query=xxx
        Route::get('/messages/contacts/search', [MessageController::class, 'searchContacts'])
            ->name('api.messages.contacts.search');
        // ──────────────────────────────────────────────────────────────────────

    });

    // ========================================
    // API MESSAGES - Routes JSON
    // ========================================
    // 💬 Récupérer les messages d'une conversation (JSON)
    Route::get('/api/messages/{user}', [MessageController::class, 'getMessagesApi'])
        ->name('api.messages.get');
        
    // ========================================
    // CONNECTIONS
    // ========================================
    Route::get('/connections', [ConnectionController::class, 'index'])->name('connections.index');
    Route::post('/connections', [ConnectionController::class, 'store'])->name('connections.store');
    Route::patch('/connections/{connection}/accept', [ConnectionController::class, 'accept'])->name('connections.accept');
    Route::delete('/connections/{connection}', [ConnectionController::class, 'destroy'])->name('connections.destroy');
    Route::delete('/connections/remove/{user}', [ConnectionController::class, 'remove'])->name('connections.remove');
    Route::get('/connections/status/{user}', [ConnectionController::class, 'status'])->name('connections.status');

    // ========================================
    // DISCOVER
    // ========================================
    Route::get('/discover', [DiscoverController::class, 'index'])->name('discover.index');
    Route::get('/api/discover/search', [DiscoverController::class, 'search'])->name('discover.search');

    // ========================================
    // USERS (Follow/Unfollow)
    // ========================================
    Route::post('/users/{user}/follow', [UserController::class, 'follow'])->name('users.follow');
    Route::post('/users/{user}/unfollow', [UserController::class, 'unfollow'])->name('users.unfollow');
    Route::get('/api/users/suggestions', [UserController::class, 'suggestions'])->name('users.suggestions');

    // ========================================
    // STORIES
    // ========================================
    Route::prefix('api')->group(function () {
    // Récupérer toutes les stories
    Route::get('/stories', [StoryController::class, 'index'])->name('stories.index');
    
    // Créer une story
    Route::post('/stories', [StoryController::class, 'store'])->name('stories.store');
    
    // Voir les stories d'un utilisateur
    Route::get('/stories/{user}', [StoryController::class, 'show'])->name('stories.show');
    
    // Supprimer une story
    Route::delete('/stories/{story}', [StoryController::class, 'destroy'])->name('stories.destroy');
    });
    // ========================================
    // SIGNALEMENTS
    // ========================================
    Route::post('/posts/{post}/report', [ContentReportController::class, 'reportPost'])->name('posts.report');
    Route::post('/comments/{comment}/report', [ContentReportController::class, 'reportComment'])->name('comments.report');
    Route::post('/api/reports/check', [ContentReportController::class, 'checkReport'])->name('reports.check');

    // ========================================
    // SPONSORS
    // ========================================
    // Récupérer les sponsors actifs (utilisé par la sidebar)
    Route::get('/sponsors/active', [SponsorController::class, 'index']);
    // Tracking métriques
    Route::post('/sponsors/{sponsor}/view',  [SponsorController::class, 'trackView']);
    Route::post('/sponsors/{sponsor}/click', [SponsorController::class, 'trackClick']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/user.php';
require __DIR__.'/moderator.php';