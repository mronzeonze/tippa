<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ==========================================
        // TABLE : ROLES
        // ==========================================
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // super_admin, admin, moderator, practitioner, user
            $table->string('slug')->unique(); // super-admin, admin, moderator...
            $table->string('description')->nullable();
            $table->integer('level')->default(0); // Hiérarchie : 100=super_admin, 80=admin, 60=moderator, 40=practitioner, 20=user
            $table->boolean('is_default')->default(false); // Rôle attribué par défaut
            $table->timestamps();
            
            $table->index('slug');
            $table->index('level');
        });

        // ==========================================
        // TABLE : PERMISSIONS
        // ==========================================
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // create_post, delete_user, verify_practitioner...
            $table->string('slug')->unique(); // create-post, delete-user...
            $table->string('description')->nullable();
            $table->string('group')->default('general'); // posts, users, moderation, appointments...
            $table->timestamps();
            
            $table->index('slug');
            $table->index('group');
        });

        // ==========================================
        // PIVOT : ROLE_PERMISSIONS
        // ==========================================
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['role_id', 'permission_id']);
        });

        // ==========================================
        // PIVOT : USER_ROLES
        // ==========================================
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->uuid('assigned_by')->nullable(); // Qui a attribué ce rôle
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('expires_at')->nullable(); // Pour rôles temporaires
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('set null');
            
            $table->unique(['user_id', 'role_id']);
            $table->index('expires_at');
        });

        // ==========================================
        // TABLE : USER_PERMISSIONS (Permissions directes)
        // ==========================================
        Schema::create('user_permissions', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->boolean('is_granted')->default(true); // true=accordée, false=révoquée
            $table->uuid('granted_by')->nullable();
            $table->timestamp('granted_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('granted_by')->references('id')->on('users')->onDelete('set null');
            
            $table->unique(['user_id', 'permission_id']);
        });

        // ==========================================
        // TABLE : ACTIVITY_LOGS (Audit trail)
        // ==========================================
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->nullable(); // Utilisateur concerné
            $table->uuid('model_id')->nullable(); // ID du modèle concerné
            $table->string('model_type'); // Type de modèle concerné (User, Post, etc.)
            $table->string('action'); // Type d'action (login, verified, promoted, etc.)
            $table->text('description')->nullable(); // Description détaillée
            $table->text('changes')->nullable(); // Changements effectués (JSON)
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable(); // Données supplémentaires
            $table->timestamps();

            // Index
            $table->index('user_id');
            $table->index('model_id');
            $table->index('action');
            $table->index('created_at');

            // Clés étrangères
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('user_permissions');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};