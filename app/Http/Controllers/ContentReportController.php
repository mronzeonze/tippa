<?php

namespace App\Http\Controllers;

use App\Models\ContentReport;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContentReportController extends Controller
{
    /**
     * Signaler un post
     */
    public function reportPost(Request $request, Post $post)
    {
        $validated = $request->validate([
            'reason' => 'required|in:spam,harassment,fake_information,inappropriate_content,hate_speech,violence,sexual_content,other',
            'description' => 'nullable|string|max:1000',
        ]);

        $userId = auth()->id();

        // Vérifier si l'utilisateur a déjà signalé ce post
        if (ContentReport::hasUserReported($userId, 'post', $post->id)) {
            return back()->withErrors(['error' => 'Vous avez déjà signalé ce contenu']);
        }
        
        ContentReport::create([
            'id' => Str::uuid()->toString(),
            'reporter_id' => $userId,
            'reported_id' => $post->user_id,
            'reportable_type' => 'post',
            'reportable_id' => $post->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Signalement envoyé. Merci de contribuer à maintenir notre communauté saine.');
    }

    /**
     * Signaler un commentaire
     */
    public function reportComment(Request $request, Comment $comment)
    {
        $validated = $request->validate([
            'reason' => 'required|in:spam,harassment,fake_information,inappropriate_content,hate_speech,violence,sexual_content,other',
            'description' => 'nullable|string|max:1000',
        ]);

        $userId = auth()->id();

        // Vérifier si l'utilisateur a déjà signalé ce commentaire
        if (ContentReport::hasUserReported($userId, 'comment', $comment->id)) {
            return back()->withErrors(['error' => 'Vous avez déjà signalé ce contenu']);
        }

        ContentReport::create([
            'id' => Str::uuid()->toString(),
            'reporter_id' => $userId,
            'reported_id' => $comment->user->id,
            'reportable_type' => 'comment',
            'reportable_id' => $comment->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Signalement envoyé. Merci de contribuer à maintenir notre communauté saine.');
    }

    /**
     * Vérifier si un contenu a été signalé par l'utilisateur
     */
    public function checkReport(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:post,comment',
            'id' => 'required|uuid',
        ]);

        $hasReported = ContentReport::hasUserReported(
            auth()->id(),
            $validated['type'],
            $validated['id']
        );

        return response()->json(['has_reported' => $hasReported]);
    }
}