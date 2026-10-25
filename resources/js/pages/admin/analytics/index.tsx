import AdminLayout from '@/layouts/admin-layout';
import { usePage } from '@inertiajs/react';
import {
    Activity,
    CheckCircle,
    Clock,
    FileText,
    MapPin,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Interface pour les données analytics
interface AnalyticsData {
    stats: {
        total_users: number;
        total_practitioners: number;
        verified_practitioners: number;
        experts_count: number;
        total_posts: number;
        total_messages: number;
        total_connections: number;
        pending_verifications: number;
        active_users_today: number;
        new_users_this_month: number;
    };
    user_growth: Array<{
        date: string;
        users: number;
        practitioners: number;
    }>;
    post_activity: Array<{
        date: string;
        posts: number;
        comments: number;
        likes: number;
    }>;
    specializations: Array<{
        name: string;
        count: number;
    }>;
    user_types: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    top_regions: Array<{
        location: string;
        count: number;
    }>;
    engagement_metrics: {
        avg_posts_per_user: number;
        avg_connections_per_user: number;
        avg_messages_per_day: number;
        engagement_rate: number;
    };
    recent_activities: Array<{
        type: string;
        user: string;
        action: string;
        timestamp: string;
    }>;
    verification_stats: {
        pending: number;
        approved: number;
        rejected: number;
        approval_rate: number;
    };
}

const COLORS = [
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
];

const Index: React.FC = () => {
    const { analytics } = usePage<{ analytics: AnalyticsData }>().props;
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
        '30d',
    );
    const [activeMetric, setActiveMetric] = useState<
        'users' | 'posts' | 'engagement'
    >('users');

    // Calcul des métriques dérivées
    const growthRate = useMemo(() => {
        if (!analytics.user_growth.length) return 0;
        const recent = analytics.user_growth.slice(-7);
        const older = analytics.user_growth.slice(-14, -7);
        const recentTotal = recent.reduce((sum, day) => sum + day.users, 0);
        const olderTotal = older.reduce((sum, day) => sum + day.users, 0);
        return olderTotal > 0
            ? parseFloat(
                  (((recentTotal - olderTotal) / olderTotal) * 100).toFixed(1),
              )
            : 0;
    }, [analytics.user_growth]);

    // Carte de statistique
    const StatCard: React.FC<{
        title: string;
        value: number | string;
        icon: React.ReactNode;
        trend?: number;
        color: string;
        subtitle?: string;
    }> = ({ title, value, icon, trend, color, subtitle }) => (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="mb-1 text-sm font-medium text-gray-600">
                        {title}
                    </p>
                    <p className="mb-1 text-3xl font-bold text-gray-900">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    )}
                    {trend !== undefined && (
                        <div
                            className={`mt-2 flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                            <TrendingUp
                                className={`mr-1 h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`}
                            />
                            <span>
                                {Math.abs(trend)}% vs période précédente
                            </span>
                        </div>
                    )}
                </div>
                <div className={`rounded-lg p-3 bg-${color}-100`}>{icon}</div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Analyses & Statistiques
                            </h1>
                            <p className="mt-1 text-gray-600">
                                Vue d'ensemble de la plateforme
                            </p>
                        </div>

                        {/* Sélecteur de période */}
                        <div className="flex gap-2">
                            {(['7d', '30d', '90d', '1y'] as const).map(
                                (range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                            timeRange === range
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {range === '7d' && '7 jours'}
                                        {range === '30d' && '30 jours'}
                                        {range === '90d' && '3 mois'}
                                        {range === '1y' && '1 an'}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Cartes de statistiques principales */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Utilisateurs totaux"
                            value={analytics.stats.total_users.toLocaleString()}
                            icon={<Users className="h-6 w-6 text-green-600" />}
                            trend={growthRate}
                            color="green"
                            subtitle={`+${analytics.stats.new_users_this_month} ce mois`}
                        />

                        <StatCard
                            title="Tradipraticiens"
                            value={analytics.stats.total_practitioners.toLocaleString()}
                            icon={
                                <UserCheck className="h-6 w-6 text-blue-600" />
                            }
                            color="blue"
                            subtitle={`${analytics.stats.verified_practitioners} vérifiés`}
                        />

                        <StatCard
                            title="Publications"
                            value={analytics.stats.total_posts.toLocaleString()}
                            icon={
                                <FileText className="h-6 w-6 text-purple-600" />
                            }
                            color="purple"
                            subtitle={`${analytics.engagement_metrics.avg_posts_per_user.toFixed(1)} par utilisateur`}
                        />

                        <StatCard
                            title="Connexions"
                            value={analytics.stats.total_connections.toLocaleString()}
                            icon={
                                <Activity className="h-6 w-6 text-orange-600" />
                            }
                            color="orange"
                            subtitle={`${analytics.engagement_metrics.engagement_rate.toFixed(1)}% engagement`}
                        />
                    </div>

                    {/* Métriques d'engagement */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Vérifications
                                </h3>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        En attente
                                    </span>
                                    <span className="text-sm font-semibold text-orange-600">
                                        {analytics.verification_stats.pending}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Approuvées
                                    </span>
                                    <span className="text-sm font-semibold text-green-600">
                                        {analytics.verification_stats.approved}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Taux d'approbation
                                    </span>
                                    <span className="text-sm font-semibold text-blue-600">
                                        {analytics.verification_stats.approval_rate.toFixed(
                                            1,
                                        )}
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Activité aujourd'hui
                                </h3>
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Utilisateurs actifs
                                    </span>
                                    <span className="text-sm font-semibold text-green-600">
                                        {analytics.stats.active_users_today}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Messages envoyés
                                    </span>
                                    <span className="text-sm font-semibold text-blue-600">
                                        {analytics.engagement_metrics.avg_messages_per_day.toFixed(
                                            0,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Experts
                                    </span>
                                    <span className="text-sm font-semibold text-purple-600">
                                        {analytics.stats.experts_count}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Moyennes
                                </h3>
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Posts/utilisateur
                                    </span>
                                    <span className="text-sm font-semibold text-orange-600">
                                        {analytics.engagement_metrics.avg_posts_per_user.toFixed(
                                            1,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Connexions/utilisateur
                                    </span>
                                    <span className="text-sm font-semibold text-green-600">
                                        {analytics.engagement_metrics.avg_connections_per_user.toFixed(
                                            1,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Taux d'engagement
                                    </span>
                                    <span className="text-sm font-semibold text-blue-600">
                                        {analytics.engagement_metrics.engagement_rate.toFixed(
                                            1,
                                        )}
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Graphiques principaux */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Croissance des utilisateurs */}
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Croissance des utilisateurs
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={analytics.user_growth}>
                                    <defs>
                                        <linearGradient
                                            id="colorUsers"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#10b981"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#10b981"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="colorPractitioners"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#3b82f6"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#3b82f6"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                        name="Utilisateurs"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="practitioners"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorPractitioners)"
                                        name="Tradipraticiens"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Activité des posts */}
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Activité des publications
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analytics.post_activity}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="posts"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={{ fill: '#8b5cf6' }}
                                        name="Publications"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="comments"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6' }}
                                        name="Commentaires"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="likes"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981' }}
                                        name="J'aime"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Répartition et spécialisations */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Types d'utilisateurs */}
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Répartition des utilisateurs
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analytics.user_types}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                        }
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {analytics.user_types.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top spécialisations */}
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Spécialisations populaires
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={analytics.specializations}
                                    layout="vertical"
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis
                                        type="number"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#10b981"
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top régions et activités récentes */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Top régions */}
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Régions actives
                                </h3>
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {analytics.top_regions.map((region, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                                                {index + 1}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {region.location}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-32 rounded-full bg-gray-200">
                                                <div
                                                    className="h-2 rounded-full bg-green-600"
                                                    style={{
                                                        width: `${(region.count / analytics.top_regions[0].count) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="w-12 text-right text-sm font-semibold text-gray-900">
                                                {region.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activités récentes */}
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Activités récentes
                                </h3>
                                <Activity className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="max-h-64 space-y-3 overflow-y-auto">
                                {analytics.recent_activities.map(
                                    (activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0"
                                        >
                                            <div
                                                className={`mt-2 h-2 w-2 rounded-full ${
                                                    activity.type === 'user'
                                                        ? 'bg-green-600'
                                                        : activity.type ===
                                                            'post'
                                                          ? 'bg-blue-600'
                                                          : activity.type ===
                                                              'verification'
                                                            ? 'bg-purple-600'
                                                            : 'bg-orange-600'
                                                }`}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">
                                                    <span className="font-medium">
                                                        {activity.user}
                                                    </span>{' '}
                                                    {activity.action}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {activity.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Index;
