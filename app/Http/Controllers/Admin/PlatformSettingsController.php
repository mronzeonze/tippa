<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use App\Models\Post;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Models\PlatformSetting;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

/**
 * PlatformSettingsController
 *
 * Gère les paramètres globaux de la plateforme Pharmacopee.
 * Accessible uniquement aux super-admins.
 *
 * Routes associées :
 *   GET    /admin/settings              → index()
 *   PUT    /admin/settings              → update() [un seul paramètre]
 *   POST   /admin/settings/batch        → updateBatch() [plusieurs paramètres]
 *   POST   /admin/settings/reset        → reset()
 *   GET    /admin/settings/maintenance  → checkMaintenanceStatus()
 *   GET    /admin/settings/export       → export()
 */
class PlatformSettingsController extends Controller implements HasMiddleware
{
    // =========================================================
    // MIDDLEWARE — accès réservé aux super-admins
    // =========================================================

    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                if (!auth()->check()) {
                    abort(403, 'Vous devez être connecté.');
                }

                // Lecture depuis user_roles via la relation Eloquent
                $user = auth()->user()->load('roles');

                $primaryRoleSlug = $user->roles->first()?->slug;

                if (!$primaryRoleSlug) {
                    abort(403, 'Rôle non défini.');
                }

                if (!in_array($primaryRoleSlug, ['super-admin'])) {
                    abort(403, 'Accès non autorisé. Vous devez être administrateur.');
                }

                return $next($request);
            }),
        ];
    }

    // =========================================================
    // INDEX — Afficher la page des paramètres
    // =========================================================

    /**
     * Retourne la page de paramétrage avec :
     *  - Tous les paramètres groupés par catégorie
     *  - Statistiques clés de la plateforme
     */
    public function index()
    {
        $settings = PlatformSetting::getAllGrouped();

        $stats = $this->getPlatformStats();

        $systemInfo = [
            'php_version'    => PHP_VERSION,
            'laravel_version'=> app()->version(),
            'cache_driver'   => config('cache.default'),
            'queue_driver'   => config('queue.default'),
            'server_time'    => Carbon::now()->toDateTimeString(),
        ];

        return Inertia::render('admin/parametrage/platform-settings', [
            'settings'   => $settings,
            'stats'      => $stats,
            'systemInfo' => $systemInfo,
            'auth'       => ['user' => auth()->user()],
        ]);
    }

    // =========================================================
    // UPDATE — Modifier UN seul paramètre
    // =========================================================

    /**
     * Met à jour un paramètre unique.
     * Utilisé pour les toggles (modification immédiate).
     *
     * @param Request $request  {key: string, value: mixed}
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'key'   => 'required|string|exists:platform_settings,key',
            'value' => 'nullable',
        ]);

        try {
            $setting = PlatformSetting::where('key', $validated['key'])->firstOrFail();
            $value   = $this->formatValue($validated['value'], $setting->type);

            $setting->update(['value' => $value]);

            Cache::forget('platform_settings');

            Log::info('Paramètre modifié', [
                'key'      => $validated['key'],
                'value'    => $value,
                'admin_id' => auth()->id(),
            ]);

            $message = $this->buildSuccessMessage($validated['key'], $value);

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour paramètre', [
                'key'   => $validated['key'] ?? null,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Erreur : ' . $e->getMessage()]);
        }
    }

    // =========================================================
    // UPDATE BATCH — Modifier PLUSIEURS paramètres à la fois
    // =========================================================

    /**
     * Met à jour un groupe de paramètres en une seule requête.
     * Utilisé par le formulaire de chaque onglet (Général, Sécurité…).
     *
     * @param Request $request  {settings: {[key]: value}}
     */
    public function updateBatch(Request $request)
    {
        $validated = $request->validate([
            'settings'   => 'required|array',
            'settings.*' => 'nullable',
        ]);

        try {
            $changes             = [];
            $maintenanceChanged  = false;
            $maintenanceValue    = null;

            foreach ($validated['settings'] as $key => $value) {
                $setting = PlatformSetting::where('key', $key)->first();

                if (!$setting) {
                    continue; // ignorer les clés inconnues
                }

                $formatted = $this->formatValue($value, $setting->type);
                $setting->update(['value' => $formatted]);
                $changes[$key] = $formatted;

                if ($key === 'maintenance_mode') {
                    $maintenanceChanged = true;
                    $maintenanceValue   = $formatted;
                }
            }

            Cache::forget('platform_settings');

            Log::info('Paramètres batch modifiés', [
                'changes'  => $changes,
                'admin_id' => auth()->id(),
            ]);

            $message = $maintenanceChanged
                ? ($maintenanceValue === '1'
                    ? '⚠️ Paramètres sauvegardés. Mode maintenance ACTIVÉ.'
                    : '✅ Paramètres sauvegardés. Mode maintenance DÉSACTIVÉ.')
                : '✅ Paramètres mis à jour avec succès.';

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Erreur batch paramètres', ['error' => $e->getMessage()]);

            return back()->withErrors(['error' => 'Erreur : ' . $e->getMessage()]);
        }
    }

    // =========================================================
    // RESET — Réinitialiser aux valeurs par défaut
    // =========================================================

    /**
     * Remet tous les paramètres à leurs valeurs d'usine.
     */
    public function reset()
    {
        try {
            $defaults = $this->getDefaultValues();

            foreach ($defaults as $key => $value) {
                PlatformSetting::where('key', $key)->update(['value' => $value]);
            }

            Cache::forget('platform_settings');

            Log::warning('Paramètres réinitialisés', ['admin_id' => auth()->id()]);

            return back()->with('success', '🔄 Paramètres réinitialisés aux valeurs par défaut.');
        } catch (\Exception $e) {
            Log::error('Erreur reset paramètres', ['error' => $e->getMessage()]);

            return back()->withErrors(['error' => 'Erreur lors de la réinitialisation : ' . $e->getMessage()]);
        }
    }

    // =========================================================
    // CHECK MAINTENANCE — Endpoint public de statut
    // =========================================================

    /**
     * Vérifie le mode maintenance (utilisé par le middleware global).
     * Endpoint accessible sans auth pour les redirections.
     */
    public function checkMaintenanceStatus()
    {
        return response()->json([
            'maintenance_mode' => (bool) PlatformSetting::get('maintenance_mode', false),
            'message'          => PlatformSetting::get('maintenance_message', 'La plateforme est temporairement indisponible.'),
        ]);
    }

    // =========================================================
    // EXPORT — Exporter les paramètres en JSON
    // =========================================================

    /**
     * Exporte tous les paramètres en fichier JSON (pour backup).
     */
    public function export()
    {
        $settings = PlatformSetting::all()->toArray();

        $filename = 'platform-settings-' . Carbon::now()->format('Y-m-d') . '.json';

        return response()->json($settings)
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"")
            ->header('Content-Type', 'application/json');
    }

    // =========================================================
    // MÉTHODES PRIVÉES
    // =========================================================

    /**
     * Retourne les statistiques globales de la plateforme.
     */
    private function getPlatformStats(): array
    {
        return [
            'total_users'           => User::count(),
            'total_practitioners'   => User::where('account_type', 'practitioner')->count(),
            'verified_practitioners'=> User::where('account_type', 'practitioner')
                                           ->where('is_verified', true)->count(),
            'pending_verifications' => User::where('account_type', 'practitioner')
                                           ->where('is_verified', false)
                                           ->whereNotNull('certification_document')->count(),
            'total_posts'           => Post::count(),
            'total_messages'        => Message::count(),
            'new_users_today'       => User::whereDate('created_at', Carbon::today())->count(),
            'posts_today'           => Post::whereDate('created_at', Carbon::today())->count(),
        ];
    }

    /**
     * Formate une valeur selon le type du paramètre.
     */
    private function formatValue($value, string $type): string
    {
        return match ($type) {
            'boolean' => in_array(
                strtolower((string) $value),
                ['1', 'true', 'yes', 'on']
            ) ? '1' : '0',

            'number'  => is_numeric($value) ? (string) (int) $value : '0',

            'json'    => is_array($value) ? json_encode($value) : (string) $value,

            default   => (string) $value,
        };
    }

    /**
     * Construit un message de succès contextuel.
     */
    private function buildSuccessMessage(string $key, string $value): string
    {
        return match ($key) {
            'maintenance_mode' => $value === '1'
                ? '⚠️ Mode maintenance activé. Le site est maintenant inaccessible aux utilisateurs.'
                : '✅ Mode maintenance désactivé. Le site est de nouveau accessible.',

            'allow_registration' => $value === '1'
                ? '✅ Les inscriptions sont maintenant ouvertes.'
                : '🔒 Les inscriptions sont fermées.',

            'moderation_enabled' => $value === '1'
                ? '🛡️ Modération de contenu activée.'
                : '⚠️ Modération de contenu désactivée.',

            default => '✅ Paramètre mis à jour avec succès.',
        };
    }

    /**
     * Valeurs d'usine pour le reset.
     */
    private function getDefaultValues(): array
    {
        return [
            // Général
            'maintenance_mode'           => '0',
            'allow_registration'         => '1',
            'email_verification_required'=> '1',
            'auto_approve_practitioners' => '0',
            'min_age_registration'       => '18',

            // Contenu
            'max_post_length'            => '5000',
            'max_images_per_post'        => '10',
            'max_image_size'             => '5120',
            'moderation_enabled'         => '1',

            // Notifications
            'email_notifications_enabled'=> '1',
            'push_notifications_enabled' => '1',

            // Sécurité
            'max_login_attempts'         => '5',
            'session_timeout'            => '120',
            'two_factor_enabled'         => '0',
        ];
    }
}