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
        Schema::create('connections', function (Blueprint $table) {
            // Clé primaire UUID
            $table->uuid('id')->primary();
            
            // Relations avec les utilisateurs
            // from_user_id : celui qui envoie la demande
            $table->uuid('from_user_id');
            // to_user_id : celui qui reçoit la demande
            $table->uuid('to_user_id');
            
            // Statut de la connexion : en attente ou acceptée
            $table->enum('status', ['pending', 'accepted'])->default('pending');
            
            // Timestamps automatiques
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index('from_user_id');
            $table->index('to_user_id');
            $table->index('status');
            $table->index(['from_user_id', 'to_user_id']); // Index composé
            
            // Clés étrangères avec cascade
            $table->foreign('from_user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
                  
            $table->foreign('to_user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
            
            // Contrainte unique : empêcher les doublons de connexion
            $table->unique(['from_user_id', 'to_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connections');
    }
};