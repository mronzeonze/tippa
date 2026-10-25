import ModeratorLayout from '@/layouts/moderator-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronDown,
    Clock,
    Eye,
    Filter,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';

// ========================================
// INTERFACES
// ========================================

interface Report {
    id: number;
    reason: string;
    description: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    reporter_name: string;
    reporter_username: string;
    reporter_picture: string | null;
    reported_name: string;
    reported_username: string;
    reported_picture: string | null;
    reviewer_name: string | null;
}

interface ReportsIndexProps {
    reports: {
        data: Report[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: {
        status: string;
        reason: string;
    };
    auth: {
        user: any;
    };
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function ReportsIndex({
    reports,
    filters,
    auth,
}: ReportsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Configuration des statuts
    const statuses = [
        { value: 'all', label: 'Tous', color: 'gray' },
        { value: 'pending', label: 'En attente', color: 'orange' },
        { value: 'reviewed', label: 'En révision', color: 'blue' },
        { value: 'resolved', label: 'Résolus', color: 'green' },
        { value: 'dismissed', label: 'Rejetés', color: 'gray' },
    ];

    // Configuration des raisons
    const reasons = [
        { value: 'all', label: 'Toutes les raisons' },
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Harcèlement' },
        { value: 'fake_profile', label: 'Faux profil' },
        { value: 'inappropriate_content', label: 'Contenu inapproprié' },
        { value: 'other', label: 'Autre' },
    ];

    // Fonction pour changer les filtres
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/moderator/reports',
            {
                ...filters,
                [key]: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Fonction pour obtenir la couleur selon le statut
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-orange-100 text-orange-700 border-orange-300',
            reviewed: 'bg-blue-100 text-blue-700 border-blue-300',
            resolved: 'bg-green-100 text-green-700 border-green-300',
            dismissed: 'bg-gray-100 text-gray-700 border-gray-300',
        };
        return colors[status] || colors.pending;
    };

    // Fonction pour obtenir la couleur selon la raison
    const getReasonColor = (reason: string) => {
        const colors: Record<string, string> = {
            spam: 'bg-orange-100 text-orange-700',
            harassment: 'bg-red-100 text-red-700',
            fake_profile: 'bg-yellow-100 text-yellow-700',
            inappropriate_content: 'bg-purple-100 text-purple-700',
            other: 'bg-gray-100 text-gray-700',
        };
        return colors[reason] || colors.other;
    };

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

    // Labels traduits
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

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'En attente',
            reviewed: 'En révision',
            resolved: 'Résolu',
            dismissed: 'Rejeté',
        };
        return labels[status] || status;
    };

    return (
        <ModeratorLayout>
            <Head title="Signalements" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* ========================================
                        HEADER
                    ======================================== */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Signalements
                            </h1>
                            <p className="mt-1 text-slate-600">
                                Gérer tous les signalements d'utilisateurs
                            </p>
                        </div>

                        {/* Statistiques rapides */}
                        <div className="flex gap-2">
                            {statuses.slice(1).map((status) => {
                                const count = reports.data.filter(
                                    (r) => r.status === status.value,
                                ).length;
                                return (
                                    <div
                                        key={status.value}
                                        className={`rounded-lg px-3 py-2 text-center ${
                                            filters.status === status.value
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-slate-600'
                                        }`}
                                    >
                                        <p className="text-xs">
                                            {status.label}
                                        </p>
                                        <p className="text-lg font-bold">
                                            {count}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ========================================
                        BARRE DE FILTRES
                    ======================================== */}
                    <div className="rounded-xl bg-white p-4 shadow-md">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            {/* Recherche */}
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom d'utilisateur..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                />
                            </div>

                            {/* Bouton filtres */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-indigo-500 hover:text-indigo-600"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filtres
                                    <ChevronDown
                                        className={`h-4 w-4 transition ${showFilters ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Reset filtres */}
                                {(filters.status !== 'pending' ||
                                    filters.reason !== 'all') && (
                                    <button
                                        onClick={() =>
                                            router.get('/moderator/reports')
                                        }
                                        className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                                    >
                                        <X className="h-4 w-4" />
                                        Réinitialiser
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Panel de filtres */}
                        {showFilters && (
                            <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
                                {/* Statut */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Statut
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {statuses.map((status) => (
                                            <button
                                                key={status.value}
                                                onClick={() =>
                                                    handleFilterChange(
                                                        'status',
                                                        status.value,
                                                    )
                                                }
                                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                                    filters.status ===
                                                    status.value
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {status.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Raison */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Raison
                                    </label>
                                    <select
                                        value={filters.reason}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'reason',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                    >
                                        {reasons.map((reason) => (
                                            <option
                                                key={reason.value}
                                                value={reason.value}
                                            >
                                                {reason.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ========================================
                        LISTE DES SIGNALEMENTS
                    ======================================== */}
                    <div className="space-y-3">
                        {reports.data.length > 0 ? (
                            reports.data.map((report) => (
                                <Link
                                    key={report.id}
                                    href={`/moderator/reports/${report.id}`}
                                    className="group block rounded-xl border-2 border-slate-200 bg-white p-4 transition hover:border-indigo-400 hover:shadow-lg"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Photos utilisateurs */}
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <img
                                                    src={
                                                        report.reporter_picture ||
                                                        defaultProfilePicture
                                                    }
                                                    alt={report.reporter_name}
                                                    className="h-12 w-12 rounded-full border-2 border-white object-cover shadow"
                                                />
                                                <div className="absolute -right-1 -bottom-1 rounded-full bg-blue-500 p-1">
                                                    <AlertTriangle className="h-3 w-3 text-white" />
                                                </div>
                                            </div>
                                            <div className="text-slate-400">
                                                →
                                            </div>
                                            <img
                                                src={
                                                    report.reported_picture ||
                                                    defaultProfilePicture
                                                }
                                                alt={report.reported_name}
                                                className="h-12 w-12 rounded-full border-2 border-white object-cover shadow"
                                            />
                                        </div>

                                        {/* Informations */}
                                        <div className="min-w-0 flex-1">
                                            {/* Noms */}
                                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                                <span className="font-semibold text-slate-900">
                                                    {report.reporter_name}
                                                </span>
                                                <span className="text-slate-500">
                                                    signale
                                                </span>
                                                <span className="font-semibold text-slate-900">
                                                    {report.reported_name}
                                                </span>
                                            </div>

                                            {/* Usernames */}
                                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                                <span>
                                                    @{report.reporter_username}
                                                </span>
                                                <span>→</span>
                                                <span>
                                                    @{report.reported_username}
                                                </span>
                                            </div>

                                            {/* Badges */}
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${getReasonColor(report.reason)}`}
                                                >
                                                    {getReasonLabel(
                                                        report.reason,
                                                    )}
                                                </span>
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(report.status)}`}
                                                >
                                                    {getStatusLabel(
                                                        report.status,
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(
                                                        report.created_at,
                                                    )}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            {report.description && (
                                                <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                                                    "{report.description}"
                                                </p>
                                            )}

                                            {/* Reviewer */}
                                            {report.reviewer_name && (
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Traité par{' '}
                                                    <span className="font-medium">
                                                        {report.reviewer_name}
                                                    </span>{' '}
                                                    le{' '}
                                                    {formatDate(
                                                        report.reviewed_at!,
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        {/* Bouton voir */}
                                        <div className="flex items-center">
                                            <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                                                <Eye className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="rounded-xl bg-white p-16 text-center shadow-md">
                                <AlertTriangle className="mx-auto h-16 w-16 text-gray-300" />
                                <p className="mt-4 text-lg font-medium text-slate-900">
                                    Aucun signalement trouvé
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Essayez de modifier vos filtres de recherche
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ========================================
                        PAGINATION
                    ======================================== */}
                    {reports.last_page > 1 && (
                        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-md">
                            <p className="text-sm text-slate-600">
                                Affichage de{' '}
                                {(reports.current_page - 1) * reports.per_page +
                                    1}{' '}
                                à{' '}
                                {Math.min(
                                    reports.current_page * reports.per_page,
                                    reports.total,
                                )}{' '}
                                sur {reports.total} signalements
                            </p>
                            <div className="flex gap-2">
                                {reports.prev_page_url && (
                                    <Link
                                        href={reports.prev_page_url}
                                        className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-indigo-500 hover:text-indigo-600"
                                    >
                                        Précédent
                                    </Link>
                                )}
                                <span className="flex items-center px-4 text-sm font-medium text-slate-900">
                                    Page {reports.current_page} sur{' '}
                                    {reports.last_page}
                                </span>
                                {reports.next_page_url && (
                                    <Link
                                        href={reports.next_page_url}
                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                                    >
                                        Suivant
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModeratorLayout>
    );
}
