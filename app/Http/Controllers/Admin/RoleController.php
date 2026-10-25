<?php

namespace App\Http\Controllers\Admin;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

/**
 * Gestion des rôles et permissions.
 *
 * Ce contrôleur étend AdminController pour hériter de buildAuthPayload(),
 * le helper qui charge les rôles de l'utilisateur connecté depuis la table
 * pivot `user_roles` et les sérialise dans le format attendu par
 * admin-layout.tsx → userHasRole().
 *
 * Chaque méthode qui appelle Inertia::render() DOIT passer 'auth'.
 * Sans cela, AdminLayout reçoit auth = undefined et le menu de navigation
 * ne s'affiche pas.
 */
class RoleController extends AdminController
{
    /**
     * Afficher la liste des rôles avec leurs permissions
     * GET /admin/roles
     */
    public function index()
    {
        $roles = Role::with('permissions')
            ->withCount('users')
            ->orderBy('level', 'desc')
            ->get()
            ->map(fn ($role) => [
                'id'                => $role->id,
                'name'              => $role->name,
                'slug'              => $role->slug,
                'description'       => $role->description,
                'level'             => $role->level,
                'is_default'        => $role->is_default,
                'users_count'       => $role->users_count,
                'permissions_count' => $role->permissions->count(),
                /*
                 * On envoie les slugs des permissions pour que le front
                 * puisse cocher/décocher facilement dans les modales.
                 */
                'permissions' => $role->permissions->pluck('slug')->values()->all(),
            ]);

        // Permissions groupées par catégorie (pour la liste de droite)
        $permissions = Permission::select('id', 'name', 'slug', 'group', 'description')
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy('group');

        return Inertia::render('admin/roles/index', [
            'roles'       => $roles,
            'permissions' => $permissions,
            /*
             * auth est passé ici pour que AdminLayout puisse lire
             * auth.user.roles[] et afficher le bon menu de navigation.
             * Les rôles sont chargés depuis user_roles via buildAuthPayload().
             */
            'auth'        => $this->buildAuthPayload(),
        ]);
    }

    /**
     * Créer un nouveau rôle
     * POST /admin/roles
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255|unique:roles,name',
            'slug'          => 'required|string|max:255|unique:roles,slug',
            'description'   => 'nullable|string|max:500',
            'level'         => 'required|integer|min:1|max:99',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'exists:permissions,slug',
        ]);

        $role = Role::create([
            'id'          => Str::uuid()->toString(),
            'name'        => $validated['name'],
            'slug'        => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'level'       => $validated['level'],
            'is_default'  => false,
        ]);

        if (!empty($validated['permissions'])) {
            $permissionIds = Permission::whereIn('slug', $validated['permissions'])
                ->pluck('id')
                ->toArray();
            $role->permissions()->attach($permissionIds);
        }

        return redirect()->back()->with('success', 'Rôle créé avec succès');
    }

    /**
     * Modifier un rôle existant
     * PUT /admin/roles/{role}
     */
    public function update(Request $request, Role $role)
    {
        if (in_array($role->slug, ['super-admin', 'admin', 'user'])) {
            return redirect()->back()->withErrors([
                'error' => 'Les rôles système ne peuvent pas être modifiés',
            ]);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:roles,name,' . $role->id,
            'slug'        => 'required|string|max:255|unique:roles,slug,' . $role->id,
            'description' => 'nullable|string|max:500',
            'level'       => 'required|integer|min:1|max:99',
        ]);

        $role->update([
            'name'        => $validated['name'],
            'slug'        => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'level'       => $validated['level'],
        ]);

        return redirect()->back()->with('success', 'Rôle mis à jour avec succès');
    }

    /**
     * Supprimer un rôle
     * DELETE /admin/roles/{role}
     */
    public function destroy(Role $role)
    {
        if (in_array($role->slug, ['super-admin', 'admin', 'user'])) {
            return redirect()->back()->withErrors([
                'error' => 'Les rôles système ne peuvent pas être supprimés',
            ]);
        }

        if ($role->users()->count() > 0) {
            return redirect()->back()->withErrors([
                'error' => 'Impossible de supprimer un rôle ayant des utilisateurs assignés',
            ]);
        }

        $role->delete();

        return redirect()->back()->with('success', 'Rôle supprimé avec succès');
    }

    /**
     * Synchroniser les permissions d'un rôle
     * POST /admin/roles/{role}/permissions
     */
    public function syncPermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions'   => 'required|array',
            'permissions.*' => 'exists:permissions,slug',
        ]);

        $permissionIds = Permission::whereIn('slug', $validated['permissions'])
            ->pluck('id')
            ->toArray();

        $role->permissions()->sync($permissionIds);

        return redirect()->back()->with('success', 'Permissions mises à jour avec succès');
    }
}