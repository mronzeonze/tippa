<?php

namespace App\Models;

use Illuminate\Support\Str;
use App\Models\ContentReport;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Comment extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'post_id',
        'parent_id',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Boot function pour générer l'UUID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    /**
     * L'utilisateur qui a créé le commentaire
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Le post auquel appartient le commentaire
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id', 'id');
    }

    /**
     * Le commentaire parent (si c'est une réponse)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id', 'id');
    }

    /**
     * Les réponses à ce commentaire
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id', 'id')
            ->with('user:id,full_name,username,profile_picture')
            ->withCount('likedBy as likes_count')
            ->orderBy('created_at', 'asc');
    }

    /**
     * Les utilisateurs qui ont liké le commentaire
     */
    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'comment_likes',
            'comment_id',
            'user_id',
            'id',
            'id'
        )
        ->withTimestamps()
        ->withPivot('id');
    }

    /**
     * Vérifie si un utilisateur a liké le commentaire
     */
    public function isLikedBy(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return $this->likedBy()->where('user_id', $user->id)->exists();
    }

    /**
     * Liker le commentaire
     */
    public function like(User $user): void
    {
        if (!$this->isLikedBy($user)) {
            $this->likedBy()->attach($user->id, [
                'id' => Str::uuid()->toString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Retirer le like du commentaire
     */
    public function unlike(User $user): void
    {
        $this->likedBy()->detach($user->id);
    }

    /**
     * Scope pour les commentaires principaux (pas de réponses)
     */
    public function scopeMainComments($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope pour les réponses
     */
    public function scopeReplies($query)
    {
        return $query->whereNotNull('parent_id');
    }
    /**
     * Les signalements associés à ce commentaire
     */

    public function reports()
    {
        return $this->hasMany(ContentReport::class, 'reportable_id', 'id')
            ->with('reporter:id,full_name,username,profile_picture')
            ->latest();
    }
}