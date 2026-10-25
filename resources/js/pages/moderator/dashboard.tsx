import ModeratorLayout from '@/layouts/moderator-layout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    MessageSquare,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    UserCheck,
    UserX,
} from 'lucide-react';
import moment from 'moment';

// ========================================
// INTERFACES
// ========================================

interface ModeratorDashboardProps {
    stats: {
        pending_reports: number;
        reports_today: number;
        resolved_this_week: number;
        flagged_posts: number;
        flagged_comments: number;
        blocked_users_today: number;
        total_blocked: number;
        my_reviews_today: number;
        my_total_reviews: number;
    };
    pendingReports: Array<{
        id: number;
        reason: string;
        description: string;
        created_at: string;
        reporter_name: string;
        reporter_username: string;
        reporter_picture: string | null;
        reported_name: string;
        reported_username: string;
        reported_picture: string | null;
    }>;
    recentPosts: any[];
    recentComments: any[];
    moderationActivity: Array<{
        date: string;
        count: number;
        resolved: number;
        dismissed: number;
    }>;
    auth: {
        user: any;
    };
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function ModeratorDashboard({
    stats,
    pendingReports,
    recentPosts,
    recentComments,
    moderationActivity,
    auth,
}: ModeratorDashboardProps) {
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Helper pour formater les dates
    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        return d.toLocaleDateString('fr-FR');
    };

    const formatDateShort = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
        });
    };

    const getCurrentDate = () => {
        const d = new Date();
        return d.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Fonction pour obtenir la couleur selon la raison
    const getReasonColor = (reason: string) => {
        const colors: Record<string, string> = {
            spam: 'bg-orange-100 text-orange-700 border-orange-300',
            harassment: 'bg-red-100 text-red-700 border-red-300',
            fake_profile: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            inappropriate_content:
                'bg-purple-100 text-purple-700 border-purple-300',
            other: 'bg-gray-100 text-gray-700 border-gray-300',
        };
        return colors[reason] || colors.other;
    };

    // Fonction pour obtenir le label de raison
    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            spam: 'Spam',
            harassment: 'Harcèlement',
            fake_profile: 'Faux profil',
            inappropriate_content: 'Contenu inapproprié',
            other: 'Autre',
        };
        return labels[reason] || reason;
    };

    // Calculer les statistiques d'activité
    const totalActivity = moderationActivity.reduce(
        (sum, day) => sum + day.count,
        0,
    );
    const totalResolved = moderationActivity.reduce(
        (sum, day) => sum + day.resolved,
        0,
    );
    const totalDismissed = moderationActivity.reduce(
        (sum, day) => sum + day.dismissed,
        0,
    );
    const successRate =
        totalActivity > 0
            ? ((totalResolved / totalActivity) * 100).toFixed(1)
            : 0;

    // Calculer les tendances
    const yesterdayReports =
        moderationActivity.length > 1
            ? moderationActivity[moderationActivity.length - 2].count
            : 0;
    const todayReports =
        moderationActivity.length > 0
            ? moderationActivity[moderationActivity.length - 1].count
            : 0;
    const reportsTrend = todayReports - yesterdayReports;

    return (
        <ModeratorLayout>
            <Head title="Tableau de bord Modérateur" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* ========================================
                        HEADER AVEC STATUT
                    ======================================== */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Tableau de bord Modérateur
                            </h1>
                            <p className="mt-1 text-slate-600">
                                Bienvenue, {auth.user.full_name} •{' '}
                                {moment().format('dddd D MMMM YYYY')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white shadow-lg">
                                <ShieldAlert className="h-5 w-5" />
                                <span className="font-semibold">
                                    Modérateur
                                </span>
                            </div>
                            {stats.pending_reports > 0 && (
                                <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-4 py-2 text-orange-700">
                                    <Clock className="h-5 w-5" />
                                    <span className="font-semibold">
                                        {stats.pending_reports} en attente
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========================================
                        ALERTES IMPORTANTES
                    ======================================== */}
                    {stats.pending_reports > 10 && (
                        <div className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4 shadow-md">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-orange-600" />
                                <div className="flex-1">
                                    <p className="font-semibold text-orange-900">
                                        ⚠️ Volume élevé de signalements
                                    </p>
                                    <p className="mt-1 text-sm text-orange-700">
                                        Il y a actuellement{' '}
                                        <strong>{stats.pending_reports}</strong>{' '}
                                        signalements en attente. L'équipe de
                                        modération devrait intervenir
                                        rapidement.
                                    </p>
                                    <Link
                                        href="/moderator/reports"
                                        className="mt-2 inline-block text-sm font-medium text-orange-800 underline hover:text-orange-900"
                                    >
                                        Voir tous les signalements →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================
                        STATISTIQUES PRINCIPALES (4 CARTES)
                    ======================================== */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Signalements en attente */}
                        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl">
                            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-orange-100 opacity-50 transition group-hover:scale-110" />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div className="rounded-full bg-orange-100 p-3">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                    {reportsTrend !== 0 && (
                                        <div
                                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                reportsTrend > 0
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {reportsTrend > 0 ? (
                                                <TrendingUp className="h-3 w-3" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3" />
                                            )}
                                            <span>
                                                {Math.abs(reportsTrend)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-slate-600">
                                        En attente
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-slate-900">
                                        {stats.pending_reports}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        +{stats.reports_today} aujourd'hui
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Résolus cette semaine */}
                        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl">
                            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-green-100 opacity-50 transition group-hover:scale-110" />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div className="rounded-full bg-green-100 p-3">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-green-600">
                                            {successRate}% succès
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-slate-600">
                                        Résolus (7j)
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-slate-900">
                                        {stats.resolved_this_week}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        {totalDismissed} rejetés
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Utilisateurs bloqués */}
                        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl">
                            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-red-100 opacity-50 transition group-hover:scale-110" />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div className="rounded-full bg-red-100 p-3">
                                        <UserX className="h-6 w-6 text-red-600" />
                                    </div>
                                    {stats.blocked_users_today > 0 && (
                                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                                            +{stats.blocked_users_today}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-slate-600">
                                        Utilisateurs bloqués
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-slate-900">
                                        {stats.total_blocked}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Total permanent
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mes révisions */}
                        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl">
                            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-100 opacity-50 transition group-hover:scale-110" />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <UserCheck className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <Eye className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-slate-600">
                                        Mes révisions
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-slate-900">
                                        {stats.my_total_reviews}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        {stats.my_reviews_today} aujourd'hui
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        GRAPHIQUE D'ACTIVITÉ (7 DERNIERS JOURS)
                    ======================================== */}
                    <div className="rounded-xl bg-white p-6 shadow-md">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Activité de modération (7 derniers jours)
                                </h2>
                                <p className="text-sm text-slate-600">
                                    {totalActivity} signalements traités •{' '}
                                    {successRate}% de résolution
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {moderationActivity.map((day, index) => {
                                const maxCount = Math.max(
                                    ...moderationActivity.map((d) => d.count),
                                );
                                const resolvedPercent =
                                    day.count > 0
                                        ? (day.resolved / day.count) * 100
                                        : 0;
                                const dismissedPercent =
                                    day.count > 0
                                        ? (day.dismissed / day.count) * 100
                                        : 0;

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-24 text-sm font-medium text-slate-600">
                                            {moment(day.date).format(
                                                'ddd DD/MM',
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex h-8 overflow-hidden rounded-lg bg-gray-100">
                                                {/* Barre résolus */}
                                                <div
                                                    className="bg-green-500 transition-all"
                                                    style={{
                                                        width: `${resolvedPercent}%`,
                                                    }}
                                                    title={`${day.resolved} résolus`}
                                                />
                                                {/* Barre rejetés */}
                                                <div
                                                    className="bg-gray-400 transition-all"
                                                    style={{
                                                        width: `${dismissedPercent}%`,
                                                    }}
                                                    title={`${day.dismissed} rejetés`}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-16 text-right text-sm font-semibold text-slate-900">
                                            {day.count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Légende */}
                        <div className="mt-4 flex items-center justify-center gap-6 border-t pt-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-green-500" />
                                <span className="text-xs text-slate-600">
                                    Résolus ({totalResolved})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded bg-gray-400" />
                                <span className="text-xs text-slate-600">
                                    Rejetés ({totalDismissed})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        SIGNALEMENTS EN ATTENTE (PRIORITAIRES)
                    ======================================== */}
                    <div className="rounded-xl bg-white p-6 shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Signalements prioritaires
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Signalements nécessitant une attention
                                    immédiate
                                </p>
                            </div>
                            <Link
                                href="/moderator/reports"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                Voir tous
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {pendingReports.length > 0 ? (
                                pendingReports.slice(0, 5).map((report) => (
                                    <Link
                                        key={report.id}
                                        href={`/moderator/reports/${report.id}`}
                                        className="flex items-start gap-4 rounded-lg border-2 border-slate-200 p-4 transition hover:border-orange-400 hover:bg-orange-50"
                                    >
                                        {/* Photos */}
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={
                                                    report.reporter_picture ||
                                                    defaultProfilePicture
                                                }
                                                alt={report.reporter_name}
                                                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow"
                                            />
                                            <div className="text-slate-400">
                                                →
                                            </div>
                                            <img
                                                src={
                                                    report.reported_picture ||
                                                    defaultProfilePicture
                                                }
                                                alt={report.reported_name}
                                                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow"
                                            />
                                        </div>

                                        {/* Détails */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-slate-900">
                                                    {report.reporter_name}
                                                </span>
                                                <span className="text-slate-500">
                                                    signale
                                                </span>
                                                <span className="font-medium text-slate-900">
                                                    {report.reported_name}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getReasonColor(report.reason)}`}
                                                >
                                                    {getReasonLabel(
                                                        report.reason,
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    {moment(
                                                        report.created_at,
                                                    ).fromNow()}
                                                </span>
                                            </div>
                                            {report.description && (
                                                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                                    "{report.description}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Flèche */}
                                        <div className="flex items-center">
                                            <div className="rounded-lg bg-blue-100 p-2 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                                <Eye className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="py-16 text-center">
                                    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                                    <p className="mt-4 text-lg font-medium text-slate-900">
                                        Aucun signalement en attente
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Excellent travail ! La file d'attente
                                        est vide.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========================================
                        DEUX COLONNES : POSTS & COMMENTAIRES
                    ======================================== */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Publications récentes */}
                        <div className="rounded-xl bg-white p-6 shadow-md">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Publications récentes
                                    </h2>
                                </div>
                                <Link
                                    href="/moderator/posts"
                                    className="text-sm font-medium text-purple-600 hover:text-purple-700"
                                >
                                    Voir tout →
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentPosts.slice(0, 5).map((post) => (
                                    <div
                                        key={post.id}
                                        className="group rounded-lg border border-slate-200 p-3 transition hover:border-purple-400 hover:bg-purple-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={
                                                        post.user
                                                            .profile_picture ||
                                                        defaultProfilePicture
                                                    }
                                                    alt={post.user.full_name}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                                <div>
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {post.user.full_name}
                                                    </span>
                                                    <p className="text-xs text-slate-500">
                                                        {moment(
                                                            post.created_at,
                                                        ).fromNow()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 text-xs text-slate-500">
                                                <span>
                                                    💬 {post.comments_count}
                                                </span>
                                                <span>
                                                    ❤️ {post.liked_by_count}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                            {post.content ||
                                                '(contenu multimédia)'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Commentaires récents */}
                        <div className="rounded-xl bg-white p-6 shadow-md">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-pink-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Commentaires récents
                                    </h2>
                                </div>
                                <Link
                                    href="/moderator/comments"
                                    className="text-sm font-medium text-pink-600 hover:text-pink-700"
                                >
                                    Voir tout →
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentComments.slice(0, 5).map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="group rounded-lg border border-slate-200 p-3 transition hover:border-pink-400 hover:bg-pink-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={
                                                    comment.user
                                                        .profile_picture ||
                                                    defaultProfilePicture
                                                }
                                                alt={comment.user.full_name}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-slate-900">
                                                    {comment.user.full_name}
                                                </span>
                                                <p className="text-xs text-slate-500">
                                                    {moment(
                                                        comment.created_at,
                                                    ).fromNow()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                            {comment.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ModeratorLayout>
    );
}
