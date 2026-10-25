<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use App\Models\Post;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Comment;
use App\Models\ContentReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class ModeratorController extends Controller implements HasMiddleware
{
    /**
     * ✅ Middleware de protection
     */
    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                if (!auth()->check()) {
                    abort(403, 'Vous devez être connecté.');
                }
                
                $user = auth()->user();
                
                if (!isset($user->roles->first()->slug)) {
                    abort(403, 'Type de compte non défini.');
                }
                
                if (!in_array($user->roles->first()->slug, ['moderator', 'admin', 'super-admin'])) {
                    abort(403, 'Accès non autorisé. Vous devez être administrateur.');
                }
                
                return $next($request);
            }),
        ];
    }

    /**
     * Tableau de bord modérateur
     */
    public function dashboard(Request $request)
    {
        // ========================================
        // STATISTIQUES GLOBALES
        // ========================================
        $stats = [
            // Signalements en attente
            'pending_reports' => ContentReport::where('status', 'pending')->count(),
            
            // Signalements aujourd'hui
            'reports_today' => ContentReport::whereDate('created_at', Carbon::today())->count(),
            
            // Résolus cette semaine
            'resolved_this_week' => ContentReport::where('status', 'resolved')
                ->where('reviewed_at', '>=', Carbon::now()->subDays(7))
                ->count(),
            
            // Posts signalés (en attente)
            'flagged_posts' => ContentReport::where('reportable_type', 'post')
                ->where('status', 'pending')
                ->count(),
            
            // Commentaires signalés (en attente)
            'flagged_comments' => ContentReport::where('reportable_type', 'comment')
                ->where('status', 'pending')
                ->count(),
            
            // Utilisateurs bloqués
            'blocked_users_today' => DB::table('user_blocks')
                ->whereDate('created_at', Carbon::today())
                ->count(),
            
            'total_blocked' => DB::table('user_blocks')->count(),
            
            // Mes activités de modération
            'my_reviews_today' => ContentReport::where('reviewed_by', auth()->id())
                ->whereDate('reviewed_at', Carbon::today())
                ->count(),
            
            'my_total_reviews' => ContentReport::where('reviewed_by', auth()->id())
                ->count(),
        ];

        // ========================================
        // SIGNALEMENTS EN ATTENTE (TOP 10)
        // ========================================
        $pendingReports = ContentReport::with([
                'reporter:id,full_name,username,profile_picture',
            ])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($report) {
                // Récupérer les infos du contenu signalé
                $reportable = $report->reportable();
                
                return [
                    'id' => $report->id,
                    'reason' => $report->reason,
                    'reason_label' => $report->reason_label,
                    'description' => $report->description,
                    'reportable_type' => $report->reportable_type,
                    'reportable_id' => $report->reportable_id,
                    'status' => $report->status,
                    'created_at' => $report->created_at,
                    'reporter' => $report->reporter,
                    'reportable' => $reportable ? [
                        'content' => $reportable->content ?? $reportable->text ?? null,
                        'user' => $reportable->user ?? null,
                    ] : null,
                ];
            });

        // ========================================
        // POSTS RÉCENTS (SURVEILLANCE)
        // ========================================
        $recentPosts = Post::with(['user:id,full_name,username,profile_picture', 'images'])
            ->withCount(['likedBy', 'comments', 'shares'])
            ->latest()
            ->take(10)
            ->get();

        // ========================================
        // COMMENTAIRES RÉCENTS (SURVEILLANCE)
        // ========================================
        $recentComments = Comment::with([
                'user:id,full_name,username,profile_picture',
                'post:id,content'
            ])
            ->latest()
            ->take(10)
            ->get();

        // ========================================
        // ACTIVITÉ DE MODÉRATION (7 DERNIERS JOURS)
        // ========================================
        $moderationActivity = ContentReport::select(
                DB::raw('DATE(reviewed_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved'),
                DB::raw('SUM(CASE WHEN status = "dismissed" THEN 1 ELSE 0 END) as dismissed')
            )
            ->whereNotNull('reviewed_at')
            ->where('reviewed_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('moderator/dashboard', [
            'stats' => $stats,
            'pendingReports' => $pendingReports,
            'recentPosts' => $recentPosts,
            'recentComments' => $recentComments,
            'moderationActivity' => $moderationActivity,
            'auth' => ['user' => auth()->user()]
        ]);
    }

    /**
     * Liste des signalements (avec filtres)
     */
    public function reports(Request $request)
    {
        $status = $request->get('status', 'pending');
        $reason = $request->get('reason', 'all');
        $type = $request->get('type', 'all'); // post, comment, all

        $query = ContentReport::with([
            'reporter:id,full_name,username,profile_picture',
            'moderator:id,full_name,username',
        ]);

        // Filtre par statut
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Filtre par raison
        if ($reason !== 'all') {
            $query->where('reason', $reason);
        }

        // Filtre par type de contenu
        if ($type !== 'all') {
            $query->where('reportable_type', $type);
        }

        $reports = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($report) {
                $reportable = $report->reportable();
                
                return [
                    'id' => $report->id,
                    'reason' => $report->reason,
                    'reason_label' => $report->reason_label,
                    'description' => $report->description,
                    'reportable_type' => $report->reportable_type,
                    'reportable_id' => $report->reportable_id,
                    'status' => $report->status,
                    'created_at' => $report->created_at,
                    'reviewed_at' => $report->reviewed_at,
                    'reporter' => $report->reporter,
                    'moderator' => $report->moderator,
                    'reportable' => $reportable ? [
                        'id' => $reportable->id,
                        'content' => $reportable->content ?? $reportable->text ?? null,
                        'user' => $reportable->user ?? null,
                        'created_at' => $reportable->created_at ?? null,
                    ] : null,
                ];
            });

        return Inertia::render('moderator/reports/index', [
            'reports' => $reports,
            'filters' => [
                'status' => $status,
                'reason' => $reason,
                'type' => $type,
            ],
            'auth' => ['user' => auth()->user()]
        ]);
    }

    /**
     * Détails d'un signalement
     */
    public function showReport($reportId)
    {
        
        $report = ContentReport::with([
            'reporter:id,full_name,username,email,profile_picture,account_type',
            'moderator:id,full_name,username',
        ])->findOrFail($reportId);

        // Récupérer le contenu signalé
        $reportable = $report->reportable();
        
        if (!$reportable) {
            return back()->withErrors(['error' => 'Contenu signalé introuvable (peut-être supprimé)']);
        }

        // Informations sur l'auteur du contenu
        $contentAuthor = $reportable->user;

        // Historique des signalements pour ce contenu
        $contentReportHistory = ContentReport::where('reportable_type', $report->reportable_type)
            ->where('reportable_id', $report->reportable_id)
            ->with('reporter:id,full_name,username')
            ->orderBy('created_at', 'desc')
            ->get();

        // Historique des signalements pour l'auteur du contenu
        if ($contentAuthor) {
            $authorReportHistory = ContentReport::whereIn('reportable_id', function ($query) use ($contentAuthor) {
                    $query->select('id')
                        ->from('posts')
                        ->where('user_id', $contentAuthor->id)
                        ->union(
                            DB::table('comments')
                                ->select('id')
                                ->where('user_id', $contentAuthor->id)
                        );
                })
                ->with('reporter:id,full_name,username')
                ->orderBy('created_at', 'desc')
                ->get();
                
        } else {
            $authorReportHistory = collect();
        }

        // Publications récentes de l'auteur
        $recentPosts = Post::where('user_id', $contentAuthor->id ?? null)
            ->with('images')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('moderator/reports/report-detail', [
            'report' => [
                'id' => $report->id,
                'reason' => $report->reason,
                'reason_label' => $report->reason_label,
                'description' => $report->description,
                'reportable_type' => $report->reportable_type,
                'reportable_id' => $report->reportable_id,
                'status' => $report->status,
                'created_at' => $report->created_at,
                'reviewed_at' => $report->reviewed_at,
                'moderator_note' => $report->moderator_note,
                'reporter' => $report->reporter,
                'moderator' => $report->moderator,
            ],
            'reportedContent' => [
                'id' => $reportable->id,
                'type' => $report->reportable_type,
                'content' => $reportable->content ?? $reportable->text ?? null,
                'created_at' => $reportable->created_at,
                'user' => $contentAuthor,
                'images' => $reportable->images ?? null,
            ],
            'contentReportHistory' => $contentReportHistory,
            'authorReportHistory' => $authorReportHistory,
            'recentPosts' => $recentPosts,
            'auth' => ['user' => auth()->user()]
        ]);
    }

    /**
     * Traiter un signalement
     */
    public function resolveReport(Request $request, $reportId)
    {
        $validated = $request->validate([
            'action' => 'required|in:dismiss,warn,delete_content,suspend_user,ban_user',
            'notes' => 'nullable|string|max:1000',
        ]);

        $report = ContentReport::findOrFail($reportId);
        
        // Récupérer le contenu signalé
        $reportable = $report->reportable();

        // Appliquer l'action
        switch ($validated['action']) {
            case 'dismiss':
                // Simplement rejeter le signalement
                $report->update([
                    'status' => 'dismissed',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'moderator_note' => $validated['notes'] ?? 'Signalement rejeté',
                ]);
                break;

            case 'warn':
                // Avertir l'utilisateur (à implémenter: système de notifications)
                $report->update([
                    'status' => 'resolved',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'moderator_note' => $validated['notes'] ?? 'Avertissement envoyé',
                ]);
                // TODO: Envoyer une notification d'avertissement
                break;

            case 'delete_content':
                // Supprimer le contenu signalé
                if ($reportable) {
                    $reportable->delete();
                }
                
                $report->update([
                    'status' => 'resolved',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'moderator_note' => $validated['notes'] ?? 'Contenu supprimé',
                ]);
                break;

            case 'suspend_user':
                // Suspendre temporairement l'utilisateur
                if ($reportable && isset($reportable->user)) {
                    $reportable->user->update(['is_active' => false]);
                }
                
                $report->update([
                    'status' => 'resolved',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'moderator_note' => $validated['notes'] ?? 'Utilisateur suspendu',
                ]);
                break;

            case 'ban_user':
                // Bannir définitivement l'utilisateur
                if ($reportable && isset($reportable->user)) {
                    $reportable->user->delete();
                }
                
                $report->update([
                    'status' => 'resolved',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'moderator_note' => $validated['notes'] ?? 'Utilisateur banni',
                ]);
                break;
        }

        return back()->with('success', 'Signalement traité avec succès');
    }

    /**
     * Filtres avancés pour les posts
     */
    public function posts(Request $request)
    {
        $filter = $request->get('filter', 'all');
        $search = $request->get('search', '');

        $query = Post::with([
            'user:id,full_name,username,profile_picture',
            'images:id,post_id,image_url',
            // Charger les signalements :
            'reports.reporter:id,full_name,username,profile_picture'
        ])->withCount(['likedBy as liked_by_count', 'comments', 'shares', 'reports']);
        // Filtre par posts signalés
        if ($filter === 'reported') {
            $reportedPostIds = ContentReport::where('reportable_type', 'post')
                ->where('status', 'pending')
                ->pluck('reportable_id');
            
            $query->whereIn('id', $reportedPostIds);
        }
        
        // Filtre par date - NOUVEAU
        elseif ($filter === 'today') {
            $query->whereDate('created_at', Carbon::today());
        }
        elseif ($filter === 'week') {
            $query->where('created_at', '>=', Carbon::now()->subDays(7));
        }

        // Recherche
        if ($search) {
            $query->where('content', 'LIKE', "%{$search}%");
        }

        $posts = $query->latest()
            ->paginate(30)
            ->through(function ($post) {
                // Ajouter le nombre de signalements
                $reportsCount = ContentReport::where('reportable_type', 'post')
                    ->where('reportable_id', $post->id)
                    ->where('status', 'pending')
                    ->count();

                return array_merge($post->toArray(), [
                    'reports_count' => $reportsCount,
                ]);
            });

        return Inertia::render('moderator/posts', [
            'posts' => $posts,
            'filters' => [
                'filter' => $filter,
                'search' => $search,
            ],
            'auth' => ['user' => auth()->user()]
        ]);
    }

    /**
     * Suppression en masse des posts
     */
    public function bulkDeletePosts(Request $request)
    {
        $validated = $request->validate([
            'post_ids' => 'required|array',
            'post_ids.*' => 'exists:posts,id',
        ]);

        $deletedCount = 0;

        foreach ($validated['post_ids'] as $postId) {
            $post = Post::find($postId);
            
            if ($post) {
                // Marquer tous les signalements comme résolus
                ContentReport::where('reportable_type', 'post')
                    ->where('reportable_id', $postId)
                    ->where('status', 'pending')
                    ->update([
                        'status' => 'resolved',
                        'reviewed_by' => auth()->id(),
                        'reviewed_at' => now(),
                        'moderator_note' => 'Suppression en masse par le modérateur',
                    ]);

                $post->delete();
                $deletedCount++;
            }
        }

        return back()->with('success', "$deletedCount publication(s) supprimée(s)");
    }

    /**
     * Approuver une publication (retirer tous les signalements)
     */
    public function approvePost(Post $post)
    {
        // Supprimer tous les signalements liés à ce post
        $post->reports()->delete();
        
        return redirect()->back()->with('success', 'Publication approuvée avec succès');
    }


    /**
     * Recherche avancée multi-critères
     */
    public function advancedSearch(Request $request)
    {
        $validated = $request->validate([
            'query' => 'nullable|string',
            'type' => 'nullable|in:post,comment,all',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Recherche dans les posts
        $posts = collect();
        if (in_array($validated['type'] ?? 'all', ['post', 'all'])) {
            $postQuery = Post::with('user:id,full_name,username,profile_picture');
            
            if (!empty($validated['query'])) {
                $postQuery->where('content', 'LIKE', "%{$validated['query']}%");
            }
            
            if (!empty($validated['date_from'])) {
                $postQuery->where('created_at', '>=', $validated['date_from']);
            }
            
            if (!empty($validated['date_to'])) {
                $postQuery->where('created_at', '<=', $validated['date_to']);
            }
            
            if (!empty($validated['user_id'])) {
                $postQuery->where('user_id', $validated['user_id']);
            }
            
            $posts = $postQuery->latest()->take(50)->get();
        }

        // Recherche dans les commentaires
        $comments = collect();
        if (in_array($validated['type'] ?? 'all', ['comment', 'all'])) {
            $commentQuery = Comment::with(['user:id,full_name,username,profile_picture', 'post:id,content']);
            
            if (!empty($validated['query'])) {
                $commentQuery->where('content', 'LIKE', "%{$validated['query']}%");
            }
            
            if (!empty($validated['date_from'])) {
                $commentQuery->where('created_at', '>=', $validated['date_from']);
            }
            
            if (!empty($validated['date_to'])) {
                $commentQuery->where('created_at', '<=', $validated['date_to']);
            }
            
            if (!empty($validated['user_id'])) {
                $commentQuery->where('user_id', $validated['user_id']);
            }
            
            $comments = $commentQuery->latest()->take(50)->get();
        }

        return response()->json([
            'posts' => $posts,
            'comments' => $comments,
            'total' => $posts->count() + $comments->count(),
        ]);
    }


    /**
     * Supprimer une publication
     */
    public function deletePost(Post $post)
    {
        // Marquer tous les signalements comme résolus
        ContentReport::where('reportable_type', 'post')
            ->where('reportable_id', $post->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'resolved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'moderator_note' => 'Contenu supprimé par le modérateur',
            ]);

        $post->delete();
        
        return back()->with('success', 'Publication supprimée');
    }

    /**
     * Filtres avancés pour les commentaires
     */
    public function comments(Request $request)
    {
        $filter = $request->get('filter', 'recent');

        $query = Comment::with([
            'user:id,full_name,username,profile_picture',
            'post:id,content',
            // Charger les signalements :
            'reports.reporter:id,full_name,username,profile_picture'
        ]);

        // Filtre par commentaires signalés
        if ($filter === 'reported') {
            $reportedCommentIds = ContentReport::where('reportable_type', 'comment')
                ->where('status', 'pending')
                ->pluck('reportable_id');
            
            $query->whereIn('id', $reportedCommentIds);
        }
        // Filtre par date - NOUVEAU
        elseif ($filter === 'today') {
            $query->whereDate('created_at', Carbon::today());
        }
        elseif ($filter === 'week') {
            $query->where('created_at', '>=', Carbon::now()->subDays(7));
        }

        $comments = $query->latest()
            ->paginate(30)
            ->through(function ($comment) {
                // Ajouter le nombre de signalements
                $reportsCount = ContentReport::where('reportable_type', 'comment')
                    ->where('reportable_id', $comment->id)
                    ->where('status', 'pending')
                    ->count();

                return array_merge($comment->toArray(), [
                    'reports_count' => $reportsCount,
                ]);
            });

        return Inertia::render('moderator/comments', [
            'comments' => $comments,
            'filter' => $filter,
            'auth' => ['user' => auth()->user()]
        ]);
    }
    /**
     * Suppression en masse des commentaires
     */
    public function bulkDeleteComments(Request $request)
    {
        $validated = $request->validate([
            'comment_ids' => 'required|array',
            'comment_ids.*' => 'exists:comments,id',
        ]);

        $deletedCount = 0;

        foreach ($validated['comment_ids'] as $commentId) {
            $comment = Comment::find($commentId);
            
            if ($comment) {
                // Marquer tous les signalements comme résolus
                ContentReport::where('reportable_type', 'comment')
                    ->where('reportable_id', $commentId)
                    ->where('status', 'pending')
                    ->update([
                        'status' => 'resolved',
                        'reviewed_by' => auth()->id(),
                        'reviewed_at' => now(),
                        'moderator_note' => 'Suppression en masse par le modérateur',
                    ]);

                $comment->delete();
                $deletedCount++;
            }
        }

        return back()->with('success', "$deletedCount commentaire(s) supprimé(s)");
    }

    /**
     * Supprimer un commentaire
     */
    public function deleteComment(Comment $comment)
    {
        // Marquer tous les signalements comme résolus
        ContentReport::where('reportable_type', 'comment')
            ->where('reportable_id', $comment->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'resolved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'moderator_note' => 'Contenu supprimé par le modérateur',
            ]);

        $comment->delete();
        
        return back()->with('success', 'Commentaire supprimé');
    }

    /**
     * Approuver un commentaire (retirer tous les signalements)
     */
    public function approveComment(Comment $comment)
    {
        // Supprimer tous les signalements liés à ce commentaire
        $comment->reports()->delete();
        
        return redirect()->back()->with('success', 'Commentaire approuvé avec succès');
    }

    /**
     *  Statistiques avec plus de détails
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', '30'); // 7, 30, 90 jours

        $startDate = Carbon::now()->subDays((int)$period);

        $stats = [
            // Signalements par raison
            'by_reason' => ContentReport::select('reason', DB::raw('COUNT(*) as count'))
                ->where('created_at', '>=', $startDate)
                ->groupBy('reason')
                ->orderBy('count', 'desc')
                ->get(),

            // Signalements par type de contenu
            'by_type' => ContentReport::select('reportable_type', DB::raw('COUNT(*) as count'))
                ->where('created_at', '>=', $startDate)
                ->groupBy('reportable_type')
                ->get(),

            // Signalements par statut
            'by_status' => ContentReport::select('status', DB::raw('COUNT(*) as count'))
                ->where('created_at', '>=', $startDate)
                ->groupBy('status')
                ->get(),

            // Évolution quotidienne
            'daily_trend' => ContentReport::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('created_at', '>=', $startDate)
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            // Performance des modérateurs - AMÉLIORÉ
            'moderator_performance' => ContentReport::select(
                    'reviewed_by',
                    DB::raw('COUNT(*) as total_reviews'),
                    DB::raw('SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved'),
                    DB::raw('SUM(CASE WHEN status = "dismissed" THEN 1 ELSE 0 END) as dismissed'),
                    DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, reviewed_at)) as avg_response_time')
                )
                ->whereNotNull('reviewed_by')
                ->where('reviewed_at', '>=', $startDate)
                ->groupBy('reviewed_by')
                ->with('moderator:id,full_name,username')
                ->orderBy('total_reviews', 'desc')
                ->get(),
        ];

        return Inertia::render('moderator/statistics', [
            'stats' => $stats,
            'period' => $period,
            'auth' => ['user' => auth()->user()]
        ]);
    }

    /**
     * Export des statistiques en CSV
     */
    public function exportStatistics(Request $request)
    {
        $period = $request->get('period', '30');
        $startDate = Carbon::now()->subDays((int)$period);

        $reports = ContentReport::with(['reporter:id,full_name,username', 'moderator:id,full_name,username'])
            ->where('created_at', '>=', $startDate)
            ->get();

        $csvData = [];
        $csvData[] = ['Date', 'Type', 'Raison', 'Statut', 'Signalé par', 'Modéré par', 'Temps de réponse (heures)'];

        foreach ($reports as $report) {
            $responseTime = $report->reviewed_at 
                ? $report->created_at->diffInHours($report->reviewed_at) 
                : null;

            $csvData[] = [
                $report->created_at->format('Y-m-d H:i'),
                $report->reportable_type,
                $report->reason,
                $report->status,
                $report->reporter->full_name ?? 'N/A',
                $report->moderator->full_name ?? 'Non traité',
                $responseTime ?? 'N/A',
            ];
        }

        $filename = "moderation_stats_{$period}j_" . now()->format('Y-m-d') . ".csv";

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ]);
    }

}