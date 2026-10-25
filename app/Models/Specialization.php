<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Specialization extends Model
{
    use HasFactory;

    /**
     * La table associée au modèle
     */
    protected $table = 'specializations';

    /**
     * Les attributs qui peuvent être assignés en masse
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'is_active',
    ];

    /**
     * Les attributs qui doivent être castés
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation : Les utilisateurs qui ont cette spécialisation
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_specializations',
            'specialization_id',
            'user_id'
        )
        ->withPivot('proficiency_level')
        ->withTimestamps();
    }

    /**
     * Scope : Spécialisations actives uniquement
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope : Ordonner par nom
     */
    public function scopeOrderByName($query)
    {
        return $query->orderBy('name', 'asc');
    }

    /**
     * Obtenir les tradipraticiens avec cette spécialisation
     */
    public function practitioners()
    {
        return $this->belongsToMany(User::class, 'user_specializations')
            ->whereIn('account_type', ['practitioner', 'expert'])
            ->where('is_verified', true);
    }
}