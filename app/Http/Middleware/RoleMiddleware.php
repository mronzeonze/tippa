<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  string|array  $roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Si pas connecté
        if (!auth()->check()) {
            // ✅ Laisser passer les routes publiques
            if ($this->isPublicRoute($request)) {
                return $next($request);
            }
            
            return redirect()->route('login')
                ->with('error', 'Vous devez être connecté pour accéder à cette page.');
        }

        $user = auth()->user();

        // Vérifier si banni
        if ($user->is_banned ?? false) {
            auth()->logout();
            return redirect()->route('login')
                ->with('error', 'Votre compte a été banni. Raison : ' . ($user->ban_reason ?? 'Non spécifiée'));
        }

        // Vérifier les rôles
        if (!$this->userHasRole($user, $roles)) {
            abort(403, 'Accès non autorisé. Rôle requis : ' . implode(', ', $roles));
        }

        return $next($request);
    }

    /**
     * Vérifier si la route est publique
     */
    private function isPublicRoute(Request $request): bool
    {
        $publicRoutes = [
            'home',
            'login',
            'register',
            'password.request',
            'password.reset',
            'password.email',
            'verification.notice',
        ];

        return in_array($request->route()?->getName(), $publicRoutes);
    }

    /**
     * Vérifier si l'utilisateur a le rôle
     */
    private function userHasRole($user, array $roles): bool
    {
        // Si la méthode hasRole existe
        if (method_exists($user, 'hasRole')) {
            return $user->hasRole($roles);
        }

        // Sinon, vérifier via account_type
        if (property_exists($user, 'account_type')) {
            return in_array($user->account_type, $roles);
        }

        // Par défaut, refuser l'accès
        return false;
    }
}
