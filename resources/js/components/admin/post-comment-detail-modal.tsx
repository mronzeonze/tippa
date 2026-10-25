import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    Flag,
    Heart,
    MessageSquare,
    Share2,
    Trash2,
    User,
    X,
    XCircle,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import toast from 'react-hot-toast';

// ========================================
// INTERFACES
// ========================================

interface Report {
    id: string;
    reason: string;
    description: string | null;
    created_at: string;
    reporter: {
        id: string;
        full_name: string;
        username: string;
    };
}

interface PostModalProps {
    post: {
        id: string;
        content: string;
        post_type?: string;
        created_at: string;
        user: {
            id: string;
            full_name: string;
            username: string;
            profile_picture: string | null;
        };
        images?: Array<{
            id: string;
            image_url: string;
        }>;
        liked_by_count?: number;
        comments_count?: number;
        shares_count?: number;
        reports_count?: number;
        reports?: Report[];
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete?: () => void;
    type?: 'post' | 'comment';
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function PostCommentDetailModal({
    post,
    isOpen,
    onClose,
    onDelete,
    type = 'post',
}: PostModalProps) {
    // États
    const [activeTab, setActiveTab] = useState<'details' | 'stats' | 'reports'>(
        'details',
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [showReports, setShowReports] = useState(false);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // ========================================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ========================================

    /**
     * Supprimer la publication/commentaire
     */
    const handleDelete = () => {
        if (
            !confirm(
                `Êtes-vous sûr de vouloir supprimer ce${type === 'post' ? 'tte publication' : ' commentaire'} ?`,
            )
        ) {
            return;
        }

        setIsDeleting(true);

        if (onDelete && post) {
            router.delete(
                type === 'post'
                    ? `/moderator/posts/${post.id}`
                    : `/moderator/comments/${post.id}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            `${type === 'post' ? 'Publication' : 'Commentaire'} supprimé avec succès`,
                        );
                        onClose();
                        if (onDelete) onDelete();
                    },
                    onError: (errors) => {
                        toast.error('Erreur lors de la suppression');
                        console.error(errors);
                    },
                    onFinish: () => {
                        setIsDeleting(false);
                    },
                },
            );
        }
    };

    /**
     * Approuver le contenu (retirer tous les signalements)
     */
    const handleApprove = () => {
        if (!confirm('Approuver ce contenu et retirer tous les signalements ?'))
            return;

        router.post(
            `/moderator/${type === 'post' ? 'posts' : 'comments'}/${post?.id}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Contenu approuvé');
                    onClose();
                },
                onError: () => {
                    toast.error("Erreur lors de l'approbation");
                },
            },
        );
    };

    /**
     * Aller au profil de l'utilisateur
     */
    const handleGoToProfile = () => {
        if (post) {
            router.get(`/profile/${post.user.id}`);
            onClose();
        }
    };

    /**
     * Traduire les raisons de signalement
     */
    const translateReason = (reason: string): string => {
        const translations: Record<string, string> = {
            spam: 'Spam',
            harassment: 'Harcèlement',
            fake_profile: 'Faux profil',
            inappropriate_content: 'Contenu inapproprié',
            violence: 'Violence',
            hate_speech: 'Discours haineux',
            misinformation: 'Désinformation',
            other: 'Autre',
        };
        return translations[reason] || reason;
    };

    if (!isOpen || !post) return null;

    // ========================================
    // RENDU DU COMPOSANT
    // ========================================

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="pointer-events-auto flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">
                                Détails{' '}
                                {type === 'post'
                                    ? 'de la publication'
                                    : 'du commentaire'}
                            </h2>
                            {post.reports_count && post.reports_count > 0 ? (
                                <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                                    <Flag className="h-4 w-4" />
                                    {post.reports_count} signalement
                                    {post.reports_count > 1 ? 's' : ''}
                                </span>
                            ) : null}
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                                activeTab === 'details'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Eye className="mr-2 inline-block h-4 w-4" />
                            Détails
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                                activeTab === 'stats'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Heart className="mr-2 inline-block h-4 w-4" />
                            Statistiques
                        </button>
                        {post.reports_count && post.reports_count > 0 ?(
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                                    activeTab === 'reports'
                                        ? 'border-b-2 border-red-600 text-red-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Flag className="mr-2 inline-block h-4 w-4" />
                                Signalements ({post.reports_count})
                            </button>
                        ) : null}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* ========================================
                            ONGLET DÉTAILS
                            ======================================== */}
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                {/* User Info */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                post.user.profile_picture ||
                                                defaultProfilePicture
                                            }
                                            alt={post.user.full_name}
                                            className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    defaultProfilePicture;
                                            }}
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {post.user.full_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                @{post.user.username}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGoToProfile}
                                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                    >
                                        <User className="h-4 w-4" />
                                        Voir profil
                                    </button>
                                </div>

                                {/* Post Meta */}
                                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                                    {post.post_type && (
                                        <div className="rounded-lg bg-blue-50 p-3">
                                            <p className="text-gray-600">
                                                Type:
                                            </p>
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {post.post_type.replace(
                                                    '_',
                                                    ' + ',
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    <div className="rounded-lg bg-purple-50 p-3">
                                        <p className="text-gray-600">Date:</p>
                                        <p className="font-semibold text-gray-900">
                                            {moment(post.created_at).format(
                                                'DD/MM/YYYY',
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {moment(post.created_at).format(
                                                'HH:mm',
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-3">
                                        <p className="text-gray-600">ID:</p>
                                        <p className="truncate font-mono text-xs text-gray-900">
                                            {post.id}
                                        </p>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <h3 className="mb-2 text-sm font-medium text-gray-700">
                                        Contenu:
                                    </h3>
                                    <p className="whitespace-pre-line text-gray-800">
                                        {post.content}
                                    </p>
                                </div>

                                {/* Images */}
                                {post.images && post.images.length > 0 && (
                                    <div>
                                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                                            Images attachées (
                                            {post.images.length}):
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                            {post.images.map((image) => (
                                                <div
                                                    key={image.id}
                                                    className="group relative"
                                                >
                                                    <img
                                                        src={image.image_url}
                                                        alt="Post image"
                                                        className="h-40 w-full rounded-lg object-cover"
                                                    />
                                                    <a
                                                        href={image.image_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
                                                    >
                                                        <Eye className="h-6 w-6 text-white" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reports Warning */}

                                {post.reports_count &&
                                    post.reports_count > 0 ? (
                                        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                                                <div>
                                                    <p className="font-semibold text-red-800">
                                                        Contenu signalé
                                                    </p>
                                                    <p className="mt-1 text-sm text-red-700">
                                                        Ce contenu a été signalé{' '}
                                                        {post.reports_count}{' '}
                                                        fois par différents
                                                        utilisateurs. Veuillez
                                                        examiner attentivement
                                                        avant de prendre une
                                                        décision.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ): null}
                            </div>
                        )}

                        {/* ========================================
                            ONGLET STATISTIQUES
                            ======================================== */}
                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 text-center transition hover:shadow-lg">
                                        <Heart className="mx-auto mb-2 h-10 w-10 text-red-600" />
                                        <div className="text-4xl font-bold text-red-600">
                                            {post.liked_by_count || 0}
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-gray-600">
                                            J'aime
                                        </p>
                                    </div>
                                    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 text-center transition hover:shadow-lg">
                                        <MessageSquare className="mx-auto mb-2 h-10 w-10 text-blue-600" />
                                        <div className="text-4xl font-bold text-blue-600">
                                            {post.comments_count || 0}
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-gray-600">
                                            Commentaires
                                        </p>
                                    </div>
                                    <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6 text-center transition hover:shadow-lg">
                                        <Share2 className="mx-auto mb-2 h-10 w-10 text-purple-600" />
                                        <div className="text-4xl font-bold text-purple-600">
                                            {post.shares_count || 0}
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-gray-600">
                                            Partages
                                        </p>
                                    </div>
                                </div>

                                {/* Engagement Metrics */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                        Taux d'engagement
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="mb-1 flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Interactions totales
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {(post.liked_by_count ||
                                                        0) +
                                                        (post.comments_count ||
                                                            0) +
                                                        (post.shares_count ||
                                                            0)}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                                    style={{
                                                        width: '100%',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================
                            ONGLET SIGNALEMENTS
                            ======================================== */}
                        {activeTab === 'reports' &&
                            post.reports &&
                            post.reports.length > 0 && (
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-yellow-50 p-4">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                            <p className="font-medium text-yellow-800">
                                                {post.reports.length}{' '}
                                                signalement
                                                {post.reports.length > 1
                                                    ? 's'
                                                    : ''}{' '}
                                                actif
                                                {post.reports.length > 1
                                                    ? 's'
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {post.reports.map((report, index) => (
                                        <div
                                            key={report.id}
                                            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                        >
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-600">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                report.reporter
                                                                    .full_name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            @
                                                            {
                                                                report.reporter
                                                                    .username
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                    {translateReason(
                                                        report.reason,
                                                    )}
                                                </span>
                                            </div>

                                            {report.description && (
                                                <p className="mt-2 rounded bg-gray-50 p-3 text-sm text-gray-700">
                                                    {report.description}
                                                </p>
                                            )}

                                            <p className="mt-2 text-xs text-gray-500">
                                                Signalé{' '}
                                                {moment(
                                                    report.created_at,
                                                ).fromNow()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>

                    {/* Footer - Actions */}
                    <div className="flex flex-col gap-3 border-t bg-gray-50 p-4 sm:flex-row sm:justify-between">
                        <div className="flex gap-2">
                            {post.reports_count && post.reports_count > 0 ? (
                                <button
                                    onClick={handleApprove}
                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Approuver
                                </button>
                            ) : null}
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Supprimer
                                    </>
                                )}
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-white"
                        >
                            <XCircle className="h-4 w-4" />
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
