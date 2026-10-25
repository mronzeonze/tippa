<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, number, boolean, json, file
            $table->string('group')->default('general'); // general, security, notifications, etc.
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false); // Accessible aux non-admins ?
            $table->timestamps();
        });

        // Insérer les paramètres par défaut
        DB::table('platform_settings')->insert([
            // Général
            [
                'key' => 'app_name',
                'value' => 'Pharmacopee',
                'type' => 'text',
                'group' => 'general',
                'description' => 'Nom de la plateforme',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'app_description',
                'value' => 'Plateforme sociale dédiée aux tradipraticiens',
                'type' => 'textarea',
                'group' => 'general',
                'description' => 'Description de la plateforme',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'contact_email',
                'value' => 'contact@pharmacopee.com',
                'type' => 'email',
                'group' => 'general',
                'description' => 'Email de contact principal',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'maintenance_mode',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'general',
                'description' => 'Mode maintenance activé',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Utilisateurs
            [
                'key' => 'allow_registration',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'users',
                'description' => 'Autoriser les nouvelles inscriptions',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'email_verification_required',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'users',
                'description' => 'Vérification email obligatoire',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'auto_approve_practitioners',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'users',
                'description' => 'Approuver automatiquement les tradipraticiens',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'min_age_registration',
                'value' => '18',
                'type' => 'number',
                'group' => 'users',
                'description' => 'Âge minimum pour s\'inscrire',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Contenu
            [
                'key' => 'max_post_length',
                'value' => '5000',
                'type' => 'number',
                'group' => 'content',
                'description' => 'Longueur maximale d\'un post (caractères)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'max_images_per_post',
                'value' => '10',
                'type' => 'number',
                'group' => 'content',
                'description' => 'Nombre maximum d\'images par post',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'max_image_size',
                'value' => '5120',
                'type' => 'number',
                'group' => 'content',
                'description' => 'Taille maximale d\'une image (KB)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'moderation_enabled',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'content',
                'description' => 'Modération du contenu activée',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Notifications
            [
                'key' => 'email_notifications_enabled',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'notifications',
                'description' => 'Notifications par email activées',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'push_notifications_enabled',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'notifications',
                'description' => 'Notifications push activées',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Sécurité
            [
                'key' => 'max_login_attempts',
                'value' => '5',
                'type' => 'number',
                'group' => 'security',
                'description' => 'Tentatives de connexion max avant blocage',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'session_timeout',
                'value' => '120',
                'type' => 'number',
                'group' => 'security',
                'description' => 'Durée de session (minutes)',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'two_factor_enabled',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'security',
                'description' => 'Authentification à deux facteurs disponible',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};