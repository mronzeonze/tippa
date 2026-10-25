<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Story extends Model
{
    use HasFactory;

    /**
     * La clé primaire de la table
     */
    protected $primaryKey = 'id';

    /**
     * Le type de la clé primaire
     */
    protected $keyType = 'string';

    /**
     * Indique si l'ID est auto-incrémenté
     */
    public $incrementing = false;

    /**
     * Les attributs qui peuvent être assignés en masse
     */
    protected $fillable = [
        'id',
        'user_id',
        'content',
        'media_type',
        'media_url',
        'background_color',
        'expires_at',
    ];

    /**
     * Les attributs par défaut
     */
    protected $attributes = [
        'media_type' => 'text',
        'background_color' => '#4f46e5',
    ];

    /**
     * Les attributs qui doivent être castés
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Boot du modèle pour générer automatiquement l'UUID et expires_at
     */
    protected static function boot()
    {
        parent::boot();
        
        // Générer automatiquement un UUID lors de la création
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
            
            // Définir l'expiration à 24h si non définie
            if (empty($model->expires_at)) {
                $model->expires_at = Carbon::now()->addHours(24);
            }
        });
    }

    /**
     * Relation : Utilisateur qui a créé la story
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Vérifier si la story est expirée
     */
    public function isExpired(): bool
    {
        return Carbon::now()->isAfter($this->expires_at);
    }

    /**
     * Scope : Stories non expirées uniquement
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', Carbon::now());
    }

    /**
     * Scope : Stories expirées
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', Carbon::now());
    }

    /**
     * Scope : Stories d'un utilisateur spécifique
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope : Stories récentes en premier
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope : Stories avec media (image ou video)
     */
    public function scopeWithMedia($query)
    {
        return $query->whereIn('media_type', ['image', 'video'])
                     ->whereNotNull('media_url');
    }
}