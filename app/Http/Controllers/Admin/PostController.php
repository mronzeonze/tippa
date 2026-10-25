<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use App\Models\Post;
use App\Models\User;
use Inertia\Inertia;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class PostController extends AdminController
{
    /**
     * Liste des publications avec filtres
     * GET /admin/posts
     */
    public function posts(Request $request)
    {
        $query = Post::with([
            'user:id,full_name,username,profile_picture,account_type',
            'images',
            'likedBy',
        ])
        ->withCount([
            'likedBy as likes_count',
            'comments as comments_count',
            'shares as shares_count'
        ]);

        
        // Filtres
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('content', 'LIKE', "%{$search}%");
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('post_type')) {
            $query->where('post_type', $request->post_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $query->orderBy($sortBy, $sortOrder);

        // Statistiques globales
        $stats = [
            'total_posts' => Post::count(),
            'posts_today' => Post::whereDate('created_at', Carbon::today())->count(),
            'posts_week' => Post::where('created_at', '>=', Carbon::now()->subWeek())->count(),
            'posts_month' => Post::where('created_at', '>=', Carbon::now()->subMonth())->count(),
            'text_posts' => Post::where('post_type', 'text')->count(),
            'image_posts' => Post::whereIn('post_type', ['image', 'text_with_image'])->count(),
            'total_likes' => DB::table('post_likes')->count(),
            'total_comments' => DB::table('comments')->count(),
            'total_shares' => DB::table('shares')->count(),
        ];

        // Pagination
        $posts = $query->paginate(50);
        // dd($posts);
        return Inertia::render('admin/posts/index', [
            'posts' => $posts,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'user_id' => $request->user_id,
                'post_type' => $request->post_type,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'post_types' => [
                'text' => 'Texte',
                'image' => 'Image',
                'text_with_image' => 'Texte + Image',
            ],
            'auth'=> $this->buildAuthPayload(),
        ]);
    }

    /**
     * Supprimer une publication
     * DELETE /admin/posts/{post}
     */
    public function deletePost(Request $request, Post $post)
    {
        // Vérifier les permissions
        if (!auth()->user()->hasPermission('delete-posts')) {
            abort(403, 'Vous n\'avez pas la permission de supprimer des publications');
        }

        // Sauvegarder les infos pour le log
        $postInfo = [
            'id' => $post->id,
            'user_id' => $post->user_id,
            'user_name' => $post->user->full_name,
            'content' => substr($post->content, 0, 100),
            'post_type' => $post->post_type,
            'created_at' => $post->created_at,
        ];

        // Supprimer les images associées du storage
        if ($post->images()->exists()) {
            foreach ($post->images as $image) {
                // Extraire le chemin relatif de l'URL
                $path = str_replace(asset('storage/'), '', $image->image_url);
                Storage::disk('public')->delete($path);
            }
        }

        // Supprimer le post (cascade sur images, likes, comments, shares)
        $post->delete();

        // Log de l'activité
        ActivityLog::logActivity(
            'post_deleted',
            Post::class,
            $postInfo['id'],
            "Publication supprimée : {$postInfo['content']}... par {$postInfo['user_name']}",
            $postInfo
        );

        return redirect()->back()->with('success', 'Publication supprimée avec succès');
    }

    /**
     * Supprimer plusieurs publications en masse
     * POST /admin/posts/bulk-delete
     */
    public function bulkDeletePosts(Request $request)
    {
        // Validation
        $request->validate([
            'post_ids' => 'required|array|min:1',
            'post_ids.*' => 'required|exists:posts,id',
            'reason' => 'required|string|max:500',
        ]);

        // Vérifier les permissions
        if (!auth()->user()->hasPermission('delete-posts')) {
            return redirect()->back()->withErrors([
                'error' => 'Vous n\'avez pas la permission de supprimer des publications'
            ]);
        }

        // Récupérer les posts
        $posts = Post::whereIn('id', $request->post_ids)
            ->with(['user', 'images'])
            ->get();

        if ($posts->isEmpty()) {
            return redirect()->back()->withErrors([
                'error' => 'Aucune publication trouvée'
            ]);
        }

        $deletedCount = 0;
        $errors = [];

        DB::beginTransaction();
        
        try {
            foreach ($posts as $post) {
                // Supprimer les images du storage
                if ($post->images()->exists()) {
                    foreach ($post->images as $image) {
                        try {
                            $path = str_replace(asset('storage/'), '', $image->image_url);
                            Storage::disk('public')->delete($path);
                        } catch (\Exception $e) {
                            // Continuer même si la suppression d'image échoue
                            \Log::warning("Échec suppression image: {$path}", ['error' => $e->getMessage()]);
                        }
                    }
                }

                    // Log de l'activité
                    ActivityLog::logActivity(
                        'post_bulk_deleted',
                        Post::class,
                        $post->id,
                        "Suppression en masse : {$request->reason}",
                        [
                            'post_content' => substr($post->content ?? '', 0, 100),
                            'user_name' => $post->user->full_name ?? 'Unknown',
                            'reason' => $request->reason,
                        ]
                    );

                // Supprimer le post
                $post->delete();
                $deletedCount++;
            }

            DB::commit();

            return redirect()->back()->with('success', "{$deletedCount} publication(s) supprimée(s) avec succès");

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erreur suppression en masse', [
                'error' => $e->getMessage(),
                'post_ids' => $request->post_ids
            ]);

            return redirect()->back()->withErrors([
                'error' => 'Échec de la suppression en masse. Veuillez réessayer.'
            ]);
        }
    }

    /**
     * Voir les détails d'une publication
     * GET /admin/posts/{post}
     */
    public function showPost(Post $post)
    {
        $post->load([
            'user:id,full_name,username,profile_picture,email,account_type',
            'images',
            'comments.user:id,full_name,username,profile_picture',
            'shares.user:id,full_name,username,profile_picture',
        ])
        ->loadCount([
            'likedBy as likes_count',
            'comments as comments_count',
            'shares as shares_count',
        ]);

        // Utilisateurs qui ont liké
        $likedBy = $post->likedBy()
            ->select('users.id', 'users.full_name', 'users.username', 'users.profile_picture')
            ->take(50)
            ->get();
        
        return Inertia::render('admin/posts/show', [
            'post' => $post,
            'liked_by' => $likedBy,
        ]);
    }

    public function getComments(Post $post) {
        $comments = $post->comments()
            ->with('user:id,full_name,username,profile_picture')
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['comments' => $comments]);
    }

    /**
     * Récupérer les partages d'une publication
     * GET /admin/posts/{post}/shares
     */
    public function getShares(Post $post)
    {
        $shares = $post->shares()
            ->with('user:id,full_name,username,profile_picture')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($share) {
                return [
                    'id' => $share->id,
                    'share_type' => $share->share_type,
                    'content' => $share->content,
                    'created_at' => $share->created_at,
                    'user' => $share->user,
                ];
            });

        return response()->json([
            'shares' => $shares
        ]);
    }
}