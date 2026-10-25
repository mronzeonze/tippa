<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Connection extends Model
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
        'status',
    ];

    /**
     * Les attributs par défaut
     */
    protected $attributes = [
        'status' => 'pending',
    ];

    /**
     * Les attributs qui doivent être castés
     */
    protected function casts(): array
    {
        return [
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
     * Relation : Utilisateur qui envoie la demande de connexion
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id', 'id');
    }

    /**
     * Relation : Utilisateur qui reçoit la demande de connexion
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id', 'id');
    }

    /**
     * Accepter la connexion
     */
    public function accept(): void
    {
        $this->update(['status' => 'accepted']);
    }

    /**
     * Vérifier si la connexion est acceptée
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Vérifier si la connexion est en attente
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Scope : Connexions en attente
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope : Connexions acceptées
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope : Connexions envoyées par un utilisateur
     */
    public function scopeSentBy($query, $userId)
    {
        return $query->where('from_user_id', $userId);
    }

    /**
     * Scope : Connexions reçues par un utilisateur
     */
    public function scopeReceivedBy($query, $userId)
    {
        return $query->where('to_user_id', $userId);
    }

    /**
     * Scope : Connexions entre deux utilisateurs (dans les deux sens)
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
     * Scope : Connexions récentes en premier
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}