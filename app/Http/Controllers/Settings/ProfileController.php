<?php

namespace App\Http\Controllers\Settings;

use App\Models\Post;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Share;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\Specialization;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Http\Requests\Settings\ProfileUpdateRequest;

class ProfileController extends Controller
{
    /**
     * Afficher la page de complétion du profil
     */
    public function index()
    {
        $user = auth()->user();
                
        // Calculer la complétion
        $user->updateProfileCompletion();
        
        return Inertia::render('settings/profile', [
            'user' => $user->load('specializations'),
            'completion_percentage' => $user->profile_completion_percentage,
            'missing_fields' => $user->getMissingProfileFields(),
            'is_practitioner' => in_array($user->account_type, ['practitioner', 'expert']),
        ]);
    }

    /**
     * Mettre à jour les informations personnelles
     */
    public function updatePersonalInfo(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'full_name'         => 'required|string|max:255',
            'username'          => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('users')->ignore($user->id)],
            'bio'               => 'nullable|string|max:500',
            'phone'             => 'required|string|max:20',
            'phone_secondary'   => 'nullable|string|max:20',
            'whatsapp'          => 'nullable|string|max:20',
            'email'             => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'date_of_birth'     => 'nullable|date|before:today',
            'gender'            => 'nullable|in:male,female',
            'nationality'       => 'nullable|string|max:100',
        ]);

        $user->update($validated);
        $user->updateProfileCompletion();

        return back()->with('success', 'Informations personnelles mises à jour');
    }

    /**
     * Mettre à jour la localisation
     */
    public function updateLocation(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'region'   => 'nullable|string|max:100',
            'city'     => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'address'  => 'nullable|string|max:500',
        ]);

        $user->update($validated);
        $user->updateProfileCompletion();

        return back()->with('success', 'Localisation mise à jour');
    }

    /**
     * Mettre à jour les informations professionnelles (tradipraticiens) - Spécialisations
     */
    public function updateSpecialization(Request $request)
    {
        $user = auth()->user();
        
        if (!in_array($user->account_type, ['practitioner', 'expert'])) {
            return back()->withErrors(['error' => 'Accès refusé']);
        }

        $validated = $request->validate([
            'specialization_ids'    => 'nullable|array',
            'specialization_ids.*'  => 'exists:specializations,id',
            'proficiency_levels'    => 'nullable|array',
            'proficiency_levels.*'  => 'in:beginner,intermediate,advanced,expert',
        ]);

        if (isset($validated['specialization_ids']) && is_array($validated['specialization_ids'])) {
            $specializationsData = [];
            foreach ($validated['specialization_ids'] as $index => $specializationId) {
                $proficiencyLevel = $validated['proficiency_levels'][$index] ?? 'intermediate';
                $specializationsData[$specializationId] = ['proficiency_level' => $proficiencyLevel];
            }
            $user->specializations()->sync($specializationsData);
        } else {
            $user->specializations()->detach();
        }

        $user->updateProfileCompletion();

        return back()->with('success', 'Informations de spécialisation mises à jour');
    }

    /**
     * Mettre à jour les informations professionnelles (tradipraticiens)
     */
    public function updateProfessionalInfo(Request $request)
    {
        $user = auth()->user();
        
        if (!in_array($user->account_type, ['practitioner', 'expert'])) {
            return back()->withErrors(['error' => 'Accès refusé']);
        }

        $validated = $request->validate([
            'years_of_experience'       => 'nullable|integer|min:0|max:100',
            'specialization_ids'        => 'nullable|array',
            'specialization_ids.*'      => 'exists:specializations,id',
            'proficiency_levels'        => 'nullable|array',
            'proficiency_levels.*'      => 'in:beginner,intermediate,advanced,expert',
            'languages'                 => 'nullable|string|max:500',
            'treatment_methods'         => 'nullable|string|max:1000',
            'intervention_radius_km'    => 'nullable|integer|min:0|max:500',
            'certification_number'      => 'nullable|string|max:100',
            'professional_affiliations' => 'nullable|string|max:1000',
        ]);

        $data = [
            'years_of_experience'       => $validated['years_of_experience'] ?? null,
            'specialties'               => $validated['specialties'] ?? null,
            'intervention_radius_km'    => $validated['intervention_radius_km'] ?? null,
            'certification_number'      => $validated['certification_number'] ?? null,
            'languages'                 => isset($validated['languages'])
                ? array_filter(array_map('trim', explode(',', $validated['languages'])))
                : [],
            'treatment_methods'         => isset($validated['treatment_methods'])
                ? array_filter(array_map('trim', explode(',', $validated['treatment_methods'])))
                : [],
            'professional_affiliations' => isset($validated['professional_affiliations'])
                ? array_filter(array_map('trim', explode(',', $validated['professional_affiliations'])))
                : [],
        ];

        $user->update($data);
        $user->updateProfileCompletion();

        return back()->with('success', 'Informations professionnelles mises à jour');
    }

    /**
     * Mettre à jour les tarifs
     */
    public function updatePricing(Request $request)
    { 
        $user = auth()->user();
        
        if (!in_array($user->account_type, ['practitioner', 'expert'])) {
            return back()->withErrors(['error' => 'Accès refusé']);
        }
        
        $validated = $request->validate([
            'consultation_price_min'        => 'nullable|numeric|min:0',
            'consultation_price_max'        => 'nullable|numeric|min:0|gte:consultation_price_min',
            'currency'                      => 'nullable|string|max:10',
            'home_consultation_available'   => 'nullable|boolean',
            'payment_methods'               => 'nullable|array',
            'payment_methods.*'             => 'string|in:cash,mobile_money,bank_transfer,credit_card',
            'pricing_notes'                 => 'nullable|string|max:2000',
        ]);
        
        if (isset($validated['payment_methods'])) {
            $validated['payment_methods'] = array_filter($validated['payment_methods']);
        } else {
            $validated['payment_methods'] = [];
        }

        $user->update($validated);
        $user->updateProfileCompletion();

        return back()->with('success', 'Tarifs mis à jour');
    }

    /**
     * Mettre à jour les disponibilités
     */
    public function updateAvailability(Request $request)
    {
        $user = auth()->user();
        
        if (!in_array($user->account_type, ['practitioner', 'expert'])) {
            return back()->withErrors(['error' => 'Accès refusé']);
        }
        
        $validated = $request->validate([
            'availability_schedule'             => 'required|array|size:7',
            'availability_schedule.*.day'       => 'required|string',
            'availability_schedule.*.open'      => 'required|boolean',
            'availability_schedule.*.slots'     => 'required|array',
            'availability_schedule.*.slots.*.start' => 'required_if:availability_schedule.*.open,true|nullable|date_format:H:i',
            'availability_schedule.*.slots.*.end'   => 'required_if:availability_schedule.*.open,true|nullable|date_format:H:i|after:availability_schedule.*.slots.*.start',
            'consultation_duration_minutes'     => 'nullable|integer|min:15|max:480',
            'accepts_emergencies'               => 'nullable|boolean',
            'online_consultation_available'     => 'nullable|boolean',
            'home_consultation_available'       => 'nullable|boolean',
        ]);
        
        $data = [
            'availability_schedule'         => $validated['availability_schedule'],
            'consultation_duration_minutes' => $validated['consultation_duration_minutes'] ?? 60,
            'accepts_emergencies'           => $validated['accepts_emergencies'] ?? false,
            'online_consultation_available' => $validated['online_consultation_available'] ?? false,
            'home_consultation_available'   => $validated['home_consultation_available'] ?? false,
        ];
            
        $user->update($data);
        $user->updateProfileCompletion();

        return back()->with('success', 'Disponibilités mises à jour');
    }

    /**
     * Mettre à jour les formations
     */
    public function updateTrainings(Request $request)
    {
        $user = auth()->user();
        
        if (!in_array($user->account_type, ['practitioner', 'expert'])) {
            return back()->withErrors(['error' => 'Accès refusé']);
        }
        
        $validated = $request->validate([
            'trainings'                 => 'nullable|array',
            'trainings.*.title'         => 'required|string|max:255',
            'trainings.*.institution'   => 'nullable|string|max:255',
            'trainings.*.year'          => 'nullable|integer|min:1900|max:' . date('Y'),
            'trainings.*.certificate_url' => 'nullable|url',
            'degrees'                   => 'nullable|array',
            'degrees.*.title'           => 'required|string|max:255',
            'degrees.*.institution'     => 'nullable|string|max:255',
            'degrees.*.year'            => 'nullable|integer|min:1900|max:' . date('Y'),
        ]);

        $user->update($validated);
        $user->updateProfileCompletion();

        return back()->with('success', 'Formations mises à jour');
    }

    /**
     * Mettre à jour les réseaux sociaux
     */
    public function updateSocialMedia(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'website'       => 'nullable|url|max:255',
            'facebook_url'  => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'youtube_url'   => 'nullable|url|max:255',
            'linkedin_url'  => 'nullable|url|max:255',
            'tiktok_url'    => 'nullable|url|max:255',
        ]);

        $user->update($validated);
        $user->updateProfileCompletion();

        return back()->with('success', 'Réseaux sociaux mis à jour');
    }

    /**
     * Mettre à jour les préférences (dont is_private)
     */
    public function updatePreferences(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'preferred_language'                => 'nullable|string|max:10',
            'email_notifications_enabled'       => 'nullable|boolean',
            'push_notifications_enabled'        => 'nullable|boolean',
            'message_notifications_enabled'     => 'nullable|boolean',
            'is_searchable'                     => 'nullable|boolean',
            'is_private'                        => 'nullable|boolean',
            'show_phone_on_profile'             => 'nullable|boolean',
        ]);
        
        $preferences = [
            'preferred_language'            => $validated['preferred_language'] ?? 'fr',
            'email_notifications_enabled'   => $validated['email_notifications_enabled'] ?? false,
            'push_notifications_enabled'    => $validated['push_notifications_enabled'] ?? false,
            'message_notifications_enabled' => $validated['message_notifications_enabled'] ?? false,
            'is_searchable'                 => $validated['is_searchable'] ?? false,
            'is_private'                    => $validated['is_private'] ?? false,
            'show_phone_on_profile'         => $validated['show_phone_on_profile'] ?? false,
        ];
        
        $user->update($preferences);

        return back()->with('success', 'Préférences mises à jour');
    }

    /**
     * Upload de photo de profil
     */
    public function uploadProfilePicture(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,jpg,png,gif|max:5120',
        ]);

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                $oldPath = str_replace(asset('storage/'), '', $user->profile_picture);
                \Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('profile_picture')->store('profiles', 'public');
            $user->update(['profile_picture' => asset('storage/' . $path)]);
            $user->updateProfileCompletion();

            return back()->with('success', 'Photo de profil mise à jour');
        }

        return back()->withErrors(['error' => 'Erreur lors du téléchargement']);
    }

    /**
     * Upload de photo de couverture
     */
    public function uploadCoverPhoto(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'cover_photo' => 'required|image|mimes:jpeg,jpg,png,gif|max:5120',
        ]);

        if ($request->hasFile('cover_photo')) {
            if ($user->cover_photo) {
                $oldPath = str_replace(asset('storage/'), '', $user->cover_photo);
                \Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('cover_photo')->store('covers', 'public');
            $user->update(['cover_photo' => asset('storage/' . $path)]);
            $user->updateProfileCompletion();

            return back()->with('success', 'Photo de couverture mise à jour');
        }

        return back()->withErrors(['error' => 'Erreur lors du téléchargement']);
    }

    /**
     * Obtenir les statistiques de complétion
     */
    public function getCompletionStats()
    {
        $user = auth()->user();
        $user->updateProfileCompletion();

        return response()->json([
            'percentage'    => $user->profile_completion_percentage,
            'is_complete'   => $user->is_profile_complete,
            'missing_fields' => $user->getMissingProfileFields(),
        ]);
    }

    /**
     * Afficher la page des paramètres de profil
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        $user->updateProfileCompletion();
        
        $specializations = Specialization::active()->orderBy('name')->get();
        $isPractitioner  = in_array($user->account_type, ['practitioner', 'expert']);
        
        return Inertia::render('settings/profile', [
            'mustVerifyEmail'       => $request->user() instanceof MustVerifyEmail,
            'status'                => $request->session()->get('status'),
            'user'                  => $user,
            'specializations'       => $specializations,
            'userSpecializationIds' => $user->specializations->pluck('id')->toArray(),
            'completion_percentage' => $user->profile_completion_percentage ?? 0,
            'missing_fields'        => $user->getMissingProfileFields() ?? [],
            'is_practitioner'       => $isPractitioner,
        ]);
    }

    /**
     * Mettre à jour les paramètres de profil
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Supprimer le compte utilisateur
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $user = $request->user();

        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Mettre à jour les informations du profil (photo + infos de base)
     */
    public function updateInfo(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'full_name'       => 'required|string|max:255',
            'username'        => 'required|string|max:255|unique:users,username,' . $user->id,
            'bio'             => 'nullable|string|max:500',
            'location'        => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
            'cover_photo'     => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
        ]);
        
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profiles', 'public');
            $validated['profile_picture'] = asset('storage/' . $path);
        }
        
        if ($request->hasFile('cover_photo')) {
            $path = $request->file('cover_photo')->store('covers', 'public');
            $validated['cover_photo'] = asset('storage/' . $path);
        }
        
        $user->update($validated);
        
        return redirect()->route('profile.show', $user)->with('success', 'Profil mis à jour avec succès');
    }

    // ============================================================================
    // AFFICHER LE PROFIL D'UN UTILISATEUR
    // ============================================================================
    //
    // Règles de visibilité appliquées ici :
    //
    //  • Compte public  (is_private = 0) → tout le monde voit le profil et les posts
    //  • Compte privé   (is_private = 1) :
    //      - Propriétaire du profil         → accès total
    //      - Visiteur abonné (isFollowing)  → accès total
    //      - Visiteur non abonné            → profil minimaliste + écran de verrouillage
    //
    // Le flag `relationship.is_private_locked` est envoyé au frontend pour
    // décider d'afficher l'écran de verrouillage plutôt que les onglets.
    // ============================================================================

    public function show($userId)
    {
        // ----------------------------------------
        // ÉTAPE 1 : Récupérer les utilisateurs
        // ----------------------------------------

        $user        = User::findOrFail($userId);
        $currentUser = auth()->user();

        $isOwnProfile  = $currentUser->id === (int) $userId;
        $isFollowing   = $currentUser->isFollowing($userId);

        // ----------------------------------------
        // ÉTAPE 2 : Vérifier la confidentialité
        // ----------------------------------------
        //
        // Un visiteur peut voir le contenu si :
        //   (a) c'est son propre profil
        //   (b) il est abonné à cet utilisateur
        //   (c) le compte est public
        //
        $canViewContent = $isOwnProfile
            || $isFollowing
            || ! $user->is_private;

        // ----------------------------------------
        // ÉTAPE 3 : Profil verrouillé → données minimales
        // ----------------------------------------

        if (! $canViewContent) {
            $relationship = [
                'is_own_profile'      => false,
                'is_following'        => false,
                'is_follower'         => $user->isFollowing($currentUser->id),
                'is_connected'        => $currentUser->isConnectedWith($userId),
                'has_pending_request' => $currentUser->hasPendingConnectionWith($userId),
                // 🔒 Flag consommé par le frontend pour afficher l'écran de verrouillage
                'is_private_locked'   => true,
            ];

            // On expose uniquement les statistiques sociales (followers / following)
            // et aucun contenu (posts, médias, partages)
            $stats = [
                'posts_count'     => 0,  // masqué
                'likes_count'     => 0,  // masqué
                'shares_count'    => 0,  // masqué
                'reposts_count'   => 0,  // masqué
                'quotes_count'    => 0,  // masqué
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
                'connections_count' => $user->connections()->count(),
            ];

            return Inertia::render('frontend/profile', [
                'profile_user' => $user,
                'posts'        => ['data' => [], 'current_page' => 1, 'total' => 0],
                'shares'       => ['data' => [], 'current_page' => 1, 'total' => 0],
                'media_posts'  => [],
                'liked_posts'  => null,
                'stats'        => $stats,
                'relationship' => $relationship,
                'auth'         => [
                    'user' => $currentUser->load(['specializations', 'roles']),
                ],
            ]);
        }

        // ----------------------------------------
        // ÉTAPE 4 : Charger les posts originaux
        // ----------------------------------------

        $originalPosts = Post::where('user_id', $userId)
            ->with([
                'user:id,full_name,username,profile_picture',
                'images:id,post_id,image_url',
            ])
            ->withCount([
                'likedBy as likes_count',
                'comments as comments_count',
                'shares as shares_count',
                'reposts as reposts_count',
            ])
            ->latest()
            ->get()
            ->map(function ($post) use ($currentUser) {
                $post->item_type   = 'post';
                $post->is_liked    = $post->isLikedBy($currentUser);
                $post->is_reposted = $post->isRepostedBy($currentUser);
                return $post;
            });

        // ----------------------------------------
        // ÉTAPE 5 : Charger les partages (reposts + citations)
        // ----------------------------------------

        $allShares = Share::where('user_id', $userId)
            ->whereIn('share_type', ['repost', 'quote'])
            ->with([
                'user:id,full_name,username,profile_picture',
                'post' => function ($query) {
                    $query->with([
                        'user:id,full_name,username,profile_picture',
                        'images:id,post_id,image_url',
                    ])
                    ->withCount([
                        'likedBy as likes_count',
                        'comments as comments_count',
                        'shares as shares_count',
                        'reposts as reposts_count',
                    ]);
                },
            ])
            ->latest()
            ->get()
            ->map(function ($share) use ($currentUser) {
                $post = $share->post;

                $post->item_type      = $share->share_type;
                $post->share_id       = $share->id;
                $post->reposted_by    = $share->user;
                $post->repost_content = $share->content;
                $post->repost_date    = $share->created_at;
                $post->original_author = $post->user;

                $post->likes_count    = $post->likedBy()->count();
                $post->comments_count = $post->comments()->count();
                $post->shares_count   = $post->shares()->count();
                $post->reposts_count  = $post->reposts()->count();
                $post->is_liked       = $post->isLikedBy($currentUser);
                $post->is_reposted    = $post->isRepostedBy($currentUser);

                return $post;
            });

        // ----------------------------------------
        // ÉTAPE 6 : Charger les médias
        // ----------------------------------------

        $mediaPosts = Post::where('user_id', $userId)
            ->whereIn('post_type', ['image', 'text_with_image'])
            ->with('images')
            ->latest()
            ->get();

        // ----------------------------------------
        // ÉTAPE 7 : Charger les posts likés (propriétaire uniquement)
        // ----------------------------------------

        $likedPosts  = null;
        $likesCount  = 0;

        if ($isOwnProfile) {
            $likedPosts = $user->likedPosts()
                ->with([
                    'user:id,full_name,username,profile_picture',
                    'images:id,post_id,image_url',
                ])
                ->withCount([
                    'likedBy as likes_count',
                    'comments as comments_count',
                    'shares as shares_count',
                    'reposts as reposts_count',
                ])
                ->latest()
                ->paginate(50)
                ->through(function ($post) use ($currentUser) {
                    $post->item_type   = 'post';
                    $post->is_liked    = $post->isLikedBy($currentUser);
                    $post->is_reposted = $post->isRepostedBy($currentUser);
                    return $post;
                });

            $likesCount = $user->likedPosts()->count();
        }

        // ----------------------------------------
        // ÉTAPE 8 : Calculer les statistiques
        // ----------------------------------------

        $stats = [
            'posts_count'      => $originalPosts->count(),
            'likes_count'      => $likesCount,
            'shares_count'     => $allShares->count(),
            'reposts_count'    => $allShares->where('item_type', 'repost')->count(),
            'quotes_count'     => $allShares->where('item_type', 'quote')->count(),
            'followers_count'  => $user->followers()->count(),
            'following_count'  => $user->following()->count(),
            'connections_count' => $user->connections()->count(),
        ];

        // ----------------------------------------
        // ÉTAPE 9 : Déterminer les relations
        // ----------------------------------------

        $relationship = [
            'is_own_profile'      => $isOwnProfile,
            'is_following'        => $isFollowing,
            'is_follower'         => $user->isFollowing($currentUser->id),
            'is_connected'        => $currentUser->isConnectedWith($userId),
            'has_pending_request' => $currentUser->hasPendingConnectionWith($userId),
            // Compte accessible → pas de verrouillage
            'is_private_locked'   => false,
        ];

        // ----------------------------------------
        // ÉTAPE 10 : Préparer la pagination et retourner la vue
        // ----------------------------------------

        $postsPagination = [
            'data'         => $originalPosts->values()->all(),
            'current_page' => 1,
            'total'        => $originalPosts->count(),
        ];

        $sharesPagination = [
            'data'         => $allShares->values()->all(),
            'current_page' => 1,
            'total'        => $allShares->count(),
        ];

        return Inertia::render('frontend/profile', [
            'profile_user' => $user,
            'posts'        => $postsPagination,
            'shares'       => $sharesPagination,
            'media_posts'  => $mediaPosts,
            'liked_posts'  => $likedPosts,
            'stats'        => $stats,
            'relationship' => $relationship,
            'auth'         => [
                'user' => $currentUser->load(['specializations', 'roles']),
            ],
        ]);
    }
}