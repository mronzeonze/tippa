<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // ========================================
    // PROFILE
    // ========================================
    Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'updateInfo'])->name('profile.updating');

    // Ajoutez ces routes dans settings.php
    Route::post('/profile/update-personal-info', [ProfileController::class, 'updatePersonalInfo']);
    Route::post('/profile/update-location', [ProfileController::class, 'updateLocation']);
    Route::post('/profile/update-professional-info', [ProfileController::class, 'updateProfessionalInfo']);
    Route::post('/profile/update-pricing', [ProfileController::class, 'updatePricing']);
    Route::post('/profile/update-specialization', [ProfileController::class, 'updateSpecialization']);
    Route::post('/profile/update-availability', [ProfileController::class, 'updateAvailability']);
    Route::post('/profile/update-trainings', [ProfileController::class, 'updateTrainings']);
    Route::post('/profile/update-social-media', [ProfileController::class, 'updateSocialMedia']);
    Route::post('/profile/update-preferences', [ProfileController::class, 'updatePreferences']);
    Route::post('/profile/upload-profile-picture', [ProfileController::class, 'uploadProfilePicture']);
    Route::post('/profile/upload-cover-photo', [ProfileController::class, 'uploadCoverPhoto']);
});
