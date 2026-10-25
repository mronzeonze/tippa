<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\PlatformSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

/**
 * AuthenticatedSessionController — Connexion avec paramètres plateforme
 *
 * Paramètres appliqués :
 *  ✅ max_login_attempts → Nombre de tentatives avant blocage temporaire
 *  ✅ two_factor_enabled  → Active ou désactive le flux 2FA
 *  ✅ session_timeout     → Durée de session (appliqué via config au login)
 */

class AuthenticatedSessionController extends Controller
{
    public function __construct(private PlatformSettingsService $settings) {}
    
    // ─────────────────────────────────────────────────────────
    // AFFICHER LA PAGE DE CONNEXION
    // ─────────────────────────────────────────────────────────

    public function create(Request $request): Response
    {
        
        return Inertia::render('auth/login', [
            'canResetPassword'  => Route::has('password.request'),
            'status'            => $request->session()->get('status'),
            'settings'      => $this->settings->publicSettings(), // ✅ Passer les paramètres au frontend
            // ✅ Passer la config 2FA au frontend
            'two_factor_enabled'=> $this->settings->isTwoFactorEnabled(),
        ]);
    }

        // ─────────────────────────────────────────────────────────
    // TRAITER LA CONNEXION
    // ─────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $loginMethod = $request->input('login_method', 'email');

        $rules = [
            'password' => 'required|string',
            'remember' => 'boolean',
        ];

        [$field, $value] = match ($loginMethod) {
            'username' => ['username', $request->input('username')],
            'phone'    => ['phone',    $request->input('phone')],
            default    => ['email',    $request->input('email')],
        };

        $rules[$field] = match ($loginMethod) {
            'username' => 'required|string',
            'phone'    => 'required|string',
            default    => 'required|email',
        };

        $validated = $request->validate($rules);

        // ✅ PARAMÈTRE : max_login_attempts — Rate limiting par IP + identifiant
        $this->checkRateLimit($request, $field, $value);

        $credentials = [$field => $value, 'password' => $request->input('password')];

        if (!Auth::attempt($credentials, $request->boolean('remember', false))) {
            // Incrémenter le compteur d'échecs
            RateLimiter::hit($this->throttleKey($request, $field, $value));

            throw ValidationException::withMessages([
                $field => __('auth.failed'),
            ]);
        }

        // Connexion réussie → effacer le compteur
        RateLimiter::clear($this->throttleKey($request, $field, $value));

        $request->session()->regenerate();

        // ✅ PARAMÈTRE : session_timeout — Configurer l'expiration de session
        $sessionTimeout = $this->settings->sessionTimeout();
        config(['session.lifetime' => $sessionTimeout]);

        $user = Auth::user();

        if ($user->is_banned) {
            Auth::logout();
            throw ValidationException::withMessages([
                $field => 'Votre compte a été suspendu. Contactez l\'administration.',
            ]);
        }

        if (!$user->is_active) {
            Auth::logout();
            throw ValidationException::withMessages([
                $field => 'Votre compte a été désactivé.',
            ]);
        }

        // ✅ PARAMÈTRE : two_factor_enabled — Vérifier si le 2FA est activé globalement
        if (
            $this->settings->isTwoFactorEnabled()
            && Features::enabled(Features::twoFactorAuthentication())
            && method_exists($user, 'hasEnabledTwoFactorAuthentication')
            && $user->hasEnabledTwoFactorAuthentication()
        ) {
            $request->session()->put([
                'login.id'       => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        return $this->redirectAfterLogin($user);
    }

        // ─────────────────────────────────────────────────────────
    // DÉCONNEXION
    // ─────────────────────────────────────────────────────────

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('success', 'Déconnexion réussie. À bientôt !');
    }

    // ─────────────────────────────────────────────────────────
    // MÉTHODES PRIVÉES
    // ─────────────────────────────────────────────────────────

    /**
     * ✅ Vérifie le rate limiting basé sur max_login_attempts.
     */
    private function checkRateLimit(Request $request, string $field, string $value): void
    {
        $maxAttempts = $this->settings->maxLoginAttempts();
        $key         = $this->throttleKey($request, $field, $value);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                $field => "Trop de tentatives de connexion. Réessayez dans {$seconds} secondes.",
            ]);
        }
    }

    /**
     * Clé unique de rate limiting : IP + identifiant.
     */
    private function throttleKey(Request $request, string $field, string $value): string
    {
        return Str::lower($value) . '|' . $request->ip();
    }

    /**
     * Redirection après connexion selon le type de compte
     */
    private function redirectAfterLogin($user): RedirectResponse
    {
        //  Utiliser 'role' pour les redirections admin
        
        switch($user->roles->first()->slug ?? 'user') {  // Changer 'account_type' en 'role'
            case 'super-admin':
            case 'admin':
                if (Route::has('admin.dashboard')) {
                    return redirect()->route('admin.dashboard');
                }
                return redirect('/admin')->with('info', 'Tableau de bord admin en construction');
                
            case 'moderator':
                if (Route::has('moderator.dashboard')) {
                    return redirect()->route('moderator.dashboard');
                }
                return redirect('/moderator')->with('info', 'Tableau de bord modérateur en construction');
        }
        
        // ✅ Redirection par défaut (tous les autres utilisateurs)
        return redirect()->intended(route('feed.index', absolute: false));
    }
}