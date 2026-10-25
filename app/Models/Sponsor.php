<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Model : Sponsor
 *
 *  Représente une annonce sponsorisée affichée dans la sidebar de TradipraNet.
 *
 *  @property string          $id
 *  @property string          $title
 *  @property string          $description
 *  @property string          $image_url
 *  @property string          $link_url
 *  @property string          $cta_label
 *  @property bool            $is_active
 *  @property \Carbon\Carbon|null $starts_at
 *  @property \Carbon\Carbon|null $ends_at
 *  @property int             $impressions_count
 *  @property int             $clicks_count
 *  @property int             $sort_order
 *  @property int             $created_by
 *  @property \Carbon\Carbon  $created_at
 *  @property \Carbon\Carbon  $updated_at
 *  @property \Carbon\Carbon|null $deleted_at
 * ─────────────────────────────────────────────────────────────────────────────
 */
class Sponsor extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    // ── Table ────────────────────────────────────────────────────────────────
    protected $table = 'sponsors';

    // ── Champs assignables en masse ──────────────────────────────────────────
    protected $fillable = [
        'title',
        'description',
        'image_url',
        'link_url',
        'cta_label',
        'is_active',
        'starts_at',
        'ends_at',
        'sort_order',
        'created_by',
    ];

    // ── Casting des types ────────────────────────────────────────────────────
    protected $casts = [
        'is_active'          => 'boolean',
        'starts_at'          => 'datetime',
        'ends_at'            => 'datetime',
        'impressions_count'  => 'integer',
        'clicks_count'       => 'integer',
        'sort_order'         => 'integer',
    ];

    // ── Champs cachés dans les sérialisations JSON ───────────────────────────
    protected $hidden = ['deleted_at', 'created_by'];

    // ═════════════════════════════════════════════════════════════════════════
    //  RELATIONS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Admin ayant créé ce sponsor.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  SCOPES
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * scope : sponsors actuellement diffusables.
     * Actifs + dans la fenêtre de diffusion (ou sans fenêtre définie).
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where(function (Builder $q) {
                $q->whereNull('starts_at')
                  ->orWhere('starts_at', '<=', now());
            })
            ->where(function (Builder $q) {
                $q->whereNull('ends_at')
                  ->orWhere('ends_at', '>=', now());
            });
    }

    /**
     * scope : tri par sort_order puis par date de création (les plus récents d'abord).
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderByDesc('created_at');
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  MÉTHODES MÉTIER
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Incrémente le compteur d'impressions.
     * Utilise un update direct pour éviter les race conditions.
     */
    public function recordImpression(): void
    {
        $this->increment('impressions_count');
    }

    /**
     * Incrémente le compteur de clics.
     */
    public function recordClick(): void
    {
        $this->increment('clicks_count');
    }

    /**
     * Calcule le taux de clic (CTR) en pourcentage.
     */
    public function getCtrAttribute(): float
    {
        if ($this->impressions_count === 0) {
            return 0.0;
        }

        return round(($this->clicks_count / $this->impressions_count) * 100, 2);
    }

    /**
     * Vérifie si le sponsor est en cours de diffusion.
     */
    public function isLive(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        if ($this->starts_at && $this->starts_at->gt($now)) {
            return false;
        }

        if ($this->ends_at && $this->ends_at->lt($now)) {
            return false;
        }

        return true;
    }
}