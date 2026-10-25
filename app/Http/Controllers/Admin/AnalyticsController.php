<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Connection;
use App\Models\Message;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AnalyticsController extends AdminController
{
    /**
     * Affiche le tableau de bord analytics avec toutes les métriques
     * 
     * @return \Inertia\Response
     */
    public function analytics()
    {
        // ========================================
        // 1. STATISTIQUES PRINCIPALES
        // ========================================
        
        $stats = [
            // Utilisateurs
            'total_users' => User::count(),
            'total_practitioners' => User::where('account_type', 'practitioner')->count(),
            'verified_practitioners' => User::where('account_type', 'practitioner')
                ->where('is_verified', true)
                ->count(),
            'experts_count' => User::where('is_expert', true)->count(),
            
            // Contenus
            'total_posts' => Post::count(),
            'total_messages' => Message::count(),
            'total_connections' => Connection::where('status', 'accepted')->count(),
            
            // En attente
            'pending_verifications' => User::where('account_type', 'practitioner')
                ->where('is_verified', false)
                ->whereNotNull('certification_document')
                ->count(),
            
            // Activité récente
            'active_users_today' => User::whereDate('last_active_at', today())->count(),
            'new_users_this_month' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        // ========================================
        // 2. CROISSANCE DES UTILISATEURS (30 derniers jours)
        // ========================================
        
        $userGrowth = collect(range(29, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo);
            
            return [
                'date' => $date->format('d M'),
                'users' => User::whereDate('created_at', $date)->count(),
                'practitioners' => User::where('account_type', 'practitioner')
                    ->whereDate('created_at', $date)
                    ->count(),
            ];
        })->values();

        // ========================================
        // 3. ACTIVITÉ DES POSTS (30 derniers jours)
        // ========================================
        
        $postActivity = collect(range(29, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo);
            
            return [
                'date' => $date->format('d M'),
                'posts' => Post::whereDate('created_at', $date)->count(),
                'comments' => Comment::whereDate('created_at', $date)->count(),
                'likes' => DB::table('post_likes')
                    ->whereDate('created_at', $date)
                    ->count(),
            ];
        })->values();

        // ========================================
        // 4. SPÉCIALISATIONS POPULAIRES
        // ========================================
        
        $specializations = DB::table('user_specializations')
            ->join('specializations', 'user_specializations.specialization_id', '=', 'specializations.id')
            ->select('specializations.name', DB::raw('count(*) as count'))
            ->groupBy('specializations.name')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->toArray();

        // ========================================
        // 5. RÉPARTITION DES TYPES D'UTILISATEURS
        // ========================================
        
        $totalUsers = User::count();
        $userTypes = [
            [
                'type' => 'Utilisateurs',
                'count' => User::where('account_type', 'user')->count(),
                'percentage' => round((User::where('account_type', 'user')->count() / max($totalUsers, 1)) * 100, 1),
            ],
            [
                'type' => 'Tradipraticiens',
                'count' => User::where('account_type', 'practitioner')->count(),
                'percentage' => round((User::where('account_type', 'practitioner')->count() / max($totalUsers, 1)) * 100, 1),
            ],
            [
                'type' => 'Experts',
                'count' => User::where('is_expert', true)->count(),
                'percentage' => round((User::where('is_expert', true)->count() / max($totalUsers, 1)) * 100, 1),
            ],
        ];

        // ========================================
        // 6. TOP RÉGIONS
        // ========================================
        
        $topRegions = User::whereNotNull('location')
            ->select('location', DB::raw('count(*) as count'))
            ->groupBy('location')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(function ($region) {
                return [
                    'location' => $region->location,
                    'count' => $region->count,
                ];
            })
            ->toArray();

        // ========================================
        // 7. MÉTRIQUES D'ENGAGEMENT
        // ========================================
        
        $engagementMetrics = [
            'avg_posts_per_user' => $totalUsers > 0 
                ? Post::count() / $totalUsers 
                : 0,
            'avg_connections_per_user' => $totalUsers > 0 
                ? Connection::where('status', 'accepted')->count() / $totalUsers 
                : 0,
            'avg_messages_per_day' => Message::whereDate('created_at', '>=', now()->subDays(30))
                ->count() / 30,
            'engagement_rate' => $totalUsers > 0 
                ? (User::whereDate('last_active_at', '>=', now()->subDays(30))->count() / $totalUsers) * 100 
                : 0,
        ];

        // ========================================
        // 8. STATISTIQUES DE VÉRIFICATION
        // ========================================
        
        $totalVerificationRequests = User::where('account_type', 'practitioner')
            ->whereNotNull('certification_document')
            ->count();
        
        $verificationStats = [
            'pending' => User::where('account_type', 'practitioner')
                ->where('is_verified', false)
                ->whereNotNull('certification_document')
                ->count(),
            'approved' => User::where('account_type', 'practitioner')
                ->where('is_verified', true)
                ->count(),
            'rejected' => 0, // À implémenter avec un système de rejet
            'approval_rate' => $totalVerificationRequests > 0 
                ? (User::where('account_type', 'practitioner')->where('is_verified', true)->count() / $totalVerificationRequests) * 100 
                : 0,
        ];

        // ========================================
        // 9. ACTIVITÉS RÉCENTES
        // ========================================
        
        $recentActivities = [];
        
        // Nouveaux utilisateurs
        $newUsers = User::latest()->limit(5)->get();
        foreach ($newUsers as $user) {
            $recentActivities[] = [
                'type' => 'user',
                'user' => $user->full_name,
                'action' => 's\'est inscrit',
                'timestamp' => $user->created_at->diffForHumans(),
            ];
        }
        
        // Nouvelles publications
        $newPosts = Post::with('user')->latest()->limit(5)->get();
        foreach ($newPosts as $post) {
            $recentActivities[] = [
                'type' => 'post',
                'user' => $post->user->full_name,
                'action' => 'a créé une publication',
                'timestamp' => $post->created_at->diffForHumans(),
            ];
        }
        
        // Vérifications récentes
        $recentVerifications = User::where('account_type', 'practitioner')
            ->where('is_verified', true)
            ->whereNotNull('verified_at')
            ->latest('verified_at')
            ->limit(5)
            ->get();
        foreach ($recentVerifications as $user) {
            $recentActivities[] = [
                'type' => 'verification',
                'user' => $user->full_name,
                'action' => 'a été vérifié comme tradipraticien',
                'timestamp' => Carbon::parse($user->verified_at)->diffForHumans(),
            ];
        }
        
        // Trier par date (plus récent en premier)
        usort($recentActivities, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        $recentActivities = array_slice($recentActivities, 0, 15);

        // ========================================
        // 10. RETOURNER LES DONNÉES À LA VUE
        // ========================================
        
        return Inertia::render('admin/analytics/index', [
            'analytics' => [
                'stats' => $stats,
                'user_growth' => $userGrowth,
                'post_activity' => $postActivity,
                'specializations' => $specializations,
                'user_types' => $userTypes,
                'top_regions' => $topRegions,
                'engagement_metrics' => $engagementMetrics,
                'verification_stats' => $verificationStats,
                'recent_activities' => $recentActivities,
            ],
            'auth'=> $this->buildAuthPayload(),
        ]);
    }

    /**
     * Tableau de bord principal (si différent d'analytics)
     */
//     public function dashboard()
//     {
//         // Vue simplifiée ou redirection vers analytics
//         return redirect()->route('admin.analytics');
//     }
}
