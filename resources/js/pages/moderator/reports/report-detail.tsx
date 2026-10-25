import ModeratorLayout from '@/layouts/moderator-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Ban,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    MessageSquare,
    Trash2,
    UserX,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// ========================================
// INTERFACES
// ========================================
interface User {
    id: string;
    full_name: string;
    username: string;
    email: string;
    profile_picture: string | null;
}

interface ReportDetailProps {
    report: {
        id: number;
        reason: string;
        description: string | null;
        status: string;
        created_at: string;
        reviewed_at: string | null;
        // Données du reporter (peut être un objet ou des champs directs)
        reporter?: User;
        reporter_id?: string;
        reporter_name?: string;
        reporter_username?: string;
        reporter_email?: string;
        reporter_picture?: string | null;
        // Données du reported (peut être un objet ou des champs directs)
        reported?: User;
        reported_id?: string;
        reported_name?: string;
        reported_username?: string;
        reported_email?: string;
        reported_picture?: string | null;
        reported_type?: string;
        // Reviewer
        reviewer?: User;
        reviewer_name?: string | null;
    };
    reportHistory?: any[];
    recentPosts?: any[];
    auth: {
        user: any;
    };
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
export default function ReportDetail({
    report,
    reportHistory = [], // Valeur par défaut
    recentPosts = [], // Valeur par défaut
    auth,
}: ReportDetailProps) {
    // ========================================
    // ÉTATS
    // ========================================
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showPosts, setShowPosts] = useState(false);
    const [showHistory, setShowHistory] = useState(true);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // ========================================
    // EXTRACTION DES DONNÉES UTILISATEURS
    // ========================================

    // Reporter (auteur du signalement)
    const reporter = {
        name:
            report.reporter?.full_name ||
            report.reporter_name ||
            'Utilisateur inconnu',
        username:
            report.reporter?.username || report.reporter_username || 'unknown',
        email: report.reporter?.email || report.reporter_email || 'N/A',
        picture:
            report.reporter?.profile_picture || report.reporter_picture || null,
        id: report.reporter?.id || report.reporter_id || null,
    };

    // Reported (utilisateur signalé)
    const reported = {
        name:
            report.reported?.full_name ||
            report.reported_name ||
            'Utilisateur inconnu',
        username:
            report.reported?.username || report.reported_username || 'unknown',
        email: report.reported?.email || report.reported_email || 'N/A',
        picture:
            report.reported?.profile_picture || report.reported_picture || null,
        id: report.reported?.id || report.reported_id || null,
    };

    // Reviewer
    const reviewerName =
        report.reviewer?.full_name || report.reviewer_name || null;

    // ========================================
    // HELPERS
    // ========================================

    /**
     * Formater une date en français
     */
    const formatDate = (date: string) => {
        try {
            const d = new Date(date);
            return d.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return date;
        }
    };

    /**
     * Obtenir le label de la raison
     */
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

    /**
     * Couleur du badge de statut
     */
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-orange-100 text-orange-700 border-orange-200',
            reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
            resolved: 'bg-green-100 text-green-700 border-green-200',
            dismissed: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[status] || colors.pending;
    };

    /**
     * Icône du statut
     */
    const getStatusIcon = (status: string) => {
        const icons: Record<string, any> = {
            pending: Clock,
            reviewed: Eye,
            resolved: CheckCircle,
            dismissed: XCircle,
        };
        const Icon = icons[status] || Clock;
        return <Icon className="h-4 w-4" />;
    };

    // ========================================
    // ACTIONS DISPONIBLES
    // ========================================
    const actions = [
        {
            value: 'dismiss',
            label: 'Rejeter le signalement',
            description: 'Le signalement est infondé',
            icon: XCircle,
            color: 'gray',
            bgColor: 'bg-gray-50 hover:bg-gray-100',
        },
        {
            value: 'warn',
            label: "Avertir l'utilisateur",
            description: 'Envoyer un avertissement officiel',
            icon: AlertTriangle,
            color: 'yellow',
            bgColor: 'bg-yellow-50 hover:bg-yellow-100',
        },
        {
            value: 'suspend',
            label: 'Suspendre le compte (7 jours)',
            description: 'Suspension temporaire du compte',
            icon: Ban,
            color: 'orange',
            bgColor: 'bg-orange-50 hover:bg-orange-100',
        },
        {
            value: 'ban',
            label: 'Bannir définitivement',
            description: 'Interdiction permanente',
            icon: UserX,
            color: 'red',
            bgColor: 'bg-red-50 hover:bg-red-100',
        },
        {
            value: 'delete',
            label: 'Supprimer le compte',
            description: 'Suppression complète et définitive',
            icon: Trash2,
            color: 'red',
            bgColor: 'bg-red-50 hover:bg-red-100',
        },
    ];

    // ========================================
    // GESTION DE LA SOUMISSION
    // ========================================

    /**
     * Soumettre la décision de modération
     */
    const handleSubmit = () => {
        // Validation
        if (!selectedAction) {
            toast.error('Veuillez sélectionner une action');
            return;
        }

        const selectedActionLabel = actions.find(
            (a) => a.value === selectedAction,
        )?.label;

        if (
            !confirm(
                `⚠️ Êtes-vous sûr de vouloir ${selectedActionLabel?.toLowerCase()} ?\n\nCette action sera enregistrée dans l'historique.`,
            )
        ) {
            return;
        }

        setProcessing(true);

        router.post(
            `/moderator/reports/${report.id}/resolve`,
            {
                action: selectedAction,
                notes: notes.trim() || null,
            },
            {
                onSuccess: () => {
                    toast.success('✅ Signalement traité avec succès');
                    // Réinitialiser le formulaire
                    setSelectedAction('');
                    setNotes('');
                },
                onError: (errors) => {
                    console.error('Erreur de modération:', errors);
                    const errorMessage =
                        Object.values(errors)[0] || 'Erreur lors du traitement';
                    toast.error(`❌ ${errorMessage}`);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    /**
     * Voir le profil de l'utilisateur signalé
     */
    const viewProfile = (userId: string) => {
        router.get(`/profile/${userId}`);
    };

    // ========================================
    // RENDU DU COMPOSANT
    // ========================================
    return (
        <ModeratorLayout>
            <Head title={`Signalement #${report.id}`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* ========================================
                        BREADCRUMB
                        ======================================== */}
                    <Link
                        href="/moderator/reports"
                        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux signalements
                    </Link>

                    {/* ========================================
                        HEADER AVEC STATUT
                        ======================================== */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold">
                                        Signalement #{report.id}
                                    </h1>
                                    <p className="mt-2 flex items-center gap-2 text-indigo-100">
                                        <Clock className="h-4 w-4" />
                                        Créé le {formatDate(report.created_at)}
                                    </p>
                                </div>
                                <div
                                    className={`flex items-center gap-2 rounded-full border-2 bg-white px-6 py-3 font-semibold shadow-lg ${getStatusColor(report.status)}`}
                                >
                                    {getStatusIcon(report.status)}
                                    <span className="capitalize">
                                        {report.status === 'pending'
                                            ? 'En attente'
                                            : report.status === 'reviewed'
                                              ? 'Examiné'
                                              : report.status === 'resolved'
                                                ? 'Résolu'
                                                : 'Rejeté'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reviewer info si traité */}
                        {report.reviewed_at && reviewerName && (
                            <div className="border-t bg-gray-50 px-6 py-3">
                                <p className="text-sm text-gray-600">
                                    Traité par{' '}
                                    <span className="font-medium text-gray-900">
                                        {reviewerName}
                                    </span>{' '}
                                    le {formatDate(report.reviewed_at)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ========================================
                        GRILLE 2 COLONNES : REPORTER & REPORTED
                        ======================================== */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Reporter (Auteur du signalement) */}
                        <div className="rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="rounded-full bg-blue-100 p-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Auteur du signalement
                                </h2>
                            </div>
                            <div className="flex items-start gap-4">
                                <img
                                    src={
                                        reporter.picture ||
                                        defaultProfilePicture
                                    }
                                    alt={reporter.name}
                                    className="h-20 w-20 rounded-full border-2 border-blue-200 object-cover shadow-md"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            defaultProfilePicture;
                                    }}
                                />
                                <div className="flex-1 space-y-1">
                                    <p className="text-lg font-semibold text-slate-900">
                                        {reporter.name}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        @{reporter.username}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        📧 {reporter.email}
                                    </p>
                                    {reporter.id && (
                                        <button
                                            onClick={() =>
                                                viewProfile(reporter.id!)
                                            }
                                            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Voir le profil
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reported (Utilisateur signalé) */}
                        <div className="rounded-xl bg-white p-6 shadow-lg transition hover:shadow-xl">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="rounded-full bg-red-100 p-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Utilisateur signalé
                                </h2>
                            </div>
                            <div className="flex items-start gap-4">
                                <img
                                    src={
                                        reported.picture ||
                                        defaultProfilePicture
                                    }
                                    alt={reported.name}
                                    className="h-20 w-20 rounded-full border-2 border-red-200 object-cover shadow-md"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            defaultProfilePicture;
                                    }}
                                />
                                <div className="flex-1 space-y-1">
                                    <p className="text-lg font-semibold text-slate-900">
                                        {reported.name}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        @{reported.username}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        📧 {reported.email}
                                    </p>
                                    {reported.id && (
                                        <button
                                            onClick={() =>
                                                router.get(
                                                    `/profile/${reported.id}`,
                                                )
                                            }
                                            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Voir le profil
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        DÉTAILS DU SIGNALEMENT
                        ======================================== */}
                    <div className="rounded-xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-full bg-purple-100 p-2">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Détails du signalement
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <span className="text-sm font-medium text-slate-700">
                                    🏷️ Raison :
                                </span>
                                <span className="ml-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                                    {getReasonLabel(report.reason)}
                                </span>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4">
                                <span className="mb-2 block text-sm font-medium text-slate-700">
                                    📝 Description :
                                </span>
                                <p className="text-sm leading-relaxed whitespace-pre-line text-slate-900">
                                    {report.description ||
                                        '⚠️ Aucune description fournie'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        FORMULAIRE D'ACTION (si pending)
                        ======================================== */}
                    {report.status === 'pending' && (
                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <div className="mb-6 flex items-center gap-2">
                                <div className="rounded-full bg-indigo-100 p-2">
                                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Prendre une décision
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {/* Actions */}
                                <div className="grid gap-3 md:grid-cols-2">
                                    {actions.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={action.value}
                                                onClick={() =>
                                                    setSelectedAction(
                                                        action.value,
                                                    )
                                                }
                                                className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                                                    selectedAction ===
                                                    action.value
                                                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                                        : `border-gray-200 ${action.bgColor}`
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`rounded-lg p-2 ${
                                                            selectedAction ===
                                                            action.value
                                                                ? 'bg-indigo-500 text-white'
                                                                : `bg-${action.color}-100 text-${action.color}-600`
                                                        }`}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-900">
                                                            {action.label}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-600">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                    {selectedAction ===
                                                        action.value && (
                                                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Notes internes */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        📋 Notes internes (optionnel)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        placeholder="Ajoutez des notes pour justifier votre décision..."
                                        className="w-full rounded-lg border border-gray-300 p-3 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                        rows={4}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Ces notes seront visibles uniquement par
                                        les modérateurs
                                    </p>
                                </div>

                                {/* Bouton de confirmation */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedAction || processing}
                                    className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Traitement en cours...
                                        </span>
                                    ) : (
                                        '✅ Confirmer la décision'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ========================================
                        HISTORIQUE DES SIGNALEMENTS
                        ======================================== */}
                    {reportHistory && reportHistory.length > 0 && (
                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="mb-4 flex w-full items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-orange-100 p-2">
                                        <Clock className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Historique des signalements (
                                        {reportHistory.length})
                                    </h2>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {showHistory ? '▼' : '▶'}
                                </span>
                            </button>

                            {showHistory && (
                                <div className="space-y-3">
                                    {reportHistory.map((h, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:bg-gray-100"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {getReasonLabel(
                                                            h.reason,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {h.description ||
                                                            'Pas de description'}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(h.status)}`}
                                                >
                                                    {h.status}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">
                                                📅 {formatDate(h.created_at)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================
                        POSTS RÉCENTS (si disponibles)
                        ======================================== */}
                    {recentPosts && recentPosts.length > 0 && (
                        <div className="rounded-xl bg-white p-6 shadow-lg">
                            <button
                                onClick={() => setShowPosts(!showPosts)}
                                className="mb-4 flex w-full items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-green-100 p-2">
                                        <FileText className="h-5 w-5 text-green-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Publications récentes (
                                        {recentPosts.length})
                                    </h2>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {showPosts ? '▼' : '▶'}
                                </span>
                            </button>

                            {showPosts && (
                                <div className="space-y-3">
                                    {recentPosts.map((post, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
                                        >
                                            <p className="text-sm text-slate-900">
                                                {post.content}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-500">
                                                📅 {formatDate(post.created_at)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ModeratorLayout>
    );
}
