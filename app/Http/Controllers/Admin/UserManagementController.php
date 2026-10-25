<?php

namespace App\Http\Controllers\Admin;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class UserManagementController extends AdminController implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                // Vérifier que l'utilisateur est authentifié
                if (!auth()->check()) {
                    abort(403, 'Vous devez être connecté.');
                }
                
                // Charger la relation depuis user_roles explicitement
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

    /**
     * Liste des utilisateurs
     * GET /admin/users
     */
    public function index(Request $request)
    {
        $query = User::with(['roles:id,name,slug,level'])
            ->withCount(['posts', 'followers', 'following']);

        // Filtres
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            // whereHas interroge la table pivot user_roles via la relation Eloquent.
            // Remplace le scope withRole() qui n'était pas défini sur le modèle User.
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('slug', $request->role);
            });
        }

        if ($request->has('account_type')) {
            $query->where('account_type', $request->account_type);
        }

        if ($request->has('status')) {
            switch ($request->status) {
                case 'active':
                    $query->where('is_active', true)->where('is_banned', false);
                    break;
                case 'banned':
                    $query->where('is_banned', true);
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
            }
        }

        // Statistiques
        $stats = [
            'total' => User::count(),
            'practitioners' => User::where('account_type', 'practitioner')->count(),
            'experts' => User::where('is_expert', true)->count(),
            'verified' => User::where('is_verified', true)->count(),
            'pending' => User::where('account_type', 'practitioner')
                            ->where('is_verified', false)->count(),
        ];

        $users = $query->latest()->paginate(50);
        
        $users->getCollection()->transform(function ($user) {
            
            return [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'email' => $user->email,
                'profile_picture' => $user->profile_picture,
                'account_type' => $user->account_type,
                'is_verified' => $user->is_verified,
                'is_active' => $user->is_active,
                'is_banned' => $user->is_banned,
                'banned_at' => $user->banned_at,
                'ban_reason' => $user->ban_reason,
                'created_at' => $user->created_at,
                'last_active_at' => $user->last_active_at,
                'posts_count' => $user->posts_count,
                'followers_count' => $user->followers_count,
                'following_count' => $user->following_count,
                'roles' => $user->roles->map(fn($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'slug' => $r->slug,
                    'level' => $r->level,
                ]),
                'primary_role' => $user->primary_role ? [
                    'name' => $user->primary_role->name,
                    'slug' => $user->primary_role->slug,
                ] : null,
            ];
        });
    
        $roles = Role::select('id', 'name', 'slug', 'level')
            ->orderBy('level', 'desc')
            ->get();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'account_type' => $request->account_type,
                'status' => $request->status,
            ],
            'auth'=> $this->buildAuthPayload(),
        ]); 
    }

    /**
     * Voir un utilisateur
     * GET /admin/users/{user}
     */
    public function show(User $user)
    {
        // $this->authorize('view', $user);

        $user->load([
            'roles:id,name,slug,level',
            'permissions:id,name,slug',
        ]);

        // Statistiques utilisateur
        $userStats = [
            'posts_count' => $user->posts()->count(),
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'connections_count' => $user->connections()->count(),
            'rating' => $user->rating,
            'total_ratings' => $user->total_ratings,
        ];

        // Activité récente
        $recentActivity = ActivityLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return Inertia::render('admin/users/show', [
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'email' => $user->email,
                'profile_picture' => $user->profile_picture,
                'cover_photo' => $user->cover_photo,
                'bio' => $user->bio,
                'location' => $user->location,
                'account_type' => $user->account_type,
                'is_verified' => $user->is_verified,
                'is_expert' => $user->is_expert,
                'is_active' => $user->is_active,
                'is_banned' => $user->is_banned,
                'banned_at' => $user->banned_at,
                'banned_by' => $user->banned_by,
                'ban_reason' => $user->ban_reason,
                'created_at' => $user->created_at,
                'email_verified_at' => $user->email_verified_at,
                'last_active_at' => $user->last_active_at,
                'roles' => $user->roles,
                'permissions' => $user->permissions,
                // 'all_permissions' => $user->getAllPermissions(),
            ],
            'recent_activity' => $recentActivity,
            'stats' => $userStats,
        ]);
    }

    /**
     * Attribuer un rôle à un utilisateur
     * POST /admin/users/{user}/assign-role
     */
    public function assignRole(Request $request, User $user)
    {
        // Vérification stricte : seul super-admin peut attribuer des rôles
        $authUser = auth()->user()->load('roles');
        if ($authUser->roles->first()?->slug !== 'super-admin') {
            abort(403, 'Seuls les super administrateurs peuvent attribuer des rôles.');
        }

        $validated = $request->validate([
            'role_slug' => 'required|exists:roles,slug',
        ]);

        $role = Role::where('slug', $validated['role_slug'])->firstOrFail();

        // Vérifier le niveau hiérarchique
        $authUserPrimaryRole = auth()->user()->primaryRole();
        $authUserLevel = $authUserPrimaryRole ? $authUserPrimaryRole->level : 0;
        $targetRoleLevel = $role->level;

        if ($targetRoleLevel >= $authUserLevel && !auth()->user()->is_super_admin) {
            return redirect()->back()->withErrors([
                'error' => 'Vous ne pouvez pas attribuer un rôle de niveau égal ou supérieur au vôtre'
            ]);
        }

        $user->assignRole($role, auth()->user());

        $user->syncPrimaryRole();

        ActivityLog::logActivity(
            'role_assigned',
            User::class,
            $user->id,
            "Rôle '{$role->name}' attribué à {$user->full_name}",
            ['role' => $role->slug]
        );

        return redirect()->back()->with('success', "Rôle '{$role->name}' attribué avec succès");
    }

    /**
     * Retirer un rôle
     * DELETE /admin/users/{user}/remove-role/{role}
     */
    public function removeRole(User $user, Role $role)
    {
        // $this->authorize('assignRole', $user);

        // Empêcher de retirer le dernier rôle
        if ($user->roles()->count() === 1) {
            return redirect()->back()->withErrors([
                'error' => 'Un utilisateur doit avoir au moins un rôle'
            ]);
        }

        $user->removeRole($role);
        
        // sync le rôle primaire après suppression
        $user->syncPrimaryRole();

        ActivityLog::logActivity(
            'role_removed',
            User::class,
            $user->id,
            "Rôle '{$role->name}' retiré de {$user->full_name}",
            ['role' => $role->slug]
        );

        return redirect()->back()->with('success', 'Rôle retiré avec succès');
    }

    /**
     * Bannir un utilisateur
     * POST /admin/users/{user}/ban
     */
    public function ban(Request $request, User $user)
    {
        // $this->authorize('ban', $user);

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user->update([
            'is_banned' => true,
            'banned_at' => now(),
            'banned_by' => auth()->id(),
            'ban_reason' => $validated['reason'],
        ]);

        ActivityLog::logActivity(
            'user_banned',
            User::class,
            $user->id,
            "Utilisateur banni : {$user->full_name}",
            ['reason' => $validated['reason']]
        );

        return redirect()->back()->with('success', 'Utilisateur banni avec succès');
    }

    /**
     * Débannir un utilisateur
     * POST /admin/users/{user}/unban
     */
    public function unban(User $user)
    {
        // $this->authorize('ban', $user);

        $user->update([
            'is_banned' => false,
            'banned_at' => null,
            'banned_by' => null,
            'ban_reason' => null,
        ]);

        ActivityLog::logActivity(
            'user_unbanned',
            User::class,
            $user->id,
            "Utilisateur débanni : {$user->full_name}"
        );

        return redirect()->back()->with('success', 'Utilisateur débanni avec succès');
    }

    /**
     * Activer/Désactiver un compte
     * PATCH /admin/users/{user}/toggle-active
     */
    public function toggleUserStatus(User $user)
    {

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $status = $user->is_active ? 'activé' : 'désactivé';

        ActivityLog::logActivity(
            'user_status_changed',
            User::class,
            $user->id,
            "Compte {$status} : {$user->full_name}",
            ['is_active' => $user->is_active]
        );

        return redirect()->back()->with('success', "Compte {$status} avec succès");
    }

    /**
     * Vérifier un tradipraticien
     * POST /admin/users/{user}/verify-practitioner
     */
    public function verifyPractitioner(Request $request, User $user)
    {
        // $this->authorize('verifyPractitioner', $user);
        if ($user->account_type !== 'practitioner') {
            return redirect()->back()->withErrors([
                'error' => 'Seuls les tradipraticiens peuvent être vérifiés'
            ]);
        }
        
        $validated = $request->validate([
            'verification_status' => 'required|in:verified,rejected',
            'rejection_reason' => 'required_if:verification_status,rejected|nullable|string|max:500',
        ]);

        $user->update([
            'verification_status' => $validated['verification_status'],
            'is_verified' => $validated['verification_status'] === 'verified',
            'verified_at' => $validated['verification_status'] === 'verified' ? now() : null,
            'verified_by' => $validated['verification_status'] === 'verified' ? auth()->id() : null,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'certification_number' => $request->certification_number,
            'years_of_experience' => $request->years_of_experience,
        ]);

        // Attribuer le rôle practitioner si vérifié
        if ($validated['verification_status'] === 'verified') {
            $practitionerRole = Role::where('slug', 'practitioner')->first();
            if ($practitionerRole && !$user->hasRole('practitioner')) {
                $user->assignRole($practitionerRole, auth()->user());
            }
        }
        
        $status = $validated['verification_status'] === 'verified' ? 'vérifié' : 'rejeté';

        ActivityLog::logActivity(
            'practitioner_verification',
            User::class,
            $user->id,
            "Tradipraticien {$status} : {$user->full_name}",
            $validated
        );

        return redirect()->back()->with('success', "Tradipraticien {$status} avec succès");
    }

    /**
     * Promouvoir un tradipraticien au statut d'expert
     */
    public function promoteToExpert(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (!$user->is_verified) {
            return back()->withErrors([
                'error' => 'L\'utilisateur doit être vérifié avant d\'être promu expert'
            ]);
        }

        $user->update([
            'is_expert' => true,
        ]);

        // Log l'activité
        DB::table('activity_logs')->insert([
            'user_id' => $user->id,
            'action' => 'promoted_to_expert',
            'description' => 'Promu expert par ' . auth()->user()->full_name . '. Raison: ' . $request->reason,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Utilisateur promu au statut d\'expert');
    }

    /**
     * Supprimer un utilisateur
     */
    public function deleteUser(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'confirm' => 'required|accepted',
        ]);

        // Empêcher la suppression de super-admins
        if ($user->hasRole('super-admin')) {
            return back()->withErrors([
                'error' => 'Impossible de supprimer un super-administrateur'
            ]);
        }

        // Log avant suppression
        DB::table('activity_logs')->insert([
            'user_id' => $user->id,
            'action' => 'deleted',
            'description' => 'Compte supprimé par ' . auth()->user()->full_name . '. Raison: ' . $request->reason,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        // Supprimer les fichiers associés
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }
        if ($user->cover_photo) {
            Storage::disk('public')->delete($user->cover_photo);
        }

        $user->delete();

        return redirect()->route('admin.users')
            ->with('success', 'Utilisateur supprimé avec succès');
    }

    /**
     * Exporter les utilisateurs en CSV
     */
    public function exportUsers(Request $request)
    {
        $users = User::query()
            ->when($request->account_type, fn($q, $type) => $q->where('account_type', $type))
            ->get();

        $csv = "ID,Nom,Email,Type,Vérifié,Expert,Actif,Date création\n";
        
        foreach ($users as $user) {
            $csv .= implode(',', [
                $user->id,
                $user->full_name,
                $user->email,
                $user->account_type,
                $user->is_verified ? 'Oui' : 'Non',
                $user->is_expert ? 'Oui' : 'Non',
                $user->is_active ? 'Oui' : 'Non',
                $user->created_at->format('d/m/Y'),
            ]) . "\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="users_' . now()->format('Y-m-d') . '.csv"');
    }
}