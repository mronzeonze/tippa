<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PermissionController extends AdminController
{
    /**
     * Afficher la liste des permissions
     * GET /admin/permissions
     */
    public function index()
    {
        $permissions = Permission::select('id', 'name', 'slug', 'description', 'group')
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy('group');

        $stats = [
            'total' => Permission::count(),
            'groups' => Permission::distinct('group')->count('group'),
        ];

        return Inertia::render('admin/permissions/index', [
            'permissions' => $permissions,
            'stats' => $stats,
            'auth'=> $this->buildAuthPayload(),
        ]);
    }

    /**
     * Créer une nouvelle permission
     * POST /admin/permissions
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:permissions,slug',
            'description' => 'nullable|string|max:500',
            'group' => 'required|string|max:100',
        ]);

        Permission::create([
            'id' => Str::uuid()->toString(),
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'group' => $validated['group'],
        ]);

        return redirect()->back()->with('success', 'Permission créée avec succès');
    }

    /**
     * Modifier une permission
     * PUT /admin/permissions/{permission}
     */
    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:permissions,slug,' . $permission->id,
            'description' => 'nullable|string|max:500',
            'group' => 'required|string|max:100',
        ]);

        $permission->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'group' => $validated['group'],
        ]);

        return redirect()->back()->with('success', 'Permission mise à jour avec succès');
    }

    /**
     * Supprimer une permission
     * DELETE /admin/permissions/{permission}
     */
    public function destroy(Permission $permission)
    {
        // Vérifier si la permission est utilisée par des rôles
        if ($permission->roles()->count() > 0) {
            return redirect()->back()->withErrors([
                'error' => 'Impossible de supprimer une permission assignée à des rôles'
            ]);
        }

        $permission->delete();

        return redirect()->back()->with('success', 'Permission supprimée avec succès');
    }

    /**
     * Créer plusieurs permissions en masse
     * POST /admin/permissions/bulk
     */
    public function bulkCreate(Request $request)
    {
        $validated = $request->validate([
            'permissions' => 'required|array|min:1',
            'permissions.*.name' => 'required|string|max:255',
            'permissions.*.slug' => 'required|string|max:255|unique:permissions,slug',
            'permissions.*.description' => 'nullable|string|max:500',
            'permissions.*.group' => 'required|string|max:100',
        ]);

        foreach ($validated['permissions'] as $permData) {
            Permission::create([
                'id' => Str::uuid()->toString(),
                'name' => $permData['name'],
                'slug' => $permData['slug'],
                'description' => $permData['description'] ?? null,
                'group' => $permData['group'],
            ]);
        }

        return redirect()->back()->with('success', count($validated['permissions']) . ' permissions créées avec succès');
    }

    /**
     * Obtenir les groupes de permissions disponibles
     * GET /admin/permissions/groups
     */
    public function getGroups()
    {
        $groups = Permission::select('group')
            ->distinct()
            ->orderBy('group')
            ->pluck('group');

        return response()->json(['groups' => $groups]);
    }
}