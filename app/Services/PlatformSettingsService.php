<?php

namespace App\Services;

use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Cache;

/**
 * PlatformSettingsService
 *
 * Service centralisé pour accéder aux paramètres de la plateforme.
 * Utilisation dans les controllers :
 *
 *   use App\Services\PlatformSettingsService;
 *
 *   public function __construct(private PlatformSettingsService $settings) {}
 *
 *   $this->settings->get('maintenance_mode')
 *   $this->settings->maxPostLength()
 *   $this->settings->isRegistrationOpen()
 *
 * Ou via le helper global : settings('clé', $défaut)
 */
class PlatformSettingsService
{
    /** Durée du cache en secondes (1 heure) */
    private const CACHE_TTL = 3600;

    /** Cache interne pour éviter plusieurs requêtes DB par request */
    private ?array $cache = null;

    // ─────────────────────────────────────────────────────────
    // MÉTHODE GÉNÉRIQUE
    // ─────────────────────────────────────────────────────────

    /**
     * Récupère n'importe quel paramètre par sa clé.
     *
     * @param string $key     Clé du paramètre (ex: 'maintenance_mode')
     * @param mixed  $default Valeur de retour si la clé n'existe pas
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    /**
     * Retourne tous les paramètres castés (depuis le cache ou DB).
     */
    public function all(): array
    {
        if ($this->cache !== null) {
            return $this->cache;
        }

        $this->cache = Cache::remember('platform_settings_cast', self::CACHE_TTL, function () {
            return PlatformSetting::all()
                ->mapWithKeys(fn($s) => [$s->key => $this->cast($s->value, $s->type)])
                ->toArray();
        });

        return $this->cache;
    }

    /**
     * Retourne uniquement les paramètres publics (pour le frontend).
     */
    public function publicSettings(): array
    {
        return Cache::remember('platform_settings_public', self::CACHE_TTL, function () {
            return PlatformSetting::where('is_public', true)
                ->get()
                ->mapWithKeys(fn($s) => [$s->key => $this->cast($s->value, $s->type)])
                ->toArray();
        });
    }

    // ─────────────────────────────────────────────────────────
    // MÉTHODES SÉMANTIQUES (lisibles dans les controllers)
    // ─────────────────────────────────────────────────────────

    // ── Général ──

    public function appName(): string
    {
        return (string) $this->get('app_name', 'Pharmacopee');
    }

    public function appDescription(): string
    {
        return (string) $this->get('app_description', '');
    }

    public function isMaintenanceMode(): bool
    {
        return (bool) $this->get('maintenance_mode', false);
    }

    // ── Utilisateurs ──

    public function isRegistrationOpen(): bool
    {
        return (bool) $this->get('allow_registration', true);
    }

    public function isEmailVerificationRequired(): bool
    {
        return (bool) $this->get('email_verification_required', true);
    }

    public function isAutoApprovePractitioners(): bool
    {
        return (bool) $this->get('auto_approve_practitioners', false);
    }

    public function minAgeRegistration(): int
    {
        return (int) $this->get('min_age_registration', 18);
    }

    // ── Contenu ──

    public function maxPostLength(): int
    {
        return (int) $this->get('max_post_length', 5000);
    }

    public function maxImagesPerPost(): int
    {
        return (int) $this->get('max_images_per_post', 10);
    }

    /**
     * Taille max d'une image en Ko (retourne aussi en octets pour la validation).
     */
    public function maxImageSizeKb(): int
    {
        return (int) $this->get('max_image_size', 5120);
    }

    public function maxImageSizeBytes(): int
    {
        return $this->maxImageSizeKb() * 1024;
    }

    public function isModerationEnabled(): bool
    {
        return (bool) $this->get('moderation_enabled', true);
    }

    // ── Notifications ──

    public function isEmailNotificationsEnabled(): bool
    {
        return (bool) $this->get('email_notifications_enabled', true);
    }

    public function isPushNotificationsEnabled(): bool
    {
        return (bool) $this->get('push_notifications_enabled', true);
    }

    // ── Sécurité ──

    public function maxLoginAttempts(): int
    {
        return (int) $this->get('max_login_attempts', 5);
    }

    public function sessionTimeout(): int
    {
        return (int) $this->get('session_timeout', 120);
    }

    public function isTwoFactorEnabled(): bool
    {
        return (bool) $this->get('two_factor_enabled', false);
    }

    // ─────────────────────────────────────────────────────────
    // VIDER LE CACHE (appelé automatiquement par PlatformSetting::saved())
    // ─────────────────────────────────────────────────────────

    public function clearCache(): void
    {
        Cache::forget('platform_settings_cast');
        Cache::forget('platform_settings_public');
        Cache::forget('platform_settings');
        $this->cache = null;
    }

    // ─────────────────────────────────────────────────────────
    // CAST INTERNE
    // ─────────────────────────────────────────────────────────

    private function cast(mixed $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'number'  => is_numeric($value) ? (int) $value : $value,
            'json'    => json_decode($value, true),
            default   => $value,
        };
    }
}