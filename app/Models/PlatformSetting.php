<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PlatformSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Boot du modèle pour gérer le cache
     */
    protected static function boot()
    {
        parent::boot();

        // Vider le cache après chaque modification
        static::saved(function () {
            Cache::forget('platform_settings');
        });

        static::deleted(function () {
            Cache::forget('platform_settings');
        });
    }

    /**
     * Récupérer une valeur de paramètre par sa clé
     */
    public static function get(string $key, $default = null)
    {
        $settings = Cache::remember('platform_settings', 3600, function () {
            return self::all()->pluck('value', 'key')->toArray();
        });

        if (!isset($settings[$key])) {
            return $default;
        }

        $setting = self::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        // Convertir selon le type
        return self::castValue($settings[$key], $setting->type);
    }

    /**
     * Définir une valeur de paramètre
     */
    public static function set(string $key, $value): bool
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        ) ? true : false;
    }

    /**
     * Convertir la valeur selon le type
     */
    protected static function castValue($value, string $type)
    {
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
                return is_numeric($value) ? (int) $value : $value;
            case 'json':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    /**
     * Récupérer tous les paramètres groupés
     */
    public static function getAllGrouped(): array
    {
        return self::all()
            ->groupBy('group')
            ->map(function ($items) {
                return $items->keyBy('key');
            })
            ->toArray();
    }

    /**
     * Récupérer les paramètres d'un groupe spécifique
     */
    public static function getGroup(string $group): array
    {
        return self::where('group', $group)
            ->get()
            ->keyBy('key')
            ->toArray();
    }
}