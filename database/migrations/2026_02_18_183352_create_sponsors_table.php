<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ─────────────────────────────────────────────────────────────
     *  Table : sponsors
     *
     *  Gère les annonces sponsorisées affichées dans la sidebar.
     *  Chaque sponsor peut avoir une fenêtre de diffusion (starts_at /
     *  ends_at), un CTA personnalisé et des compteurs de métriques.
     * ─────────────────────────────────────────────────────────────
     */
    public function up(): void
    {
        Schema::create('sponsors', function (Blueprint $table) {

            // ── Identifiant ──────────────────────────────────────
            $table->uuid('id')->primary();

            // ── Contenu éditorial ────────────────────────────────
            $table->string('title', 120);                       // Titre court affiché en gras
            $table->text('description');                        // Texte descriptif (max ~300 car.)
            $table->string('image_url');                        // URL de l'image (stockage public)
            $table->string('link_url');                         // URL de destination au clic
            $table->string('cta_label', 60)->default('En savoir plus'); // Texte du bouton CTA

            // ── Diffusion & statut ───────────────────────────────
            $table->boolean('is_active')->default(true)->index(); // Activer / désactiver rapidement
            $table->timestamp('starts_at')->nullable();          // Début de diffusion (null = immédiat)
            $table->timestamp('ends_at')->nullable();            // Fin de diffusion (null = indéfini)

            // ── Métriques (incrémentées côté serveur) ────────────
            $table->unsignedBigInteger('impressions_count')->default(0); // Nb d'affichages
            $table->unsignedBigInteger('clicks_count')->default(0);      // Nb de clics sur le CTA
            $table->uuid('created_by'); // Admin qui a créé le sponsor
            // ── Tri & relation admin ─────────────────────────────
            $table->unsignedSmallInteger('sort_order')->default(0); // Ordre d'affichage (ASC)
            
            $table->foreign('created_by')                         // Admin qui a créé le sponsor
                  ->references('id')
                  ->on('users')
                  ->cascadeOnDelete();

            // ── Timestamps ───────────────────────────────────────
            $table->timestamps();
            $table->softDeletes(); // Suppression douce (archivage)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsors');
    }
};