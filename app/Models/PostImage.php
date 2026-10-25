<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostImage extends Model
{
    use HasFactory;

    /**
     * Le type de la clé primaire
     */
    protected $keyType = 'string';

    /**
     * Indique si l'ID est auto-incrémenté
     */
    public $incrementing = false;

    /**
     * Le nom de la table
     */
    protected $table = 'post_images';

    /**
     * Les attributs qui peuvent être assignés en masse
     */
    protected $fillable = [
        'id',
        'post_id',
        'image_url',
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
     * Le post auquel appartient l'image
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id', 'id');
    }
}