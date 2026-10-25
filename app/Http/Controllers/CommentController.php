<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommentController extends Controller
{
    /**
     * Formater un commentaire avec ses réponses de manière récursive
     */
    private function formatComment($comment, $authUser)
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => $comment->created_at,
            'user' => [
                'id' => $comment->user->id,
                'full_name' => $comment->user->full_name,
                'username' => $comment->user->username,
                'profile_picture' => $comment->user->profile_picture,
            ],
            'likes_count' => $comment->likedBy()->count(),
            'is_liked' => $comment->isLikedBy($authUser),
            'replies' => $comment->replies->map(function ($reply) use ($authUser) {
                return $this->formatComment($reply, $authUser);
            })->values()->all(),
        ];
    }

    /**
     * Récupérer tous les commentaires d'un post
     */
    // public function index(Post $post)
    // {
    //     $comments = $post->comments()
    //         ->whereNull('parent_id')
    //         ->with([
    //             'user:id,full_name,username,profile_picture',
    //             'replies.user:id,full_name,username,profile_picture',
    //             'replies.replies.user:id,full_name,username,profile_picture', // Niveau 2
    //             'replies.replies.replies.user:id,full_name,username,profile_picture', // Niveau 3
    //         ])
    //         ->orderBy('created_at', 'desc')
    //         ->get()
    //         ->map(function ($comment) {
    //             return $this->formatComment($comment, auth()->user());
    //         });

    //     $commentsCount = $post->comments()->count();

    //     return Inertia::render('frontend/feed', [
    //         'comments' => $comments,
    //         'commentsCount' => $commentsCount,
    //         'postId' => $post->id,
    //     ]);
    // }

    /**
     * Récupérer tous les commentaires d'un post (JSON uniquement)
     */
    public function index(Post $post)
    {
        $comments = $post->comments()
            ->whereNull('parent_id')
            ->with([
                'user:id,full_name,username,profile_picture',
                'replies.user:id,full_name,username,profile_picture',
                'replies.replies.user:id,full_name,username,profile_picture',
                'replies.replies.replies.user:id,full_name,username,profile_picture',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                return $this->formatComment($comment, auth()->user());
            });

        $commentsCount = $post->comments()->count();

        // Toujours retourner du JSON
        return response()->json([
            'comments' => $comments,
            'commentsCount' => $commentsCount,
        ]);
    }


    /**
     * Créer un nouveau commentaire ou réponse
     */
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // Récupérer parent_id de manière sécurisée
        $parentId = $request->input('parent_id', null);

        // Si c'est une réponse, vérifier que le parent appartient bien à ce post
        if ($parentId) {
            $parentComment = Comment::find($parentId);
            if (!$parentComment || $parentComment->post_id !== $post->id) {
                return back()->withErrors([
                    'parent_id' => 'Le commentaire parent n\'appartient pas à ce post.'
                ]);
            }
        }
        $comment = $post->comments()->create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'user_id' => auth()->id(),
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return back();
    }

    /**
     * Toggle like/unlike sur un commentaire
     */
    public function toggleLike(Comment $comment)
    {
        $user = auth()->user();

        if ($comment->isLikedBy($user)) {
            $comment->unlike($user);
        } else {
            $comment->like($user);
        }

        return back();
    }

    /**
     * Supprimer un commentaire (et toutes ses réponses en cascade)
     */
    public function destroy(Comment $comment)
    {
        // Vérifier que l'utilisateur est le propriétaire
        if ($comment->user_id !== auth()->id()) {
            return back()->withErrors([
                'error' => 'Vous n\'êtes pas autorisé à supprimer ce commentaire.'
            ]);
        }

        // La suppression en cascade est gérée par la base de données (onDelete cascade)
        $comment->delete();

        return back()->with('success', 'Commentaire supprimé avec succès');
    }
}