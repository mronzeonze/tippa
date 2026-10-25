<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  string|array  $permissions
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
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
                ->with('error', 'Votre compte a été banni.');
        }

        // Vérifier les permissions
        if (!$this->userHasPermission($user, $permissions)) {
            abort(403, 'Vous n\'avez pas les permissions nécessaires.');
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
     * Vérifier si l'utilisateur a les permissions
     */
    private function userHasPermission($user, array $permissions): bool
    {
        // Si la méthode hasAnyPermission existe
        if (method_exists($user, 'hasAnyPermission')) {
            return $user->hasAnyPermission($permissions);
        }

        // Si la méthode hasPermission existe
        if (method_exists($user, 'hasPermission')) {
            foreach ($permissions as $permission) {
                if ($user->hasPermission($permission)) {
                    return true;
                }
            }
        }

        // Par défaut, refuser l'accès
        return false;
    }
}