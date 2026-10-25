<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminLog extends Model
{
    /**
     * Les attributs qui peuvent être assignés en masse
     */
    protected $fillable = [
        'admin_id',
        'action',
        'target_type',
        'target_id',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    /**
     * Les attributs qui doivent être castés
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * L'administrateur qui a effectué l'action
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id', 'id');
    }

    /**
     * Créer un log d'action admin
     * 
     * @param string $action L'action effectuée (verify_user, delete_post, etc.)
     * @param string|null $targetType Le type d'entité ciblée (User, Post, etc.)
     * @param string|null $targetId L'ID de l'entité ciblée
     * @param string|null $description Description de l'action
     * @param array|null $metadata Données supplémentaires
     */
    public static function logAction(
        string $action,
        ?string $targetType = null,
        ?string $targetId = null,
        ?string $description = null,
        ?array $metadata = null
    ): self {
        return self::create([
            'admin_id' => auth()->id(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'description' => $description,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Scope pour filtrer par action
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope pour filtrer par admin
     */
    public function scopeByAdmin($query, string $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    /**
     * Scope pour filtrer par cible
     */
    public function scopeByTarget($query, string $targetType, string $targetId)
    {
        return $query->where('target_type', $targetType)
                    ->where('target_id', $targetId);
    }

    /**
     * Scope pour les logs récents
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days))
                    ->orderBy('created_at', 'desc');
    }
}