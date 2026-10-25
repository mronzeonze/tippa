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
        Schema::create('messages', function (Blueprint $table) {
            // Clé primaire UUID
            $table->uuid('id')->primary();
            
            // Relations avec les utilisateurs
            $table->uuid('from_user_id');
            $table->uuid('to_user_id');
            
            // Contenu du message
            $table->text('text')->nullable();
            
            // Type de message : texte ou image
            $table->enum('message_type', ['text', 'image'])->default('text');
            
            // URL du média (pour les images)
            $table->string('media_url')->nullable();
            
            // Indicateur de lecture
            $table->boolean('seen')->default(false);
            
            // Timestamps automatiques (created_at, updated_at)
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index('from_user_id');
            $table->index('to_user_id');
            $table->index('seen');
            $table->index('created_at');
            
            // Clés étrangères avec cascade
            $table->foreign('from_user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
                  
            $table->foreign('to_user_id')
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
        Schema::dropIfExists('messages');
    }
};