<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\PlatformSettingsService;
use Symfony\Component\HttpFoundation\Response;

/**
 * CheckMaintenanceMode
 *
 * Bloque l'accès au site quand le mode maintenance est activé,
 * sauf pour les administrateurs et les routes exemptées.
 *
 * Enregistrement dans bootstrap/app.php :
 *   ->withMiddleware(function (Middleware $m) {
 *       $m->web(append: [
 *           \App\Http\Middleware\CheckMaintenanceMode::class,
 *       ]);
 *       // OU comme alias utilisable dans les routes :
 *       $m->alias(['maintenance' => CheckMaintenanceMode::class]);
 *   })
 */
class CheckMaintenanceMode
{
    /**
     * URLs exemptées du mode maintenance (toujours accessibles).
     */
    private array $except = [
        'login',
        'logout',
        'admin/*',
        'maintenance-status',
        '_debugbar/*',
        'api/maintenance-status',
    ];

    public function __construct(private PlatformSettingsService $settings) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si le mode maintenance est actif
        if (!$this->settings->isMaintenanceMode()) {
            return $next($request);
        }

        // Les admins passent toujours
        if (auth()->check()) {
            $role = auth()->user()->role ?? null;
            if (in_array($role, ['admin', 'super-admin'])) {
                return $next($request);
            }
        }

        // Les routes exemptées passent toujours
        if ($this->isExcepted($request)) {
            return $next($request);
        }

        // Répondre selon le type de requête
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'La plateforme est en cours de maintenance. Revenez bientôt.',
                'maintenance_mode' => true,
            ], 503);
        }

        // Page de maintenance HTML (resources/views/maintenance.blade.php)
        return response()->view('maintenance', [
            'app_name' => $this->settings->appName(),
        ], 503);
    }

    private function isExcepted(Request $request): bool
    {
        foreach ($this->except as $pattern) {
            if ($request->is($pattern)) {
                return true;
            }
        }
        return false;
    }
}