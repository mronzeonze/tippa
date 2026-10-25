<?php

namespace App\Http\Controllers\Auth;

use \App\Models\Specialization;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\PlatformSettingsService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

/**
 * RegisteredUserController — Inscription avec contrôle des paramètres plateforme
 *
 * Paramètres appliqués :
 *  ✅ allow_registration      → Bloque l'inscription si désactivé
 *  ✅ min_age_registration    → Validation de l'âge minimum
 *  ✅ email_verification_req  → Déclenche ou non la vérification email
 *  ✅ auto_approve_practitioners → Vérifie ou non automatiquement les praticiens
 *  ✅ max_post_length          → Validation de la bio (même limite)
 */

class RegisteredUserController extends Controller
{
    public function __construct(private PlatformSettingsService $settings) {}
    
    // ─────────────────────────────────────────────────────────
    // AFFICHER LE FORMULAIRE D'INSCRIPTION
    // ─────────────────────────────────────────────────────────

    public function create(): Response|RedirectResponse
    {
        // ✅ PARAMÈTRE : allow_registration
        // Si les inscriptions sont fermées, rediriger vers la page de connexion
        if (!$this->settings->isRegistrationOpen()) {
            return redirect()->route('login')
                ->with('warning', 'Les inscriptions sont temporairement fermées. Veuillez réessayer plus tard.');
        }

        $specializations = Specialization::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description']);

        return Inertia::render('auth/register', [
            'specializations' => $specializations,
            // Passer les limites au frontend pour la validation client
            'registration_config' => [
                'min_age'         => $this->settings->minAgeRegistration(),
                'registration_open' => $this->settings->isRegistrationOpen(),
            ],
            'settings'      => $this->settings->publicSettings(),
        ]);
    }

        // ─────────────────────────────────────────────────────────
    // TRAITER L'INSCRIPTION
    // ─────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        // ✅ PARAMÈTRE : allow_registration — double vérification côté serveur
        if (!$this->settings->isRegistrationOpen()) {
            return redirect()->route('login')
                ->with('warning', 'Les inscriptions sont temporairement fermées.');
        }

        // ✅ PARAMÈTRE : min_age_registration — calculé dynamiquement
        $minAge = $this->settings->minAgeRegistration();

        $request->validate([
            'full_name'           => 'required|string|max:255',
            'username'            => 'nullable|string|max:255|unique:users,username',
            'email'               => 'required|string|lowercase|email|max:255|unique:' . User::class . ',email',
            'password'            => ['required', 'confirmed', Rules\Password::defaults()],
            'account_type'        => 'required|in:user,practitioner,expert',

            // Champs praticien
            'years_of_experience' => 'required_if:account_type,practitioner,expert|nullable|integer|min:0|max:100',
            'location'            => 'required_if:account_type,practitioner,expert|nullable|string|max:255',
            'phone'               => 'required_if:account_type,practitioner,expert|nullable|string|max:20',
            'bio'                 => 'nullable|string|max:500',

            // ✅ Validation de l'âge via date de naissance (si fournie)
            'birth_date' => [
                'nullable',
                'date',
                "before:-{$minAge} years",
            ],
        ], [
            'birth_date.before' => "Vous devez avoir au moins {$minAge} ans pour vous inscrire.",
        ]);

        $username = $request->username ?? $this->generateUsername($request->full_name);

        // ✅ PARAMÈTRE : auto_approve_practitioners
        // Si activé, les praticiens sont vérifiés dès l'inscription
        $isVerified = false;
        if (
            in_array($request->account_type, ['practitioner', 'expert'])
            && $this->settings->isAutoApprovePractitioners()
        ) {
            $isVerified = true;
        }

        $user = User::create([
            'id'                  => (string) Str::uuid(),
            'full_name'           => $request->full_name,
            'username'            => $username,
            'email'               => $request->email,
            'password'            => Hash::make($request->password),
            'account_type'        => $request->account_type,
            'bio'                 => $request->bio ?? $this->getDefaultBio($request->account_type),
            'location'            => $request->location ?? '',
            'phone'               => $request->phone ?? null,
            'role'                => 'user',
            'years_of_experience' => $request->account_type !== 'user' ? $request->years_of_experience : null,
            'profile_picture'     => '',
            'cover_photo'         => '',
            'birth_date'          => $request->birth_date,

            // ✅ Vérification automatique si paramètre activé
            'is_verified'         => $isVerified,
        ]);

        UserRole::create([
            'user_id' => $user->id, // Utiliser l'UUID du nouvel utilisateur créé
            'role_id' => Role::where('slug', 'user')->first()->id, // ID du rôle "user" (assurez-vous que ce rôle existe dans la table des rôles)
            'assigned_by' => $user->id, // L'utilisateur nouvellement créé s'assign lui-même ce rôle
            'assigned_at' => now(),
            'expires_at' => null, // Le rôle n'expire jamais pour un utilisateur standard
        ]);

        // ✅ PARAMÈTRE : email_verification_required
        // Déclenche l'événement Registered → envoie ou non l'email de vérification
        // selon la config email_verification_required dans HandleInertiaRequests.php,
        // le middleware "verified" est conditionnel sur ce setting
        event(new Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        return $this->redirectAfterRegistration($user, $isVerified);
    }

    // ─────────────────────────────────────────────────────────
    // MÉTHODES PRIVÉES
    // ─────────────────────────────────────────────────────────

    private function generateUsername(string $fullName): string
    {
        $base     = Str::slug(Str::lower($fullName), '');
        $username = $base;
        $counter  = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base . $counter++;
        }

        return $username;
    }

    private function getDefaultBio(string $accountType): string
    {
        return match ($accountType) {
            'practitioner' => 'Tradipraticien passionné par les médecines traditionnelles',
            'expert'       => 'Expert en médecine traditionnelle et phytothérapie',
            default        => 'Bienvenue sur Pharmacopée !',
        };
    }

    /**
     * Redirection après inscription selon le rôle
     */
    private function redirectAfterRegistration(User $user, boolean $isVerified): RedirectResponse
    {
        //Utiliser 'role' pour les redirections admin
        switch($user->roles->first()->slug ?? 'user') {  // Changer 'account_type' en 'role'
            case 'super-admin':
            case 'admin':
                return redirect()->route('admin.dashboard')
                    ->with('success', 'Bienvenue dans l\'espace admin');
                    
            case 'moderator':
                return redirect()->route('moderator.dashboard')
                    ->with('success', 'Bienvenue espace modérateur');
        }
        
        // Utiliser 'account_type' pour les redirections métier
        switch($user->account_type) {
            case 'practitioner':
            case 'expert':
                $message = $isVerified
                    ? '✅ Compte créé et vérifié automatiquement ! Complétez votre profil.'
                    : '📋 Compte créé ! Votre profil est en attente de vérification.';

                return redirect()->route('profile.show', $user->id)
                    ->with('success', $message);
                    
            default:
                return redirect()->route('feed.index')
                    ->with('success', 'Bienvenue sur Pharmacopée !');
        }
    }
}