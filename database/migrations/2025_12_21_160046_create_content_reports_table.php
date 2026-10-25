<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Utilisateur qui signale
            $table->uuid('reporter_id');
            
            // Utilisateur signalé
            $table->uuid('reported_id');
            
            // Type de contenu signalé (post ou comment)
            $table->enum('reportable_type', ['post', 'comment']);
            $table->uuid('reportable_id');
            
            // Raison du signalement
            $table->enum('reason', [
                'spam',
                'harassment',
                'fake_information',
                'inappropriate_content',
                'hate_speech',
                'violence',
                'sexual_content',
                'other'
            ]);
            
            // Détails supplémentaires
            $table->text('description')->nullable();
            
            // Statut du signalement
            $table->enum('status', [
                'pending',
                'under_review',
                'resolved',
                'dismissed'
            ])->default('pending');
            
            // Modération
            $table->uuid('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('moderator_note')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['reportable_type', 'reportable_id']);
            $table->index('reporter_id');
            $table->index('reported_id');
            $table->index('status');
            
            // Foreign keys
            $table->foreign('reporter_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('reported_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
                  
            $table->foreign('reviewed_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
            
            // Éviter les doublons : un utilisateur ne peut signaler le même contenu qu'une fois
            $table->unique(['reporter_id', 'reportable_type', 'reportable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reports');
    }
};