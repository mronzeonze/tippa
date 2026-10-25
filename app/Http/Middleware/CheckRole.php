<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * 
     * Vérifie que l'utilisateur a le rôle de permission requis (role)
     * et optionnellement un type de compte spécifique (account_type)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles Rôles de permission autorisés (user, moderator, admin, super-admin)
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // ==========================================
        // 1. VÉRIFIER L'AUTHENTIFICATION
        // ==========================================
        if (!auth()->check()) {
            return redirect()->route('login')
                ->with('error', 'Veuillez vous connecter pour accéder à cette page.');
        }

        $user = auth()->user();

        // ==========================================
        // 2. VÉRIFIER SI LE COMPTE EST ACTIF
        // ==========================================
        if ($user->is_banned) {
            auth()->logout();
            return redirect()->route('login')
                ->with('error', 'Votre compte a été suspendu.');
        }

        if (!$user->is_active) {
            auth()->logout();
            return redirect()->route('login')
                ->with('error', 'Votre compte est désactivé.');
        }

        // ==========================================
        // 3. VÉRIFIER LE CHAMP 'role'
        // ==========================================
        if (!isset($user->role) || empty($user->role)) {
            abort(403, 'Rôle de permission non défini pour votre compte.');
        }

        // ==========================================
        // 4. SI AUCUN RÔLE SPÉCIFIÉ : VÉRIFIER ADMIN
        // ==========================================
        if (empty($roles)) {
            $roles = ['admin', 'super-admin'];
        }

        // ==========================================
        // 5. VÉRIFIER SI L'UTILISATEUR A LE RÔLE REQUIS
        // ==========================================
        // ⚠️ CHANGEMENT PRINCIPAL : Utiliser 'role' au lieu de 'account_type'
        if (!in_array($user->role, $roles)) {
            $roleLabels = array_map(function($role) {
                return match($role) {
                    'super-admin' => 'Super Administrateur',
                    'admin' => 'Administrateur',
                    'moderator' => 'Modérateur',
                    default => 'Utilisateur',
                };
            }, $roles);

            abort(403, 'Accès non autorisé. Vous devez être ' . implode(' ou ', $roleLabels) . '.');
        }

        // ==========================================
        // 6. AUTORISER L'ACCÈS
        // ==========================================
        return $next($request);
    }
}