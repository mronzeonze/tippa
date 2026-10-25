<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'level',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'level' => 'integer',
    ];

    // ==========================================
    // RELATIONS
    // ==========================================

    /**
     * Permissions associées à ce rôle
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
                    ->withTimestamps();
    }

    /**
     * Utilisateurs ayant ce rôle
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
                    ->withPivot(['assigned_by', 'assigned_at', 'expires_at'])
                    ->withTimestamps();
    }

    // ==========================================
    // MÉTHODES
    // ==========================================

    /**
     * Attribuer une permission à ce rôle
     */
    public function givePermissionTo(string|Permission $permission): self
    {
        $permission = is_string($permission) 
            ? Permission::where('slug', $permission)->firstOrFail() 
            : $permission;

        if (!$this->permissions->contains($permission)) {
            $this->permissions()->attach($permission);
        }

        return $this;
    }

    /**
     * Retirer une permission de ce rôle
     */
    public function revokePermissionTo(string|Permission $permission): self
    {
        $permission = is_string($permission)
            ? Permission::where('slug', $permission)->firstOrFail()
            : $permission;

        $this->permissions()->detach($permission);

        return $this;
    }

    /**
     * Vérifier si le rôle a une permission
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()
                    ->where('slug', $permission)
                    ->exists();
    }

    /**
     * Synchroniser les permissions
     */
    public function syncPermissions(array $permissions): self
    {
        $permissionIds = Permission::whereIn('slug', $permissions)->pluck('id');
        $this->permissions()->sync($permissionIds);

        return $this;
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeByLevel($query, int $minLevel)
    {
        return $query->where('level', '>=', $minLevel);
    }
}