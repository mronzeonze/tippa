<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Share;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ShareController extends Controller
{
    /**
     * Republier un post
     */
    public function repost(Request $request, Post $post)
    {
        $user = auth()->user();

        // Vérifier si déjà republié
        if ($post->isRepostedBy($user)) {
            // Annuler la republication
            $post->unrepost($user);
            
            return back()->with('success', 'Republication annulée');
        }

        // Validation optionnelle du contenu
        $validated = $request->validate([
            'content' => 'nullable|string|max:500',
        ]);

        // Créer la republication
        $post->repost($user, $validated['content'] ?? null);

        return back()->with('success', 'Post republié avec succès');
    }

    

    /**
     * Enregistrer un partage externe (réseaux sociaux)
     */
    public function shareExternal(Request $request, Post $post)
    {
        $validated = $request->validate([
            'share_type' => 'required|in:facebook,twitter,linkedin,whatsapp,copy_link',
        ]);

        // Créer un enregistrement de partage
        Share::create([
            'id' => Str::uuid()->toString(),
            'user_id' => auth()->id(),
            'post_id' => $post->id,
            'share_type' => $validated['share_type'],
        ]);

        return back()->with('success', 'Partage enregistré');
    }

    /**
     * Récupérer les statistiques de partage d'un post
     */
    public function getShareStats(Post $post)
    {
        $stats = [
            'total_shares' => $post->shares()->count(),
            'reposts' => $post->reposts()->count(),
            'facebook' => $post->shares()->where('share_type', 'facebook')->count(),
            'twitter' => $post->shares()->where('share_type', 'twitter')->count(),
            'linkedin' => $post->shares()->where('share_type', 'linkedin')->count(),
            'whatsapp' => $post->shares()->where('share_type', 'whatsapp')->count(),
            'copy_link' => $post->shares()->where('share_type', 'copy_link')->count(),
        ];

        return response()->json($stats);
    }
}