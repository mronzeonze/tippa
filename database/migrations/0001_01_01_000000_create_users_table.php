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
        // ==========================================
        // TABLE PRINCIPALE : USERS (Utilisateurs)
        // ==========================================
        // Cette table stocke tous les utilisateurs du réseau social
        // Exemples : Dr. Kofi (tradipraticien), Marie (utilisatrice simple), Admin Paul
        Schema::create('users', function (Blueprint $table) {
            
            // --- IDENTIFIANTS UNIQUES ---
            // ID au format UUID (ex: "550e8400-e29b-41d4-a716-446655440000")
            // Avantage : plus sécurisé qu'un simple 1, 2, 3...
            $table->uuid('id')->primary();
            
            // Email unique pour chaque utilisateur (ex: "kofi@example.com")
            // Utilisé pour la connexion et la récupération de mot de passe
            $table->string('email')->unique();
            
            // Nom complet de l'utilisateur (ex: "Dr. Kofi Mensah")
            // Obligatoire pour l'inscription
            $table->string('full_name');
            
            // Nom d'utilisateur unique (ex: "@drkofi")
            // Utilisé pour les mentions et le profil public
            $table->string('username')->unique();
            
            // --- INFORMATIONS DE PROFIL ---
            // Biographie / Description du profil (ex: "Tradipraticien spécialisé en phytothérapie depuis 15 ans")
            // Peut être vide au début
            $table->text('bio')->nullable();
            
            // Chemin vers la photo de profil (ex: "profiles/kofi_avatar.jpg")
            // Stockée dans storage/app/public/profiles
            $table->string('profile_picture')->nullable(); 
            
            // Chemin vers la photo de couverture (ex: "covers/kofi_banner.jpg")
            // Image de fond du profil utilisateur
            $table->string('cover_photo')->nullable(); 
            
            // Localisation de l'utilisateur (ex: "Ouagadougou, Burkina Faso")
            // Permet de trouver des praticiens près de chez soi
            $table->string('location')->nullable();
            
            // Numéro de téléphone (ex: "+226 70 12 34 56")
            // Pour contact direct avec les tradipraticiens
            $table->string('phone')->nullable();
            
            // Date de naissance (ex: "1980-05-15")
            // Permet de calculer l'âge et vérifier la majorité
            $table->date('date_of_birth')->nullable();
            
            // Champs spécifiques aux tradipraticiens
            $table->enum('account_type', ['user', 'practitioner', 'expert'])->default('user');
        
            // // Nouveau enum pour role (permissions)
            // $table->enum('role', ['user', 'moderator', 'admin', 'super-admin'])
            //   ->default('user');
            
            
            $table->boolean('is_verified')->default(false); // Vérifié par admin
            $table->boolean('is_expert')->default(false); // Statut expert
            $table->integer('years_of_experience')->nullable();
            $table->string('certification_number')->nullable()->unique(); // Numéro certification officielle
            $table->string('certification_document')->nullable(); // Document PDF/Image
            $table->timestamp('verified_at')->nullable();
            $table->uuid('verified_by')->nullable(); // ID admin qui a vérifié
            
            $table->enum('verification_status', ['verified', 'pending', 'rejected'])
            ->default('pending');
            $table->string('rejection_reason')->nullable();

            // Statistiques
            $table->integer('followers_count')->default(0);
            $table->integer('following_count')->default(0);
            $table->integer('posts_count')->default(0);
            $table->integer('recipes_count')->default(0);
            $table->decimal('rating', 3, 2)->default(0); // Note moyenne /5
            $table->integer('total_ratings')->default(0);
            
            // Sécurité & compte
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_banned')->default(false);
            $table->timestamp('banned_at')->nullable();
            $table->uuid('banned_by')->nullable();
            $table->text('ban_reason')->nullable();
            
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            
            $table->foreign('banned_by')->references('id')->on('users')->onDelete('set null');
           
            $table->boolean('is_private')->default(false); // Compte privé
            $table->timestamp('last_active_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            // ==========================================
            // SECTION 1 : INFORMATIONS PERSONNELLES COMPLÈTES
            // ==========================================
            
            // Genre de l'utilisateur
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])
                ->nullable();
            
            // Nationalité (ex: "Burkinabè", "Ivoirien")
            $table->string('nationality')->nullable();
            
            // Région/Province (ex: "Centre", "Hauts-Bassins")
            $table->string('region')->nullable();
            
            // Ville/Commune (ex: "Ouagadougou", "Bobo-Dioulasso")
            $table->string('city')->nullable();
            
            // Quartier (ex: "Ouaga 2000", "Patte d'Oie")
            $table->string('district')->nullable();
            
            // Adresse complète
            $table->text('address')->nullable();
            
            // ==========================================
            // SECTION 2 : INFORMATIONS PROFESSIONNELLES (TRADIPRATICIENS)
            // ==========================================
            
            // Langues parlées (JSON: ["Français", "Mooré", "Dioula"])
            $table->json('languages')->nullable();;
            
            // Spécialités principales (texte libre, ex: "Phytothérapie, Massage traditionnel")
            $table->text('specialties')->nullable();

            // Méthodes de traitement (JSON)
            $table->json('treatment_methods')->nullable();

            // Zone d'intervention (rayon en km)
            $table->integer('intervention_radius_km')->nullable();
            
            // Prix consultation minimum (FCFA)
            $table->decimal('consultation_price_min', 10, 2)->nullable();
            
            // Prix consultation maximum (FCFA)
            $table->decimal('consultation_price_max', 10, 2)->nullable();
            
            // Devise (par défaut FCFA)
            $table->string('currency', 10)->default('FCFA');
            
            // Consultation à domicile possible
            $table->boolean('home_consultation_available')->default(false);
            
            // Consultation en ligne possible
            $table->boolean('online_consultation_available')->default(false);
            
            // Durée moyenne d'une consultation (en minutes)
            $table->integer('consultation_duration_minutes')->nullable();

            // Ex: "Cash, Mobile Money, Carte bancaire"
            $table->json('payment_methods')->nullable();
            
            $table->text('pricing_notes')->nullable(); // Notes sur la tarification
            
            // ==========================================
            // SECTION 3 : FORMATIONS & DIPLÔMES
            // ==========================================
            
            // Formations (JSON: [{title, institution, year, certificate_url}])
            $table->json('trainings')->nullable();
            
            // Diplômes obtenus (JSON)
            $table->json('degrees')->nullable();
            
            // Affiliations professionnelles (ex: Association des tradipraticiens du BF)
            $table->json('professional_affiliations')->nullable();
            
            // ==========================================
            // SECTION 4 : DISPONIBILITÉS
            // ==========================================
            
            // Horaires de consultation (JSON)
            // Structure: {"monday": {"open": true, "slots": [{"start": "08:00", "end": "12:00"}]}}
            $table->json('availability_schedule')->nullable();
            
            // Jours de congé/fermeture (JSON: ["2025-01-01", "2025-12-25"])
            $table->json('closed_dates')->nullable();
            
            // Délai de réservation minimum (en heures)
            $table->integer('booking_advance_hours')->default(24);
            
            // Accepte les urgences
            $table->boolean('accepts_emergencies')->default(false);
            
            // ==========================================
            // SECTION 5 : RÉSEAUX SOCIAUX & CONTACT
            // ==========================================
            
            // Téléphone secondaire
            $table->string('phone_secondary')->nullable();
            
            // WhatsApp (numéro avec indicatif)
            $table->string('whatsapp')->nullable();
            
            // Site web personnel
            $table->string('website')->nullable();
            
            // Facebook
            $table->string('facebook_url')->nullable();
            
            // Instagram
            $table->string('instagram_url')->nullable();
            
            // YouTube
            $table->string('youtube_url')->nullable();
            
            // LinkedIn
            $table->string('linkedin_url')->nullable();
            
            // TikTok
            $table->string('tiktok_url')->nullable();
            
            // ==========================================
            // SECTION 6 : COMPLÉTION DU PROFIL
            // ==========================================
            
            // Pourcentage de complétion du profil (calculé automatiquement)
            $table->integer('profile_completion_percentage')->default(0);
            
            // Date de dernière mise à jour du profil
            $table->timestamp('profile_last_updated_at')->nullable();
            
            // Profil complété (>= 80%)
            $table->boolean('is_profile_complete')->default(false);
            
            // ==========================================
            // SECTION 7 : PRÉFÉRENCES
            // ==========================================
            
            // Préférence de langue d'interface (JSON: "fr", "en", etc.)
            $table->string('preferred_language', 5)->default('fr');
            
            // Notifications email activées
            $table->boolean('email_notifications_enabled')->default(true);
            
            // Notifications push activées
            $table->boolean('push_notifications_enabled')->default(true);
            
            // Profil visible dans la recherche publique
            $table->boolean('is_searchable')->default(true);

            // Afficher le numéro de téléphone sur le profil
            $table->boolean('show_phone_on_profile')->default(false);

            // Notifications de messages privées activées
            $table->boolean('message_notifications_enabled')->default(false);

            // Index
            $table->index('account_type');
            $table->index('is_verified');
            $table->index('is_expert');
            $table->index(['is_verified', 'is_expert']);
            $table->index('city');
            $table->index('region');
            $table->index('is_profile_complete');
            $table->index(['is_verified', 'is_profile_complete']);
            $table->index(['account_type', 'is_profile_complete']);
            $table->index('profile_completion_percentage');
        });

        // Spécialisations des tradipraticiens
        Schema::create('specializations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ex: Phytothérapie, Massage traditionnel, etc.
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot: Spécialisations des utilisateurs
        Schema::create('user_specializations', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('specialization_id');
            $table->enum('proficiency_level', ['beginner', 'intermediate', 'advanced', 'expert'])->default('intermediate');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('specialization_id')->references('id')->on('specializations')->onDelete('cascade');
            $table->unique(['user_id', 'specialization_id']);
        });

         Schema::create('followings', function (Blueprint $table) {
      $table->string('user_id');
      $table->string('following_id');
      $table->timestamps();
      
      $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
      $table->foreign('following_id')->references('id')->on('users')->onDelete('cascade');
      $table->primary(['user_id', 'following_id']);
  });
  
  Schema::create('followers', function (Blueprint $table) {
      $table->string('user_id');
      $table->string('follower_id');
      $table->timestamps();
      
      $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
      $table->foreign('follower_id')->references('id')->on('users')->onDelete('cascade');
      $table->primary(['user_id', 'follower_id']);
  });

        // Demandes de connexion (pour comptes privés)
        Schema::create('follow_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('sender_id');
            $table->uuid('receiver_id');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unique(['sender_id', 'receiver_id']);
        });

        // Évaluations des tradipraticiens
        Schema::create('user_ratings', function (Blueprint $table) {
            $table->id();
            $table->uuid('rated_user_id'); // Tradipraticien évalué
            $table->uuid('rater_user_id'); // Utilisateur qui évalue
            $table->integer('rating'); // 1-5 étoiles
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('rated_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('rater_user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unique(['rated_user_id', 'rater_user_id']);
        });

        // Badges/Achievements pour les experts
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('icon')->nullable();
            $table->enum('type', ['expertise', 'contribution', 'community', 'special'])->default('contribution');
            $table->integer('required_points')->default(0);
            $table->timestamps();
        });

        // Pivot: Badges des utilisateurs
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreignId('badge_id');
            $table->timestamp('earned_at');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('badge_id')->references('id')->on('badges')->onDelete('cascade');
            
            $table->unique(['user_id', 'badge_id']);
        });

        // Tables Laravel par défaut
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Table pour les blocages
        Schema::create('user_blocks', function (Blueprint $table) {
            $table->id();
            $table->uuid('blocker_id'); // Celui qui bloque
            $table->uuid('blocked_id'); // Celui qui est bloqué
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->foreign('blocker_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('blocked_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unique(['blocker_id', 'blocked_id']);
        });

        // Table pour les signalements
        Schema::create('user_reports', function (Blueprint $table) {
            $table->id();
            $table->uuid('reporter_id');
            $table->uuid('reported_id');
            $table->enum('reason', ['spam', 'harassment', 'fake_profile', 'inappropriate_content', 'other']);
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'resolved', 'dismissed'])->default('pending');
            $table->uuid('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reported_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_reports');
        Schema::dropIfExists('user_blocks');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('user_ratings');
        Schema::dropIfExists('follow_requests');
        Schema::dropIfExists('follows');
        Schema::dropIfExists('user_specializations');
        Schema::dropIfExists('specializations');
        Schema::dropIfExists('users');
        
    }
};
