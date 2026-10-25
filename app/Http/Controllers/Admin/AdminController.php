<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use App\Models\Post;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Comment;
use App\Models\Message;
use App\Models\Connection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class AdminController extends Controller implements HasMiddleware
{
    /**
     * Middleware de protection : accès réservé aux utilisateurs ayant
     * le rôle 'admin' ou 'super-admin' dans la table pivot `user_roles`.
     *
     * La relation `roles` est chargée explicitement via ->load('roles')
     * pour garantir que c'est toujours `user_roles` qui est interrogée,
     * sans dépendre d'un accesseur ou d'un champ dénormalisé.
     */
    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                if (!auth()->check()) {
                    abort(403, 'Vous devez être connecté.');
                }

                // Lecture depuis user_roles via la relation Eloquent
                $user = auth()->user()->load('roles');

                $primaryRoleSlug = $user->roles->first()?->slug;

                if (!$primaryRoleSlug) {
                    abort(403, 'Rôle non défini.');
                }

                if (!in_array($primaryRoleSlug, ['admin', 'super-admin'])) {
                    abort(403, 'Accès non autorisé. Vous devez être administrateur.');
                }

                return $next($request);
            }),
        ];
    }

    // =========================================================================
    // HELPER PARTAGÉ — à utiliser dans TOUS les contrôleurs admin
    // =========================================================================

    /**
     * Construit le tableau `auth` à injecter dans chaque réponse Inertia.
     *
     * • Charge la relation `roles` via ->load('roles') → lit `user_roles`
     * • Sérialise roles[] sous la forme { id, name, slug } attendue par
     *   la fonction userHasRole() dans admin-layout.tsx
     *
     * Tous les contrôleurs admin (RoleController, UserManagementController,
     * AnalyticsController, etc.) doivent appeler $this->buildAuthPayload()
     * au lieu de passer auth()->user() brut.
     */
    protected function buildAuthPayload(): array
    {
        /** @var \App\Models\User $user */
        $user = auth()->user()->load('roles');

        return [
            'user' => [
                'id'              => $user->id,
                'full_name'       => $user->full_name,
                'username'        => $user->username,
                'email'           => $user->email,
                'profile_picture' => $user->profile_picture,
                'account_type'    => $user->account_type,
                /*
                 * Sérialisé depuis la relation many-to-many dont la table
                 * pivot est `user_roles`. Seuls id, name et slug sont exposés.
                 */
                'roles' => $user->roles->map(fn ($r) => [
                    'id'   => $r->id,
                    'name' => $r->name,
                    'slug' => $r->slug,
                ])->values()->all(),
            ],
        ];
    }

    // =========================================================================
    // TABLEAU DE BORD
    // =========================================================================

    public function dashboard(Request $request)
    {
        $stats = [
            'total_users'            => User::count(),
            'new_users_today'        => User::whereDate('created_at', Carbon::today())->count(),
            'new_users_week'         => User::where('created_at', '>=', Carbon::now()->subDays(7))->count(),
            'active_users_today'     => User::whereDate('last_active_at', Carbon::today())->count(),
            'total_practitioners'    => User::where('account_type', 'practitioner')->count(),
            'verified_practitioners' => User::where('account_type', 'practitioner')->where('is_verified', true)->count(),
            'pending_verifications'  => User::where('account_type', 'practitioner')
                                           ->where('is_verified', false)
                                           ->whereNotNull('certification_document')->count(),
            'total_experts'          => User::where('is_expert', true)->count(),
            'total_posts'            => Post::count(),
            'posts_today'            => Post::whereDate('created_at', Carbon::today())->count(),
            'total_comments'         => Comment::count(),
            'total_messages'         => Message::count(),
            'total_connections'      => Connection::where('status', 'accepted')->count(),
            'pending_connections'    => Connection::where('status', 'pending')->count(),
        ];

        $userGrowth = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', Carbon::now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        $recentUsers = User::with(['specializations'])
            ->latest()->take(10)->get()
            ->map(fn ($u) => [
                'id'              => $u->id,
                'full_name'       => $u->full_name,
                'username'        => $u->username,
                'email'           => $u->email,
                'account_type'    => $u->account_type,
                'is_verified'     => $u->is_verified,
                'is_expert'       => $u->is_expert,
                'profile_picture' => $u->profile_picture,
                'created_at'      => $u->created_at,
                'specializations' => $u->specializations->pluck('name'),
            ]);

        $pendingVerifications = User::where('account_type', 'practitioner')
            ->where('is_verified', false)
            ->whereNotNull('certification_document')
            ->with('specializations')->latest()->take(5)->get()
            ->map(fn ($u) => [
                'id'                     => $u->id,
                'full_name'              => $u->full_name,
                'username'               => $u->username,
                'email'                  => $u->email,
                'years_of_experience'    => $u->years_of_experience,
                'certification_number'   => $u->certification_number,
                'certification_document' => $u->certification_document,
                'specializations'        => $u->specializations->pluck('name'),
                'created_at'             => $u->created_at,
            ]);

        $recentPosts = Post::with(['user:id,full_name,username,profile_picture', 'images'])
            ->withCount(['likedBy', 'comments', 'shares'])
            ->latest()->take(10)->get();

        $reportsCount = DB::table('user_reports')->where('status', 'pending')->count();

        return Inertia::render('admin/dashboard', [
            'stats'                => $stats,
            'userGrowth'           => $userGrowth,
            'recentUsers'          => $recentUsers,
            'pendingVerifications' => $pendingVerifications,
            'recentPosts'          => $recentPosts,
            'reportsCount'         => $reportsCount,
            'auth'                 => $this->buildAuthPayload(),
        ]);
    }
}