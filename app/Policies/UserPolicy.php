<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Voir n'importe quel utilisateur
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view-users');
    }

    /**
     * Voir un utilisateur spécifique
     */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id 
            || $user->hasPermission('view-users');
    }

    /**
     * Créer un utilisateur
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('create-users');
    }

    /**
     * Modifier un utilisateur
     */
    public function update(User $user, User $model): bool
    {
        // Soi-même OU avoir la permission
        return $user->id === $model->id 
            || $user->hasPermission('edit-users');
    }

    /**
     * Supprimer un utilisateur
     */
    public function delete(User $user, User $model): bool
    {
        // Ne peut pas se supprimer soi-même
        if ($user->id === $model->id) {
            return false;
        }

        // Ne peut pas supprimer un utilisateur de niveau supérieur
        $userLevel = $user->primary_role?->level ?? 0;
        $targetLevel = $model->primary_role?->level ?? 0;

        return $user->hasPermission('delete-users') 
            && $userLevel > $targetLevel;
    }

    /**
     * Bannir un utilisateur
     */
    public function ban(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        $userLevel = $user->primary_role?->level ?? 0;
        $targetLevel = $model->primary_role?->level ?? 0;

        return $user->hasPermission('ban-users') 
            && $userLevel > $targetLevel;
    }

    /**
     * Attribuer des rôles
     */
    public function assignRole(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $user->hasPermission('assign-roles');
    }

    /**
     * Vérifier un tradipraticien
     */
    public function verifyPractitioner(User $user, User $model): bool
    {
        return $user->hasPermission('verify-practitioners');
    }
}