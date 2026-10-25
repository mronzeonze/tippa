<?php

use App\Models\PlatformSetting;

if (!function_exists('setting')) {
    /**
     * Récupérer une valeur de paramètre
     * 
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    function setting(string $key, $default = null)
    {
        return PlatformSetting::get($key, $default);
    }
}

if (!function_exists('setting_set')) {
    /**
     * Définir une valeur de paramètre
     * 
     * @param string $key
     * @param mixed $value
     * @return bool
     */
    function setting_set(string $key, $value): bool
    {
        return PlatformSetting::set($key, $value);
    }
}

if (!function_exists('is_maintenance_mode')) {
    /**
     * Vérifier si le mode maintenance est activé
     * 
     * @return bool
     */
    function is_maintenance_mode(): bool
    {
        return (bool) setting('maintenance_mode', false);
    }
}

if (!function_exists('registration_enabled')) {
    /**
     * Vérifier si les inscriptions sont autorisées
     * 
     * @return bool
     */
    function registration_enabled(): bool
    {
        return (bool) setting('allow_registration', true);
    }
}

if (!function_exists('email_verification_required')) {
    /**
     * Vérifier si la vérification email est requise
     * 
     * @return bool
     */
    function email_verification_required(): bool
    {
        return (bool) setting('email_verification_required', true);
    }
}

