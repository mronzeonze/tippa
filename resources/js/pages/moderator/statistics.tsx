import ModeratorLayout from '@/layouts/moderator-layout';
import { router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    Flag,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Stats {
    by_reason: Array<{ reason: string; count: number }>;
    by_type: Array<{ reportable_type: string; count: number }>;
    by_status: Array<{ status: string; count: number }>;
    daily_trend: Array<{ date: string; count: number }>;
    moderator_performance: Array<{
        reviewed_by: string;
        total_reviews: number;
        resolved: number;
        dismissed: number;
        moderator: {
            id: string;
            full_name: string;
            username: string;
        };
    }>;
}

interface PageProps {
    stats: Stats;
    period: string;
    auth: {
        user: any;
    };
    [key: string]: any;
}

export default function ModeratorStatistics() {
    const { stats, period: initialPeriod } = usePage<PageProps>().props;
    const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get(
            '/moderator/statistics',
            {
                period: newPeriod,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const reasonLabels: Record<string, string> = {
        spam: 'Spam',
        harassment: 'Harcèlement',
        inappropriate_content: 'Contenu inapproprié',
        fake_profile: 'Faux profil',
        hate_speech: 'Discours haineux',
        violence: 'Violence',
        misinformation: 'Désinformation',
        other: 'Autre',
    };

    const typeLabels: Record<string, string> = {
        post: 'Publications',
        comment: 'Commentaires',
    };

    const statusLabels: Record<string, string> = {
        pending: 'En attente',
        resolved: 'Résolus',
        dismissed: 'Rejetés',
    };

    const totalReports = stats.by_status.reduce(
        (sum, item) => sum + item.count,
        0,
    );
    const pendingReports =
        stats.by_status.find((s) => s.status === 'pending')?.count || 0;
    const resolvedReports =
        stats.by_status.find((s) => s.status === 'resolved')?.count || 0;
    const dismissedReports =
        stats.by_status.find((s) => s.status === 'dismissed')?.count || 0;

    const maxDailyCount = Math.max(...stats.daily_trend.map((d) => d.count), 1);

    return (
        <ModeratorLayout>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Statistiques de Modération
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Analyse et performance de la modération
                        </p>
                    </div>

                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    >
                        <option value="7">7 derniers jours</option>
                        <option value="30">30 derniers jours</option>
                        <option value="90">90 derniers jours</option>
                    </select>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow">
                        <div className="mb-2 flex items-center justify-between">
                            <Flag className="h-8 w-8 opacity-80" />
                            <span className="text-2xl font-bold">
                                {totalReports}
                            </span>
                        </div>
                        <p className="text-sm font-medium opacity-90">
                            Signalements totaux
                        </p>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow">
                        <div className="mb-2 flex items-center justify-between">
                            <Clock className="h-8 w-8 opacity-80" />
                            <span className="text-2xl font-bold">
                                {pendingReports}
                            </span>
                        </div>
                        <p className="text-sm font-medium opacity-90">
                            En attente
                        </p>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow">
                        <div className="mb-2 flex items-center justify-between">
                            <CheckCircle className="h-8 w-8 opacity-80" />
                            <span className="text-2xl font-bold">
                                {resolvedReports}
                            </span>
                        </div>
                        <p className="text-sm font-medium opacity-90">
                            Résolus
                        </p>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 p-6 text-white shadow">
                        <div className="mb-2 flex items-center justify-between">
                            <XCircle className="h-8 w-8 opacity-80" />
                            <span className="text-2xl font-bold">
                                {dismissedReports}
                            </span>
                        </div>
                        <p className="text-sm font-medium opacity-90">
                            Rejetés
                        </p>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Signalements par raison
                        </h2>
                        <div className="space-y-3">
                            {stats.by_reason.map((item) => (
                                <div key={item.reason}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">
                                            {reasonLabels[item.reason] ||
                                                item.reason}
                                        </span>
                                        <span className="text-gray-600">
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-full rounded-full bg-orange-500"
                                            style={{
                                                width: `${(item.count / totalReports) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Signalements par type
                        </h2>
                        <div className="space-y-3">
                            {stats.by_type.map((item) => (
                                <div key={item.reportable_type}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">
                                            {typeLabels[item.reportable_type] ||
                                                item.reportable_type}
                                        </span>
                                        <span className="text-gray-600">
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-full rounded-full bg-blue-500"
                                            style={{
                                                width: `${(item.count / totalReports) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Évolution quotidienne
                    </h2>
                    <div className="flex h-64 items-end justify-between gap-2">
                        {stats.daily_trend.map((day) => (
                            <div
                                key={day.date}
                                className="flex flex-1 flex-col items-center gap-2"
                            >
                                <div
                                    className="flex w-full items-end justify-center"
                                    style={{ height: '200px' }}
                                >
                                    <div
                                        className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-indigo-400"
                                        style={{
                                            height: `${(day.count / maxDailyCount) * 100}%`,
                                        }}
                                        title={`${day.count} signalements`}
                                    />
                                </div>
                                <div className="text-xs text-gray-600">
                                    {new Date(day.date).toLocaleDateString(
                                        'fr-FR',
                                        { day: '2-digit', month: '2-digit' },
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Users className="h-5 w-5 text-purple-600" />
                        Performance des modérateurs
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-600">
                                    <th className="pb-3">Modérateur</th>
                                    <th className="pb-3 text-center">Total</th>
                                    <th className="pb-3 text-center">
                                        Résolus
                                    </th>
                                    <th className="pb-3 text-center">
                                        Rejetés
                                    </th>
                                    <th className="pb-3 text-center">
                                        Taux de résolution
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.moderator_performance.map((mod) => {
                                    const resolutionRate =
                                        mod.total_reviews > 0
                                            ? Math.round(
                                                  (mod.resolved /
                                                      mod.total_reviews) *
                                                      100,
                                              )
                                            : 0;

                                    return (
                                        <tr
                                            key={mod.reviewed_by}
                                            className="text-sm"
                                        >
                                            <td className="py-3 font-medium text-gray-900">
                                                {mod.moderator.full_name}
                                                <span className="ml-2 text-xs text-gray-500">
                                                    @{mod.moderator.username}
                                                </span>
                                            </td>
                                            <td className="py-3 text-center text-gray-700">
                                                {mod.total_reviews}
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    {mod.resolved}
                                                </span>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                    {mod.dismissed}
                                                </span>
                                            </td>
                                            <td className="py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className="h-full rounded-full bg-green-500"
                                                            style={{
                                                                width: `${resolutionRate}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {resolutionRate}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ModeratorLayout>
    );
}
