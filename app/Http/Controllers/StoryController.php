<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;

class StoryController extends Controller
{
    /**
     * Récupérer toutes les stories actives des connexions de l'utilisateur
     * GET /stories
     */
        public function index()
    {
        $currentUser = auth()->user();
        
        // Récupérer les IDs des utilisateurs suivis + connexions
        $followingIds = $currentUser->following()->pluck('following_id');
        $connectionIds = $currentUser->connections()->pluck('id');
        
        // Fusionner et ajouter l'utilisateur actuel
        $userIds = $followingIds->merge($connectionIds)->push($currentUser->id)->unique();
        
        // Récupérer les stories actives groupées par utilisateur
        // Tri ASC : du plus ancien au plus récent à l'intérieur de chaque groupe
        $stories = Story::whereIn('user_id', $userIds)
            ->active()
            ->with('user:id,full_name,username,profile_picture')
            ->orderBy('created_at', 'asc')   // ← plus ancien en premier
            ->get()
            ->groupBy('user_id')
            ->map(function ($userStories) {
                // Les stories sont déjà triées ASC (plus ancien → plus récent)
                $lastStory = $userStories->last(); // la plus récente du groupe

                return [
                    'user'         => $userStories->first()->user,
                    'stories'      => $userStories->map(function ($story) {
                        return [
                            'id'               => $story->id,
                            'content'          => $story->content,
                            'media_type'       => $story->media_type,
                            'media_url'        => $story->media_url,
                            'background_color' => $story->background_color,
                            'created_at'       => $story->created_at,
                            'expires_at'       => $story->expires_at,
                        ];
                    })->values(),
                    'stories_count' => $userStories->count(),
                    // last_story_at = date de la story la plus récente (pour trier les groupes)
                    'last_story_at' => $lastStory->created_at,
                ];
            })
            // Les groupes d'utilisateurs restent triés par activité la plus récente en premier
            ->sortByDesc('last_story_at')
            ->values();
        
        return response()->json([
            'stories' => $stories
        ]);
    }
    /**
     * Créer une nouvelle story
     * POST /stories
     */
    public function store(Request $request)
    {
        // Validation selon le type
        $request->validate([
            'media_type' => 'required|in:text,image,video',
            'content' => 'required_if:media_type,text|string|max:500',
            'media' => 'required_if:media_type,image,video|file|mimes:jpeg,jpg,png,gif,mp4,mov,avi|max:10240',
            'background_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);
        
        $currentUser = auth()->user();
        $mediaUrl = null;
        $mediaType = $request->media_type;
        
        // Gérer l'upload de média si présent
        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $path = $file->store('stories', 'public');
            $mediaUrl = asset('storage/' . $path);
            
            // Déterminer automatiquement le type si c'est une image ou vidéo
            if ($file->getMimeType() && str_starts_with($file->getMimeType(), 'image')) {
                $mediaType = 'image';
            } elseif ($file->getMimeType() && str_starts_with($file->getMimeType(), 'video')) {
                $mediaType = 'video';
            }
        }
        
        // Créer la story
        $story = Story::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $currentUser->id,
            'content' => $request->content,
            'media_type' => $mediaType,
            'media_url' => $mediaUrl,
            'background_color' => $request->background_color ?? '#4f46e5',
            'expires_at' => Carbon::now()->addHours(24),
        ]);
        
        // Charger la relation user
        $story->load('user:id,full_name,username,profile_picture');
        
        return redirect()->back()->with('success', 'Story created successfully');
    }

    /**
     * Récupérer les stories d'un utilisateur spécifique
     * GET /stories/{user}
     */
    public function show(User $user)
    {
        $stories = Story::where('user_id', $user->id)
            ->active()
            ->with('user:id,full_name,username,profile_picture')
            ->recent()
            ->get()
            ->map(function ($story) {
                return [
                    'id' => $story->id,
                    'content' => $story->content,
                    'media_type' => $story->media_type,
                    'media_url' => $story->media_url,
                    'background_color' => $story->background_color,
                    'created_at' => $story->created_at,
                    'expires_at' => $story->expires_at,
                    'user' => $story->user,
                ];
            });
        
        return response()->json([
            'user' => $user,
            'stories' => $stories
        ]);
    }

    /**
     * Supprimer une story
     * DELETE /stories/{story}
     */
    public function destroy(Story $story)
    {
        $currentUser = auth()->user();
        
        // Vérifier que l'utilisateur est le propriétaire
        if ($story->user_id !== $currentUser->id) {
            abort(403, 'Unauthorized action.');
        }
        
        // Supprimer le média du storage si présent
        if ($story->media_url) {
            $mediaPath = str_replace(asset('storage/'), '', $story->media_url);
            \Storage::disk('public')->delete($mediaPath);
        }
        
        $story->delete();
        
        return redirect()->back()->with('success', 'Story deleted successfully');
    }

    /**
     * Nettoyer les stories expirées (commande cron)
     * DELETE /stories/cleanup
     */
    public function cleanup()
    {
        $expiredStories = Story::expired()->get();
        
        foreach ($expiredStories as $story) {
            // Supprimer le média du storage
            if ($story->media_url) {
                $mediaPath = str_replace(asset('storage/'), '', $story->media_url);
                \Storage::disk('public')->delete($mediaPath);
            }
            
            $story->delete();
        }
        
        return response()->json([
            'message' => 'Expired stories cleaned up',
            'deleted_count' => $expiredStories->count()
        ]);
    }
}