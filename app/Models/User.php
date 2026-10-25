<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * ═══════════════════════════════════════════════════════════════════════
 * MODÈLE USER - PLATEFORME TRADIPRATICIENS
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Ce modèle gère les utilisateurs de la plateforme :
 * - Utilisateurs simples (patients)
 * - Tradipraticiens (practitioners)
 * - Experts vérifiés
 * - Modérateurs et administrateurs
 * 
 * @property string $id UUID
 * @property string $email
 * @property string $full_name
 * @property string $username
 * @property string $account_type user|practitioner|expert
 * @property string $role user|moderator|admin|super-admin
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, SoftDeletes;

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 1 : CONFIGURATION DE BASE
    // ═══════════════════════════════════════════════════════════════════════

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        // 1.1 Identifiants de base
        'id',
        'email',
        'password',
        'full_name',
        'username',
        
        // 1.2 Types et statuts
        'account_type',  // user, practitioner, expert (MÉTIER)
        'is_active',
        'is_verified',
        'is_expert',
        'is_banned',
        'is_private',
        
        // 1.3 Informations personnelles de base
        'bio',
        'profile_picture',
        'cover_photo',
        'location',
        'phone',
        'date_of_birth',
        'gender',
        'nationality',
        
        // 1.4 Localisation détaillée
        'region',
        'city',
        'district',
        'address',
        
        // 1.5 Informations professionnelles (tradipraticiens)
        'years_of_experience',
        'certification_number',
        'certification_document',
        'verified_at',
        'verified_by',
        'verification_status',
        'rejection_reason',
        
        // 1.6 Compétences et spécialités
        'languages',
        'specialties',
        'treatment_methods',
        
        // 1.7 Tarifs et consultations
        'consultation_price_min',
        'consultation_price_max',
        'currency',
        'payment_methods',
        'pricing_notes',
        'home_consultation_available',
        'online_consultation_available',
        'consultation_duration_minutes',
        'intervention_radius_km',
        
        // 1.8 Formations et affiliations
        'trainings',
        'degrees',
        'professional_affiliations',
        
        // 1.9 Disponibilités
        'availability_schedule',
        'closed_dates',
        'booking_advance_hours',
        'accepts_emergencies',
        
        // 1.10 Réseaux sociaux et contacts
        'phone_secondary',
        'whatsapp',
        'website',
        'facebook_url',
        'instagram_url',
        'youtube_url',
        'linkedin_url',
        'tiktok_url',
        
        // 1.11 Statistiques
        'followers_count',
        'following_count',
        'posts_count',
        'recipes_count',
        'rating',
        'total_ratings',
        
        // 1.12 Préférences utilisateur
        'preferred_language',
        'email_notifications_enabled',
        'push_notifications_enabled',
        'is_searchable',
        'show_phone_on_profile',
        
        // 1.13 Profil et tracking
        'profile_completion_percentage',
        'profile_last_updated_at',
        'is_profile_complete',
        'last_active_at',
        
        // 1.14 Sécurité
        'failed_login_attempts',
        'locked_until',
        'banned_at',
        'banned_by',
        'ban_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $attributes = [
        'bio' => 'Hey there! I am using Pharmacopee',
        'is_verified' => false,
        'is_expert' => false,
        'is_active' => true,
        'is_private' => false,
        'is_banned' => false,
        'followers_count' => 0,
        'following_count' => 0,
        'posts_count' => 0,
        'recipes_count' => 0,
        'rating' => 0,
        'total_ratings' => 0,
        'account_type' => 'user',
        'verification_status' => 'pending',
        'failed_login_attempts' => 0,
    ];

    protected function casts(): array
    {
        return [
            // Dates
            'email_verified_at' => 'datetime',
            'verified_at' => 'datetime',
            'last_active_at' => 'datetime',
            'profile_last_updated_at' => 'datetime',
            'date_of_birth' => 'date',
            'banned_at' => 'datetime',
            'locked_until' => 'datetime',
            
            // Booléens
            'is_verified' => 'boolean',
            'is_expert' => 'boolean',
            'is_active' => 'boolean',
            'is_private' => 'boolean',
            'is_banned' => 'boolean',
            'home_consultation_available' => 'boolean',
            'online_consultation_available' => 'boolean',
            'accepts_emergencies' => 'boolean',
            'is_profile_complete' => 'boolean',
            'email_notifications_enabled' => 'boolean',
            'push_notifications_enabled' => 'boolean',
            'is_searchable' => 'boolean',
            'show_phone_on_profile' => 'boolean',
            
            // Numériques
            'followers_count' => 'integer',
            'following_count' => 'integer',
            'posts_count' => 'integer',
            'recipes_count' => 'integer',
            'years_of_experience' => 'integer',
            'total_ratings' => 'integer',
            'intervention_radius_km' => 'integer',
            'consultation_duration_minutes' => 'integer',
            'booking_advance_hours' => 'integer',
            'profile_completion_percentage' => 'integer',
            'failed_login_attempts' => 'integer',
            'rating' => 'decimal:2',
            'consultation_price_min' => 'decimal:2',
            'consultation_price_max' => 'decimal:2',
            
            // JSON
            'languages' => 'array',
            'specialties' => 'array',
            'treatment_methods' => 'array',
            'payment_methods' => 'array',
            'trainings' => 'array',
            'degrees' => 'array',
            'professional_affiliations' => 'array',
            'availability_schedule' => 'array',
            'closed_dates' => 'array',
            
            // Hash
            'password' => 'hashed',
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 2 : RELATIONS - CONTENU
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Posts créés par l'utilisateur
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'user_id', 'id');
    }

    /**
     * Posts likés
     */
    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_likes', 'user_id', 'post_id', 'id', 'id')
            ->withTimestamps();
    }

    /**
     * Stories
     */
    public function stories(): HasMany
    {
        return $this->hasMany(Story::class, 'user_id', 'id');
    }

    /**
     * Stories actives (non expirées)
     */
    public function activeStories()
    {
        return $this->stories()->active();
    }

    /**
     * Partages
     */
    public function shares(): HasMany
    {
        return $this->hasMany(Share::class, 'user_id', 'id');
    }

    /**
     * Republications (reposts)
     */
    public function reposts(): HasMany
    {
        return $this->shares()->where('share_type', 'repost');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 3 : RELATIONS - MESSAGERIE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Messages envoyés
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'from_user_id', 'id');
    }

    /**
     * Messages reçus
     */
    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'to_user_id', 'id');
    }

    /**
     * Messages non lus
     */
    public function unreadMessages()
    {
        return $this->receivedMessages()->unread();
    }

    /**
     * Conversation avec un utilisateur
     */
    public function conversationWith(User $user)
    {
        return Message::betweenUsers($this->id, $user->id)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Récupérer tous les utilisateurs avec qui on a une conversation
     * (Messages envoyés ou reçus)
     */
    public function conversations()
    {
        // IDs des utilisateurs à qui on a envoyé des messages
        $sentToIds = Message::where('from_user_id', $this->id)
            ->distinct()
            ->pluck('to_user_id');
        
        // IDs des utilisateurs qui nous ont envoyé des messages
        $receivedFromIds = Message::where('to_user_id', $this->id)
            ->distinct()
            ->pluck('from_user_id');
        
        // Fusionner et dédupliquer
        $conversationUserIds = $sentToIds
            ->merge($receivedFromIds)
            ->unique()
            ->filter(); // Retirer les valeurs nulles
        
        // Retourner les utilisateurs
        return User::whereIn('id', $conversationUserIds)
            ->select('id', 'full_name', 'username', 'profile_picture')
            ->get();
    }

    /**
     * Nombre de messages non lus
     */
    public function getUnreadMessagesCountAttribute()
    {
        return Message::where('to_user_id', $this->id)
            ->where('seen', false)
            ->count();
    }

    /**
     * Vérifier si on a une conversation avec un utilisateur
     */
    public function hasConversationWith($userId)
    {
        return Message::where(function($query) use ($userId) {
            $query->where('from_user_id', $this->id)
                  ->where('to_user_id', $userId);
        })->orWhere(function($query) use ($userId) {
            $query->where('from_user_id', $userId)
                  ->where('to_user_id', $this->id);
        })->exists();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 4 : RELATIONS - CONNEXIONS (Amis)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Demandes de connexion envoyées
     */
    public function sentConnections(): HasMany
    {
        return $this->hasMany(Connection::class, 'from_user_id', 'id');
    }

    /**
     * Demandes de connexion reçues
     */
    public function receivedConnections(): HasMany
    {
        return $this->hasMany(Connection::class, 'to_user_id', 'id');
    }

    /**
     * Connexions acceptées (amis)
     */
    public function connections()
    {
        $sentAccepted = Connection::where('from_user_id', $this->id)
            ->where('status', 'accepted')
            ->pluck('to_user_id');

        $receivedAccepted = Connection::where('to_user_id', $this->id)
            ->where('status', 'accepted')
            ->pluck('from_user_id');

        $userIds = $sentAccepted->merge($receivedAccepted)->unique();

        return User::whereIn('id', $userIds);
    }

    /**
     * Demandes en attente (reçues)
     */
    public function pendingConnectionRequests()
    {
        return $this->receivedConnections()
            ->pending()
            ->with('sender:id,full_name,username,profile_picture,bio');
    }

    /**
     * Demandes envoyées en attente
     */
    public function sentPendingConnections()
    {
        return $this->sentConnections()
            ->pending()
            ->with('receiver:id,full_name,username,profile_picture,bio');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 5 : RELATIONS - FOLLOWERS/FOLLOWING
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Followers (ceux qui suivent cet utilisateur)
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'followers', 'user_id', 'follower_id', 'id', 'id')
            ->withTimestamps();
    }

    /**
     * Following (ceux que cet utilisateur suit)
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'followings', 'user_id', 'following_id', 'id', 'id')
            ->withTimestamps();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 6 : RELATIONS - RÔLES & PERMISSIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Rôles de l'utilisateur
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['assigned_by', 'assigned_at', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * Permissions directes
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_permissions')
            ->withPivot(['is_granted', 'granted_by', 'granted_at', 'expires_at'])
            ->withTimestamps();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 7 : RELATIONS - SPÉCIALISATIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Spécialisations (tradipraticiens)
     */
    public function specializations(): BelongsToMany
    {
        return $this->belongsToMany(Specialization::class, 'user_specializations', 'user_id', 'specialization_id')
            ->withPivot('proficiency_level')
            ->withTimestamps();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 8 : MÉTHODES DE VÉRIFICATION - CONNEXIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Vérifier si connecté avec un utilisateur
     */
    public function isConnectedWith(string $userId): bool
    {
        return Connection::betweenUsers($this->id, $userId)
            ->accepted()
            ->exists();
    }

    /**
     * Vérifier si une demande de connexion existe
     */
    public function hasConnectionRequestWith(string $userId): bool
    {
        return Connection::betweenUsers($this->id, $userId)->exists();
    }

    /**
     * Vérifier si demande en attente
     */
    public function hasPendingConnectionWith(string $userId): bool
    {
        return Connection::betweenUsers($this->id, $userId)
            ->pending()
            ->exists();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 9 : MÉTHODES DE VÉRIFICATION - FOLLOW
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Vérifier si suit un utilisateur
     */
    public function isFollowing(string $userId): bool
    {
        return $this->following()->where('following_id', $userId)->exists();
    }

    /**
     * Vérifier si est suivi par un utilisateur
     */
    public function isFollowedBy(string $userId): bool
    {
        return $this->followers()->where('follower_id', $userId)->exists();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 10 : MÉTHODES DE VÉRIFICATION - RÔLES & PERMISSIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Vérifier si l'utilisateur a un rôle
     */
    public function hasRole($roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];
        
        if (in_array($this->role, $roles)) {
            return true;
        }
        
        return $this->roles()
            ->whereIn('slug', $roles)
            ->exists();
    }

    /**
     * Vérifier si super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super-admin';
    }

    /**
     * Vérifier si admin
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super-admin']);
    }

    /**
     * Vérifier si modérateur
     */
    public function isModerator(): bool
    {
        return in_array($this->role, ['moderator', 'admin', 'super-admin']);
    }

    /**
     * Vérifier si tradipraticien
     */
    public function isPractitioner(): bool
    {
        return in_array($this->account_type, ['practitioner', 'expert']);
    }

    /**
     * Vérifier les permissions
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->is_banned) {
            return false;
        }

        if ($this->role === 'super-admin') {
            return true;
        }

        $rolePermissions = [
            'admin' => [
                'view-users', 'create-users', 'edit-users', 'delete-users',
                'ban-users', 'assign-roles', 'verify-practitioners', 'view-logs'
            ],
            'moderator' => [
                'view-users', 'ban-users', 'verify-practitioners'
            ],
            'user' => [
                'create-posts', 'edit-own-posts', 'delete-own-posts'
            ],
        ];

        return in_array($permission, $rolePermissions[$this->role] ?? []);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 11 : MÉTHODES DE VÉRIFICATION - STATUTS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Vérifier si banni
     */
    public function isBanned(): bool
    {
        return $this->is_banned ?? false;
    }

    /**
     * Vérifier si vérifié
     */
    public function isVerified(): bool
    {
        return $this->is_verified ?? false;
    }

    /**
     * Vérifier si expert
     */
    public function isExpert(): bool
    {
        return $this->is_expert ?? false;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 12 : ACTIONS - CONNEXIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Envoyer une demande de connexion
     */
    public function sendConnectionRequestTo(User $user): Connection
    {
        if ($this->hasConnectionRequestWith($user->id)) {
            throw new \Exception('Connection request already exists');
        }

        return Connection::create([
            'from_user_id' => $this->id,
            'to_user_id' => $user->id,
            'status' => 'pending',
        ]);
    }

    /**
     * Accepter une demande de connexion
     */
    public function acceptConnectionFrom(User $user): void
    {
        Connection::where('from_user_id', $user->id)
            ->where('to_user_id', $this->id)
            ->pending()
            ->first()
            ?->accept();
    }

    /**
     * Supprimer une connexion
     */
    public function removeConnectionWith(User $user): void
    {
        Connection::betweenUsers($this->id, $user->id)->delete();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 13 : ACTIONS - FOLLOW
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Suivre un utilisateur
     */
    public function follow(string $userId): void
    {
        if ($this->isFollowing($userId)) {
            return;
        }

        $this->following()->attach($userId);

        \DB::table('followers')->insert([
            'user_id' => $userId,
            'follower_id' => $this->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Ne plus suivre
     */
    public function unfollow(string $userId): void
    {
        $this->following()->detach($userId);

        \DB::table('followers')
            ->where('user_id', $userId)
            ->where('follower_id', $this->id)
            ->delete();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 14 : ACTIONS - MESSAGERIE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Envoyer un message
     */
    public function sendMessageTo(User $receiver, ?string $text = null, ?string $mediaUrl = null): Message
    {
        return Message::create([
            'from_user_id' => $this->id,
            'to_user_id' => $receiver->id,
            'text' => $text,
            'message_type' => $mediaUrl ? 'image' : 'text',
            'media_url' => $mediaUrl,
        ]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 15 : ACTIONS - CONTENU
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Créer une story
     */
    public function createStory(array $data): Story
    {
        return $this->stories()->create($data);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 16 : ACCESSORS (Attributs calculés)
    // ═══════════════════════════════════════════════════════════════════════

    public function getFollowerCountAttribute(): int
    {
        return $this->followers()->count();
    }

    public function getFollowingCountAttribute(): int
    {
        return $this->following()->count();
    }

    public function getPostCountAttribute(): int
    {
        return $this->posts()->count();
    }

    public function getConnectionsCountAttribute(): int
    {
        return $this->connections()->count();
    }


    public function getAccountTypeLabelAttribute(): string
    {
        return match($this->account_type) {
            'practitioner' => 'Tradipraticien',
            'expert' => 'Expert',
            default => 'Utilisateur',
        };
    }

    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            'super-admin' => 'Super Administrateur',
            'admin' => 'Administrateur',
            'moderator' => 'Modérateur',
            default => 'Utilisateur',
        };
    }

    public function getGenderLabelAttribute(): string
    {
        return match($this->gender) {
            'male' => 'Homme',
            'female' => 'Femme',
            'other' => 'Autre',
            'prefer_not_to_say' => 'Non précisé',
            default => 'Non renseigné',
        };
    }

    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->district,
            $this->city,
            $this->region,
            $this->location,
        ]);

        return implode(', ', $parts) ?: 'Non renseignée';
    }

    public function getPriceRangeAttribute(): ?string
    {
        if (!$this->consultation_price_min && !$this->consultation_price_max) {
            return null;
        }

        if ($this->consultation_price_min && $this->consultation_price_max) {
            return number_format($this->consultation_price_min, 0, ',', ' ') . ' - ' .
                   number_format($this->consultation_price_max, 0, ',', ' ') . ' ' .
                   $this->currency;
        }

        if ($this->consultation_price_min) {
            return 'À partir de ' . number_format($this->consultation_price_min, 0, ',', ' ') . ' ' . $this->currency;
        }

        return 'Jusqu\'à ' . number_format($this->consultation_price_max, 0, ',', ' ') . ' ' . $this->currency;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 17 : PROFIL - COMPLÉTION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Calculer le pourcentage de complétion du profil
     */
    public function calculateProfileCompletion(): int
    {
        $weights = [
            'full_name' => 5,
            'email' => 5,
            'username' => 5,
            'phone' => 5,
            'location' => 5,
            'bio' => 5,
            'profile_picture' => 10,
            'date_of_birth' => 5,
            'gender' => 5,
            'region' => 5,
            'city' => 5,
            'languages' => 10,
            'years_of_experience' => 5,
            'specialties' => 5,
            'consultation_price_min' => 5,
            'availability_schedule' => 5,
            'certification_number' => 5,
            'treatment_methods' => 5,
        ];

        $total = 0;
        $obtained = 0;

        foreach ($weights as $field => $weight) {
            if (in_array($field, [
                'years_of_experience', 'specialties', 'consultation_price_min',
                'availability_schedule', 'certification_number', 'treatment_methods'
            ]) && $this->account_type === 'user') {
                continue;
            }

            $total += $weight;
            $value = $this->{$field};
            
            if ($value !== null && $value !== '' && $value !== [] && $value !== '{}') {
                if (is_array($value) && count($value) > 0) {
                    $obtained += $weight;
                } elseif (!is_array($value)) {
                    $obtained += $weight;
                }
            }
        }

        return $total > 0 ? round(($obtained / $total) * 100) : 0;
    }

    /**
     * Mettre à jour la complétion du profil
     */
    public function updateProfileCompletion(): void
    {
        $requiredFields = [
            'full_name', 'username', 'email', 'phone', 'bio', 'location',
        ];
        
        if (in_array($this->account_type, ['practitioner', 'expert'])) {
            $requiredFields = array_merge($requiredFields, [
                'years_of_experience', 'specialties', 'certification_number',
                'consultation_price_min', 'region', 'city',
            ]);
        }
        
        $filledFields = 0;
        $totalFields = count($requiredFields);
        
        foreach ($requiredFields as $field) {
            if (!empty($this->$field)) {
                $filledFields++;
            }
        }
        
        $percentage = $totalFields > 0 ? round(($filledFields / $totalFields) * 100) : 0;
        
        $this->profile_completion_percentage = $percentage;
        $this->is_profile_complete = $percentage >= 80;
        
        $this->saveQuietly();
    }

    /**
     * Champs manquants du profil
     */
    public function getMissingProfileFields(): array
    {
        $requiredFields = [
            'full_name' => 'Nom complet',
            'username' => "Nom d'utilisateur",
            'email' => 'Email',
            'phone' => 'Téléphone',
            'bio' => 'Biographie',
            'location' => 'Localisation',
            'profile_picture' => 'Photo de profil',
        ];
        
        if (in_array($this->account_type, ['practitioner', 'expert'])) {
            $requiredFields = array_merge($requiredFields, [
                'years_of_experience' => "Années d'expérience",
                'specialties' => 'Spécialités',
                'certification_number' => 'Numéro de certification',
                'consultation_price_min' => 'Tarif minimum',
                'region' => 'Région',
                'city' => 'Ville',
            ]);
        }
        
        $missingFields = [];
        
        foreach ($requiredFields as $field => $label) {
            if (empty($this->$field)) {
                $missingFields[] = $label;
            }
        }
        
        return $missingFields;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 18 : SCOPES (Requêtes personnalisées)
    // ═══════════════════════════════════════════════════════════════════════

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('is_banned', false);
    }

    public function scopeVerifiedPractitioners($query)
    {
        return $query->whereIn('account_type', ['practitioner', 'expert'])
            ->where('is_verified', true)
            ->where('is_profile_complete', true)
            ->where('is_active', true);
    }

    public function scopeInRegion($query, string $region)
    {
        return $query->where('region', $region);
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('city', $city);
    }

    public function scopeSearchable($query)
    {
        return $query->where('is_searchable', true);
    }


    
}