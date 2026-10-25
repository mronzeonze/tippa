<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountType
{
    /**
     * Handle an incoming request.
     * 
     * Vérifie que l'utilisateur a le type de compte requis (account_type)
     * Ex: practitioner, expert
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$accountTypes Types de compte autorisés (user, practitioner, expert)
     */
    public function handle(Request $request, Closure $next, ...$accountTypes): Response
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
        if ($user->is_banned || !$user->is_active) {
            auth()->logout();
            return redirect()->route('login')
                ->with('error', 'Votre compte est suspendu ou désactivé.');
        }

        // ==========================================
        // 3. VÉRIFIER LE CHAMP 'account_type'
        // ==========================================
        if (!isset($user->account_type) || empty($user->account_type)) {
            abort(403, 'Type de compte non défini.');
        }

        // ==========================================
        // 4. SI AUCUN TYPE SPÉCIFIÉ : VÉRIFIER PRACTITIONER/EXPERT
        // ==========================================
        if (empty($accountTypes)) {
            $accountTypes = ['practitioner', 'expert'];
        }

        // ==========================================
        // 5. VÉRIFIER SI L'UTILISATEUR A LE TYPE DE COMPTE REQUIS
        // ==========================================
        if (!in_array($user->account_type, $accountTypes)) {
            $typeLabels = array_map(function($type) {
                return match($type) {
                    'practitioner' => 'Tradipraticien',
                    'expert' => 'Expert',
                    default => 'Utilisateur',
                };
            }, $accountTypes);

            abort(403, 'Accès non autorisé. Vous devez être ' . implode(' ou ', $typeLabels) . '.');
        }

        // ==========================================
        // 6. AUTORISER L'ACCÈS
        // ==========================================
        return $next($request);
    }
}