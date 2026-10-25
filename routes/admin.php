<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\ModeratorController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\PlatformSettingsController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SpecializationController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\SponsorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==========================================
// ROUTES ADMIN - SANS MIDDLEWARE ICI
// ==========================================
// Les middlewares sont gérés dans les contrôleurs via HasMiddleware

Route::prefix('admin')->name('admin.')->group(function () {
    
    // Tableau de bord admin
    Route::get('/dashboard', [AdminController::class, 'dashboard'])
        ->name('dashboard');
    
    
    // ========================================
    // GESTION DES UTILISATEURS
    // ========================================
    Route::get('/users', [UserManagementController::class, 'index'])
        ->name('users');
    
    Route::get('/users/{user}', [UserManagementController::class, 'show'])
        ->name('users.show');
    
    // Route pour attribuer un rôle
    Route::post('/users/{user}/assign-role', [UserManagementController::class, 'assignRole'])
        ->name('users.assign-role');
    
    // Route pour retirer un rôle
    Route::delete('/users/{user}/remove-role/{role}', [UserManagementController::class, 'removeRole'])
        ->name('users.remove-role');
    
    // Vérification des tradipraticiens
    Route::post('/users/{user}/verify-practitioner', [UserManagementController::class, 'verifyPractitioner'])
        ->name('users.verify');
    
    // Promotion au statut d'expert
    Route::post('/users/{user}/promote', [UserManagementController::class, 'promoteToExpert'])
        ->name('users.promote');
    
    // Activer/Désactiver un compte
    Route::post('/users/{user}/toggle-active', [UserManagementController::class, 'toggleUserStatus'])
        ->name('users.toggle');
    
    // Bannir/Débannir
    Route::post('/users/{user}/ban', [UserManagementController::class, 'ban'])
        ->name('users.ban');
    
    Route::post('/users/{user}/unban', [UserManagementController::class, 'unban'])
        ->name('users.unban');
    
    // Supprimer un utilisateur
    Route::delete('/users/{user}', [UserManagementController::class, 'deleteUser'])
        ->name('users.delete');
    
    // Exporter les utilisateurs
    Route::get('/users/export', [UserManagementController::class, 'exportUsers'])
        ->name('users.export');
    

    // ========================================
    // GESTION DES POSTS (via AdminController)
    // ========================================
    Route::get('/posts', [PostController::class, 'posts'])
        ->name('posts');
    
    Route::delete('/posts/{post}', [PostController::class, 'deletePost'])
        ->name('posts.delete');
    
    Route::post('/posts/bulk-delete', [PostController::class, 'bulkDeletePosts'])
    ->name('posts.bulk-delete');

    Route::get('/posts/{post}/shares', [PostController::class, 'getShares'])
    ->name('posts.shares');
    
    // ========================================
    // STATISTIQUES
    // ========================================
    Route::get('/analytics', [AnalyticsController::class, 'analytics'])
        ->name('analytics');

    // ==========================================
    // ROUTES RÔLES
    // ==========================================
    
    // Page principale avec liste des rôles et permissions
    Route::get('/roles', [RoleController::class, 'index'])
        ->name('roles');
    
    // Créer un rôle
    Route::post('/roles', [RoleController::class, 'store'])
        ->name('roles.store');
    
    // Modifier un rôle
    Route::put('/roles/{role}', [RoleController::class, 'update'])
        ->name('roles.update');
    
    // Supprimer un rôle
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
        ->name('roles.destroy');
    
    // Synchroniser les permissions d'un rôle
    Route::post('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])
        ->name('roles.sync-permissions');
    
    // ==========================================
    // ROUTES PERMISSIONS
    // ==========================================
    
    // Liste des permissions (API pour usage interne)
    Route::get('/permissions', [PermissionController::class, 'index'])
        ->name('permissions.index');
    
    // Créer une permission
    Route::post('/permissions', [PermissionController::class, 'store'])
        ->name('permissions.store');
    
    // Modifier une permission
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])
        ->name('permissions.update');
    
    // Supprimer une permission
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])
        ->name('permissions.destroy');
    
    // Créer plusieurs permissions en masse
    Route::post('/permissions/bulk', [PermissionController::class, 'bulkCreate'])
        ->name('permissions.bulk');
    
    // Obtenir les groupes de permissions
    Route::get('/permissions/groups', [PermissionController::class, 'getGroups'])
        ->name('permissions.groups');

    // ==========================================
    // ROUTES SPECIALIZATIONS
    // ==========================================
    
    Route::get('/specializations', [SpecializationController::class, 'index'])->name('specializations.index');
    Route::post('/specializations', [SpecializationController::class, 'store'])->name('specializations.store');
    Route::put('/specializations/{specialization}', [SpecializationController::class, 'update'])->name('specializations.update');
    Route::delete('/specializations/{specialization}', [SpecializationController::class, 'destroy'])->name('specializations.destroy');
    Route::get('/specializations/export', [SpecializationController::class, 'export'])->name('specializations.export');


    // // ==========================================
    // // ROUTES PARAMÉTRAGE DE LA PLATEFORME
    // // ==========================================
    // Route::get('/settings', [PlatformSettingsController::class, 'index'])->name('settings');
    // Route::post('/settings/{setting}', [PlatformSettingsController::class, 'update'])->name('settings.update');
    // Route::post('/settings/batch', [PlatformSettingsController::class, 'updateBatch'])->name('settings.batch');
    // Route::post('/settings/reset', [PlatformSettingsController::class, 'reset'])->name('settings.reset');
    
    // // Logs d'activité
    // Route::get('/activity-logs', [PlatformSettingsController::class, 'activityLogs'])->name('activity-logs');
    
    // ── Paramètres plateforme (super-admin uniquement) ──
    // Le middleware super-admin est appliqué directement dans le Controller (HasMiddleware)
    Route::prefix('settings')->name('settings.')->group(function () {

        // Afficher la page de paramétrage
        Route::get('/', [PlatformSettingsController::class, 'index'])
            ->name('index');

        // Modifier UN seul paramètre (toggles)
        Route::put('/', [PlatformSettingsController::class, 'update'])
            ->name('update');

        // Modifier PLUSIEURS paramètres (formulaire d'onglet)
        Route::post('/batch', [PlatformSettingsController::class, 'updateBatch'])
            ->name('batch');

        // Réinitialiser aux valeurs par défaut
        Route::post('/reset', [PlatformSettingsController::class, 'reset'])
            ->name('reset');

        // Exporter les paramètres en JSON (backup)
        Route::get('/export', [PlatformSettingsController::class, 'export'])
            ->name('export');
    });
   
    Route::prefix('sponsors')->name('sponsors.')->group(function () {
        Route::get   ('/',[SponsorController::class, 'indexPage']);
        Route::post  ('/',[SponsorController::class, 'store']);
        Route::get   ('/{sponsor}',[SponsorController::class, 'show']);
        Route::put   ('/{sponsor}',[SponsorController::class, 'update']);
        Route::patch ('/{sponsor}/toggle',[SponsorController::class, 'toggle']);
        Route::delete('/{sponsor}',[SponsorController::class, 'destroy']);
        Route::post('/{id}/restore', [SponsorController::class, 'restore'])->name('admin.sponsors.restore');
    });
});

// ==========================================
// ROUTES MODÉRATEUR
// ==========================================
Route::prefix('moderator')->name('moderator.')->group(function () {
    Route::get('/dashboard', [ModeratorController::class, 'dashboard'])
        ->name('moderator.dashboard');
    
    Route::get('/reports', [ModeratorController::class, 'reports'])
        ->name('moderator.reports');
    
    Route::get('/reports/{report}', [ModeratorController::class, 'showReport'])
        ->name('moderator.reports.show');
    
    Route::post('/reports/{report}/resolve', [ModeratorController::class, 'resolveReport'])
        ->name('moderator.reports.resolve');
    
    Route::get('/posts', [ModeratorController::class, 'posts'])
        ->name('moderator.posts');
    
    Route::delete('/posts/{post}', [ModeratorController::class, 'deletePost'])
        ->name('moderator.posts.delete');
    
    Route::get('/comments', [ModeratorController::class, 'comments'])
        ->name('moderator.comments');
    
    Route::delete('/comments/{comment}', [ModeratorController::class, 'deleteComment'])
        ->name('moderator.comments.delete');
});