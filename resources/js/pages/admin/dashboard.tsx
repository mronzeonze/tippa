import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    Clock,
    FileText,
    MessageSquare,
    ShieldCheck,
    TrendingUp,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import moment from 'moment';

// ========================================
// INTERFACES
// ========================================

interface AdminDashboardProps {
    stats: {
        total_users: number;
        new_users_today: number;
        new_users_week: number;
        active_users_today: number;
        total_practitioners: number;
        verified_practitioners: number;
        pending_verifications: number;
        total_experts: number;
        total_posts: number;
        posts_today: number;
        total_comments: number;
        total_messages: number;
        total_connections: number;
        pending_connections: number;
    };
    userGrowth: Array<{
        date: string;
        count: number;
    }>;
    recentUsers: Array<{
        id: string;
        full_name: string;
        username: string;
        email: string;
        account_type: string;
        is_verified: boolean;
        is_expert: boolean;
        profile_picture: string | null;
        created_at: string;
        specializations: string[];
    }>;
    pendingVerifications: Array<{
        id: string;
        full_name: string;
        username: string;
        email: string;
        years_of_experience: number;
        certification_number: string;
        certification_document: string;
        specializations: string[];
        created_at: string;
    }>;
    recentPosts: any[];
    reportsCount: number;
    auth: {
        user: any;
    };
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function AdminDashboard({
    stats,
    userGrowth,
    recentUsers,
    pendingVerifications,
    recentPosts,
    reportsCount,
    auth,
}: AdminDashboardProps) {
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    return (
        <AdminLayout>
            <Head title="Tableau de bord Admin" />

            <div className="p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* ========================================
                        HEADER
                    ======================================== */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Tableau de bord Administrateur
                            </h1>
                            <p className="text-slate-600">
                                Bienvenue, {auth.user.full_name}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-white shadow-lg">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-semibold">
                                {auth.user.account_type === 'super-admin'
                                    ? 'Super Admin'
                                    : 'Administrateur'}
                            </span>
                        </div>
                    </div>

                    {/* ========================================
                        STATISTIQUES PRINCIPALES
                    ======================================== */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Total Utilisateurs */}
                        <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">
                                        Total Utilisateurs
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {stats.total_users.toLocaleString()}
                                    </p>
                                    <p className="mt-1 text-xs text-green-600">
                                        +{stats.new_users_today} aujourd'hui
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Tradipraticiens */}
                        <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">
                                        Tradipraticiens
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {stats.total_practitioners.toLocaleString()}
                                    </p>
                                    <p className="mt-1 text-xs text-green-600">
                                        {stats.verified_practitioners} vérifiés
                                    </p>
                                </div>
                                <div className="rounded-full bg-emerald-100 p-3">
                                    <UserCheck className="h-8 w-8 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        {/* En attente de vérification */}
                        <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">
                                        Vérifications
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-orange-600">
                                        {stats.pending_verifications}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                        En attente
                                    </p>
                                </div>
                                <div className="rounded-full bg-orange-100 p-3">
                                    <Clock className="h-8 w-8 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        {/* Publications */}
                        <div className="rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">
                                        Publications
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {stats.total_posts.toLocaleString()}
                                    </p>
                                    <p className="mt-1 text-xs text-green-600">
                                        +{stats.posts_today} aujourd'hui
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <FileText className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        GRAPHIQUE CROISSANCE
                    ======================================== */}
                    <div className="rounded-xl bg-white p-6 shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Croissance des utilisateurs (30 derniers jours)
                            </h2>
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="h-64">
                            {/* Placeholder pour graphique */}
                            <div className="flex h-full items-center justify-center text-slate-400">
                                Graphique de croissance ici (Chart.js ou
                                Recharts)
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        DEUX COLONNES
                    ======================================== */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* DEMANDES DE VÉRIFICATION */}
                        <div className="rounded-xl bg-white p-6 shadow-md">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Demandes de vérification
                                </h2>
                                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                                    {pendingVerifications.length} en attente
                                </span>
                            </div>

                            <div className="space-y-3">
                                {pendingVerifications.length > 0 ? (
                                    pendingVerifications.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-emerald-400 hover:bg-emerald-50"
                                        >
                                            <img
                                                src={defaultProfilePicture}
                                                alt={user.full_name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">
                                                    {user.full_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    @{user.username} •{' '}
                                                    {user.years_of_experience}{' '}
                                                    ans d'expérience
                                                </p>
                                            </div>
                                            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                                                Vérifier
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-slate-500">
                                        Aucune demande en attente
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* UTILISATEURS RÉCENTS */}
                        <div className="rounded-xl bg-white p-6 shadow-md">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Utilisateurs récents
                                </h2>
                                <UserPlus className="h-5 w-5 text-blue-600" />
                            </div>

                            <div className="space-y-3">
                                {recentUsers.slice(0, 5).map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-blue-400 hover:bg-blue-50"
                                    >
                                        <img
                                            src={
                                                user.profile_picture ||
                                                defaultProfilePicture
                                            }
                                            alt={user.full_name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900">
                                                    {user.full_name}
                                                </p>
                                                {user.is_verified && (
                                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                                )}
                                                {user.is_expert && (
                                                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                                        Expert
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                @{user.username} •{' '}
                                                {moment(
                                                    user.created_at,
                                                ).fromNow()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        STATISTIQUES SUPPLÉMENTAIRES
                    ======================================== */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-xl bg-white p-6 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-indigo-100 p-3">
                                    <Activity className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">
                                        Utilisateurs actifs
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {stats.active_users_today}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-pink-100 p-3">
                                    <MessageSquare className="h-6 w-6 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">
                                        Commentaires
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {stats.total_comments.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-yellow-100 p-3">
                                    <Users className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">
                                        Connexions
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {stats.total_connections.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
