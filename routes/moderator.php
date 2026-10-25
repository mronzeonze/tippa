<?php

use App\Http\Controllers\Admin\ModeratorController;
use Illuminate\Support\Facades\Route;

// Groupe de routes protégées par le middleware de modération

Route::prefix('moderator')->name('moderator.')->group(function () {
    
    // 📊 Dashboard
    Route::get('/dashboard', [ModeratorController::class, 'dashboard'])
        ->name('dashboard');

    // 🚨 Gestion des signalements
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ModeratorController::class, 'reports'])
            ->name('index');
        Route::get('/{report}', [ModeratorController::class, 'showReport'])
            ->name('show');
        Route::post('/{report}/resolve', [ModeratorController::class, 'resolveReport'])
            ->name('resolve');
    });

    // 📝 Modération des posts - AMÉLIORÉ
    Route::prefix('posts')->name('posts.')->group(function () {
        Route::get('/', [ModeratorController::class, 'posts'])
            ->name('index');
        Route::delete('/{post}', [ModeratorController::class, 'deletePost'])
            ->name('delete');
        // ✨ NOUVEAU: Suppression en masse
        Route::post('/bulk-delete', [ModeratorController::class, 'bulkDeletePosts'])
            ->name('bulk-delete');

            // Approuver une publication
        Route::post('/{post}/approve', [ModeratorController::class, 'approvePost'])
            ->name('posts.approve');
    });

    
    
    

    // 💬 Modération des commentaires - AMÉLIORÉ
    Route::prefix('comments')->name('comments.')->group(function () {
        Route::get('/', [ModeratorController::class, 'comments'])
            ->name('index');
        Route::delete('/{comment}', [ModeratorController::class, 'deleteComment'])
            ->name('delete');
        // ✨ NOUVEAU: Suppression en masse
        Route::post('/bulk-delete', [ModeratorController::class, 'bulkDeleteComments'])
            ->name('bulk-delete');
        
            // Approuver un commentaire
        Route::post('/{comment}/approve', [ModeratorController::class, 'approveComment'])
            ->name('comments.approve');
    });

    // 📈 Statistiques - AMÉLIORÉ
    Route::get('/statistics', [ModeratorController::class, 'statistics'])
        ->name('statistics');
    
    // ✨ NOUVEAU: Export des statistiques
    Route::get('/statistics/export', [ModeratorController::class, 'exportStatistics'])
        ->name('statistics.export');
    
    // ✨ NOUVEAU: Recherche avancée
    Route::post('/search', [ModeratorController::class, 'advancedSearch'])
        ->name('search');
});