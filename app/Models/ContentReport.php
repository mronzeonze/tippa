<?php

namespace App\Models;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentReport extends Model
{
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'reporter_id',
        'reported_id',
        'reportable_type',
        'reportable_id',
        'reason',
        'description',
        'status',
        'reviewed_by',
        'reviewed_at',
        'moderator_note',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

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
     * L'utilisateur qui a signalé
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Le modérateur qui a traité le signalement
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Récupérer le contenu signalé (post ou comment)
     */
    public function reportable()
    {
        if ($this->reportable_type === 'post') {
            return Post::find($this->reportable_id);
        }
        
        if ($this->reportable_type === 'comment') {
            return Comment::find($this->reportable_id);
        }
        
        return null;
    }

    /**
     * Vérifier si un utilisateur a déjà signalé ce contenu
     */
    public static function hasUserReported(string $userId, string $type, string $contentId): bool
    {
        return self::where('reporter_id', $userId)
                   ->where('reportable_type', $type)
                   ->where('reportable_id', $contentId)
                   ->exists();
    }

    /**
     * Obtenir le label de la raison en français
     */
    public function getReasonLabelAttribute(): string
    {
        return match($this->reason) {
            'spam' => 'Spam ou publicité',
            'harassment' => 'Harcèlement',
            'fake_information' => 'Fausse information',
            'inappropriate_content' => 'Contenu inapproprié',
            'hate_speech' => 'Discours haineux',
            'violence' => 'Violence',
            'sexual_content' => 'Contenu sexuel',
            'other' => 'Autre',
            default => 'Non spécifié'
        };
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id', 'id');
    }

    public function comment()
    {
        return $this->belongsTo(Comment::class, 'comment_id', 'id');
    }
}