<?php

namespace App\Models;

use Illuminate\Support\Str;
use App\Models\ContentReport;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    use HasFactory;

    /**
     * La clé primaire de la table.
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
        'post_type',
    ];

    /**
     * Les attributs par défaut
     */
    protected $attributes = [
        'post_type' => 'text',
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
     * L'utilisateur qui a créé le post
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Les images du post
     */
    public function images(): HasMany
    {
        return $this->hasMany(PostImage::class, 'post_id', 'id');
    }

    /**
     * Les utilisateurs qui ont liké le post
     */
    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'post_likes',
            'post_id',
            'user_id',
            'id',
            'id'
        )
        ->withTimestamps()
        ->withPivot('id');
    }

    /**
     * Récupère le nombre de likes
     */
    public function getLikesCountAttribute(): int
    {
        return $this->likedBy()->count();
    }

    /**
     * Vérifie si un utilisateur a liké le post
     */
    public function isLikedBy(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return $this->likedBy()->where('user_id', $user->id)->exists();
    }

    /**
     * Liker le post
     */
    public function like(User $user): void
    {
        if (!$this->isLikedBy($user)) {
            // Générer un UUID pour l'ID de la table pivot
            $this->likedBy()->attach($user->id, [
                'id' => Str::uuid()->toString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Retirer le like du post
     */
    public function unlike(User $user): void
    {
        $this->likedBy()->detach($user->id);
    }

    /**
     * Ajouter une image au post
     */
    public function addImage(string $imageUrl): PostImage
    {
        return $this->images()->create([
            'image_url' => $imageUrl,
        ]);
    }

    /**
     * Récupère les URLs des images
     */
    public function getImageUrlsAttribute(): array
    {
        return $this->images()->pluck('image_url')->toArray();
    }

    /**
     * Scope pour les posts récents
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope pour les posts par utilisateur
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope pour les posts avec images
     */
    public function scopeWithImages($query)
    {
        return $query->whereIn('post_type', ['image', 'text_with_image']);
    }


    /**
 * Les commentaires du post
 */
public function comments(): HasMany
{
    return $this->hasMany(Comment::class, 'post_id', 'id');
}

/**
 * Les commentaires principaux (sans parent)
 */
public function mainComments(): HasMany
{
    return $this->hasMany(Comment::class, 'post_id', 'id')
        ->whereNull('parent_id')
        ->with(['user:id,full_name,username,profile_picture', 'replies'])
        ->withCount('likedBy as likes_count')
        ->orderBy('created_at', 'desc');
}

/**
 * Les partages du post
 */
public function shares(): HasMany
{
    return $this->hasMany(Share::class, 'post_id', 'id');
}

/**
 * Les republications du post
 */
public function reposts(): HasMany
{
    return $this->hasMany(Share::class, 'post_id', 'id')
        ->where('share_type', 'repost');
}

/**
 * Vérifier si un utilisateur a republié ce post
 */
public function isRepostedBy(?User $user): bool
{
    if (!$user) {
        return false;
    }

    return $this->shares()
        ->where('user_id', $user->id)
        ->where('share_type', 'repost')
        ->exists();
}

/**
 * Republier ce post
 */
public function repost(User $user, ?string $content = null): Share
{
    return $this->shares()->create([
        'id' => Str::uuid()->toString(),
        'user_id' => $user->id,
        'content' => $content,
        'share_type' => 'repost',
    ]);
}

    /**
     * Annuler la republication
     */
    public function unrepost(User $user): void
    {
        $this->shares()
            ->where('user_id', $user->id)
            ->where('share_type', 'repost')
            ->delete();
    }
    /**
     * Les signalements du post
     */
    public function reports()
    {
        return $this->hasMany(ContentReport::class, 'reportable_id', 'id')
            ->with('reporter:id,full_name,username,profile_picture')
            ->latest();
    }
}