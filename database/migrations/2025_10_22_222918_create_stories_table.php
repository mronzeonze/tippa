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
        Schema::create('stories', function (Blueprint $table) {
            // Clé primaire UUID
            $table->uuid('id')->primary();
            
            // Utilisateur qui a créé la story
            $table->uuid('user_id');
            
            // Contenu de la story
            $table->text('content')->nullable(); // Texte pour les stories texte
            
            // Type de story : text, image ou video
            $table->enum('media_type', ['text', 'image', 'video'])->default('text');
            
            // URL du média (image ou vidéo)
            $table->string('media_url')->nullable();
            
            // Couleur de fond pour les stories texte
            $table->string('background_color')->default('#4f46e5');
            
            // Date d'expiration (24h par défaut)
            $table->timestamp('expires_at');
            
            // Timestamps automatiques
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index('user_id');
            $table->index('expires_at');
            $table->index(['user_id', 'expires_at']);
            
            // Clé étrangère
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};