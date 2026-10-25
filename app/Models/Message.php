<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Message extends Model
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
        'from_user_id',
        'to_user_id',
        'text',
        'message_type',
        'media_url',
        'seen',
    ];

    /**
     * Les attributs par défaut
     */
    protected $attributes = [
        'message_type' => 'text',
        'seen' => false,
    ];

    /**
     * Les attributs qui doivent être castés
     */
    protected function casts(): array
    {
        return [
            'seen' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Boot du modèle pour générer automatiquement l'UUID
     */
    protected static function boot()
    {
        parent::boot();
        
        // Générer automatiquement un UUID lors de la création
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    /**
     * Relation : Utilisateur qui envoie le message
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id', 'id');
    }

    /**
     * Relation : Utilisateur qui reçoit le message
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id', 'id');
    }

    /**
     * Marquer le message comme lu
     */
    public function markAsSeen(): void
    {
        $this->update(['seen' => true]);
    }

    /**
     * Vérifier si le message est lu
     */
    public function isSeen(): bool
    {
        return $this->seen;
    }

    /**
     * Scope : Messages non lus
     */
    public function scopeUnread($query)
    {
        return $query->where('seen', false);
    }

    /**
     * Scope : Messages entre deux utilisateurs
     */
    public function scopeBetweenUsers($query, $userId1, $userId2)
    {
        return $query->where(function ($q) use ($userId1, $userId2) {
            $q->where('from_user_id', $userId1)
              ->where('to_user_id', $userId2);
        })->orWhere(function ($q) use ($userId1, $userId2) {
            $q->where('from_user_id', $userId2)
              ->where('to_user_id', $userId1);
        });
    }

    /**
     * Scope : Messages envoyés par un utilisateur
     */
    public function scopeSentBy($query, $userId)
    {
        return $query->where('from_user_id', $userId);
    }

    /**
     * Scope : Messages reçus par un utilisateur
     */
    public function scopeReceivedBy($query, $userId)
    {
        return $query->where('to_user_id', $userId);
    }

    /**
     * Scope : Messages récents en premier
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope : Messages de type image
     */
    public function scopeWithMedia($query)
    {
        return $query->where('message_type', 'image')
                     ->whereNotNull('media_url');
    }
}