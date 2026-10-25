<?php

use App\Http\Controllers\PractitionerController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// // ==========================================
// // ROUTES TRADIPRATICIENS (Vérifier le type de compte)
// // ==========================================
// Route::middleware(['auth', 'accounttype:practitioner,expert'])->group(function () {
//     Route::get('/practitioner/dashboard', [PractitionerController::class, 'dashboard'])
//         ->name('practitioner.dashboard');
    
//     Route::get('/practitioner/appointments', [PractitionerController::class, 'appointments'])
//         ->name('practitioner.appointments');
// });

// // ==========================================
// // ROUTES EXPERTS UNIQUEMENT (Type de compte)
// // ==========================================
// Route::middleware(['auth', 'accounttype:expert'])->group(function () {
//     Route::get('/expert/certifications', [PractitionerController::class, 'certifications'])
//         ->name('expert.certifications');
// });

// // ==========================================
// // ROUTES COMBINÉES (Rôle + Type de compte)
// // ==========================================
// // Exemple : Un tradipraticien qui est aussi modérateur
// Route::middleware(['auth', 'role:moderator', 'accounttype:practitioner'])->group(function () {
//     Route::get('/practitioner-moderator/dashboard', [PractitionerController::class, 'moderatorDashboard'])
//         ->name('practitioner.moderator.dashboard');
// });
    Route::middleware('auth')->group(function () {
        
        Route::get('/user/stats', [UserController::class, 'stats']);
    });