<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shares', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id'); // Utilisateur qui partage
            $table->uuid('post_id'); // Post partagé
            $table->text('content')->nullable(); // Commentaire sur le partage
            $table->enum('share_type', ['repost', 'facebook', 'twitter', 'linkedin', 'whatsapp', 'copy_link'])->default('repost');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            
            // Un utilisateur ne peut republier un post qu'une seule fois
            $table->unique(['user_id', 'post_id', 'share_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shares');
    }
};