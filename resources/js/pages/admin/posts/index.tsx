import PostDetailsModal from '@/components/admin/post-detail-modal';
import AdminLayout from '@/layouts/admin-layout';
import { Filters, PageProps, PaginatedPosts,Post,Stats } from '@/types/post';
import { router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Download,
    Eye,
    Filter,
    Heart,
    MessageCircle,
    Search,
    Share2,
    Trash2,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
export default function Index() {
    const { posts, stats, filters, post_types, auth } = usePage<PageProps>().props;

    // États locaux
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandedStats, setExpandedStats] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showModal, setShowModal] = useState(false);

    // États des filtres
    const [localFilters, setLocalFilters] = useState({
        post_type: filters.post_type || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        sort_by: filters.sort_by || 'created_at',
        sort_order: filters.sort_order || 'desc',
    });

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // ========================================
    // FONCTIONS UTILITAIRES
    // ========================================

    const getEngagementScore = (post: Post) => {
        const total =
            post.likes_count +
            post.comments_count +
            post.shares_count +
            (post.reposts_count || 0);
        const daysOld =
            (new Date().getTime() - new Date(post.created_at).getTime()) /
            (1000 * 60 * 60 * 24);
        return Math.round((total / (daysOld || 1)) * 100) / 100;
    };

    const getEngagementColor = (score: number) => {
        if (score > 10) return 'text-green-600 bg-green-50 border-green-200';
        if (score > 5) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score > 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getPostTypeIcon = (postType: string) => {
        switch (postType) {
            case 'text':
                return '📝';
            case 'image':
                return '🖼️';
            case 'text_with_image':
                return '📸';
            default:
                return '📄';
        }
    };

    // Stats moyennes
    const avgLikesPerPost =
        stats.total_posts > 0
            ? (stats.total_likes / stats.total_posts).toFixed(1)
            : '0';
    const avgCommentsPerPost =
        stats.total_posts > 0
            ? (stats.total_comments / stats.total_posts).toFixed(1)
            : '0';
    const avgSharesPerPost =
        stats.total_posts > 0
            ? (stats.total_shares / stats.total_posts).toFixed(1)
            : '0';
    const totalEngagement =
        stats.total_likes + stats.total_comments + stats.total_shares;
    const avgEngagementPerPost =
        stats.total_posts > 0
            ? (totalEngagement / stats.total_posts).toFixed(1)
            : '0';

    // ========================================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ========================================

    // Recherche
    const handleSearch = () => {
        router.get(
            '/admin/posts',
            { ...localFilters, search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Appliquer les filtres
    const applyFilters = () => {
        router.get(
            '/admin/posts',
            { ...localFilters, search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
        setShowFilters(false);
    };

    // Réinitialiser les filtres
    const resetFilters = () => {
        setLocalFilters({
            post_type: '',
            date_from: '',
            date_to: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setSearchTerm('');
        router.get('/admin/posts', {}, { preserveState: false });
    };

    // Supprimer un post
    const handleDelete = (postId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?'))
            return;

        router.delete(`/admin/posts/${postId}`, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Publication supprimée avec succès');
                setSelectedPosts((prev) => prev.filter((id) => id !== postId));
            },
            onError: () => {
                alert('Échec de la suppression');
            },
        });
    };

    // Suppression en masse
    const handleBulkDelete = () => {
        if (selectedPosts.length === 0) {
            alert('Aucune publication sélectionnée');
            return;
        }

        if (!deleteReason.trim()) {
            alert('Veuillez indiquer une raison');
            return;
        }

        if (!confirm(`Supprimer ${selectedPosts.length} publication(s) ?`))
            return;

        setIsDeleting(true);

        router.post(
            '/admin/posts/bulk-delete',
            {
                post_ids: selectedPosts,
                reason: deleteReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    alert(`${selectedPosts.length} publications supprimées`);
                    setSelectedPosts([]);
                    setDeleteReason('');
                },
                onError: () => {
                    alert('Échec de la suppression en masse');
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            },
        );
    };

    // Sélection
    const toggleSelectPost = (postId: string) => {
        setSelectedPosts((prev) =>
            prev.includes(postId)
                ? prev.filter((id) => id !== postId)
                : [...prev, postId],
        );
    };

    const toggleSelectAll = () => {
        if (selectedPosts.length === posts.data.length) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(posts.data.map((p) => p.id));
        }
    };

    // Export
    const handleExport = () => {
        alert('Export en cours...');
    };

    // ========================================
    // RENDU
    // ========================================
    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestion des Publications
                            </h1>
                            <p className="text-gray-600">
                                Modérer et analyser toutes les publications
                            </p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                        >
                            <Download className="h-5 w-5" />
                            Exporter
                        </button>
                    </div>

                    {/* STATISTIQUES */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Statistiques Globales
                            </h2>
                            <button
                                onClick={() => setExpandedStats(!expandedStats)}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                                {expandedStats ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Réduire
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Voir plus
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase">
                                    Total
                                </p>
                                <p className="mt-1 text-2xl font-bold text-blue-600">
                                    {stats.total_posts.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {stats.posts_today} aujourd'hui
                                </p>
                            </div>

                            <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 p-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase">
                                    Likes
                                </p>
                                <p className="mt-1 text-2xl font-bold text-red-600">
                                    {stats.total_likes.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {avgLikesPerPost}/publication
                                </p>
                            </div>

                            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase">
                                    Commentaires
                                </p>
                                <p className="mt-1 text-2xl font-bold text-purple-600">
                                    {stats.total_comments.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {avgCommentsPerPost}/publication
                                </p>
                            </div>

                            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase">
                                    Partages
                                </p>
                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    {stats.total_shares.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {avgSharesPerPost}/publication
                                </p>
                            </div>

                            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase">
                                    Engagement
                                </p>
                                <p className="mt-1 text-2xl font-bold text-orange-600">
                                    {avgEngagementPerPost}
                                </p>
                                <p className="text-xs text-gray-500">
                                    par publication
                                </p>
                            </div>
                        </div>

                        {expandedStats && (
                            <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 md:grid-cols-4">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-600">
                                        Cette semaine
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {stats.posts_week}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-600">
                                        Ce mois
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {stats.posts_month}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-600">
                                        Publications texte
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {stats.text_posts}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-600">
                                        Publications image
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {stats.image_posts}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RECHERCHE ET FILTRES */}
                    <div className="rounded-lg bg-white p-4 shadow">
                        <div className="space-y-4">
                            {/* Barre de recherche */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Rechercher dans le contenu..."
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                />
                                <button
                                    onClick={handleSearch}
                                    className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 hover:bg-gray-50"
                                >
                                    <Filter className="h-5 w-5" />
                                    Filtres
                                </button>
                            </div>

                            {/* Panneau de filtres */}
                            {showFilters && (
                                <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Type de post */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Type de publication
                                            </label>
                                            <select
                                                value={localFilters.post_type}
                                                onChange={(e) =>
                                                    setLocalFilters({
                                                        ...localFilters,
                                                        post_type:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                            >
                                                <option value="">Tous</option>
                                                {Object.entries(post_types).map(
                                                    ([value, label]) => (
                                                        <option
                                                            key={value}
                                                            value={value}
                                                        >
                                                            {label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        {/* Tri */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Trier par
                                            </label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={localFilters.sort_by}
                                                    onChange={(e) =>
                                                        setLocalFilters({
                                                            ...localFilters,
                                                            sort_by:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                                                >
                                                    <option value="created_at">
                                                        Date de création
                                                    </option>
                                                    <option value="likes_count">
                                                        Likes
                                                    </option>
                                                    <option value="comments_count">
                                                        Commentaires
                                                    </option>
                                                    <option value="shares_count">
                                                        Partages
                                                    </option>
                                                </select>
                                                <select
                                                    value={
                                                        localFilters.sort_order
                                                    }
                                                    onChange={(e) =>
                                                        setLocalFilters({
                                                            ...localFilters,
                                                            sort_order:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="rounded-lg border border-gray-300 px-3 py-2"
                                                >
                                                    <option value="desc">
                                                        Décroissant
                                                    </option>
                                                    <option value="asc">
                                                        Croissant
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Date début */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Date de début
                                            </label>
                                            <input
                                                type="date"
                                                value={localFilters.date_from}
                                                onChange={(e) =>
                                                    setLocalFilters({
                                                        ...localFilters,
                                                        date_from:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                            />
                                        </div>

                                        {/* Date fin */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Date de fin
                                            </label>
                                            <input
                                                type="date"
                                                value={localFilters.date_to}
                                                onChange={(e) =>
                                                    setLocalFilters({
                                                        ...localFilters,
                                                        date_to: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={resetFilters}
                                            className="rounded-lg border-2 border-gray-300 px-4 py-2 hover:bg-gray-100"
                                        >
                                            Réinitialiser
                                        </button>
                                        <button
                                            onClick={applyFilters}
                                            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                                        >
                                            Appliquer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Actions en masse */}
                            {selectedPosts.length > 0 && (
                                <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium text-blue-900">
                                                {selectedPosts.length}{' '}
                                                publication(s) sélectionnée(s)
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedPosts([])}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Désélectionner
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <textarea
                                            placeholder="Raison de la suppression (obligatoire)..."
                                            className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm"
                                            value={deleteReason}
                                            onChange={(e) =>
                                                setDeleteReason(e.target.value)
                                            }
                                            rows={2}
                                        />
                                        <button
                                            onClick={handleBulkDelete}
                                            disabled={
                                                isDeleting ||
                                                !deleteReason.trim()
                                            }
                                            className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {isDeleting
                                                ? 'Suppression...'
                                                : `Supprimer ${selectedPosts.length} publication(s)`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LISTE DES POSTS */}
                    <div className="space-y-4">
                        {posts.data.length > 0 && (
                            <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedPosts.length ===
                                        posts.data.length
                                    }
                                    onChange={toggleSelectAll}
                                    className="h-5 w-5"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {selectedPosts.length > 0
                                        ? `${selectedPosts.length} sélectionné(s)`
                                        : 'Tout sélectionner'}
                                </span>
                            </div>
                        )}

                        {posts.data.map((post) => {
                            const engagementScore = getEngagementScore(post);
                            const isSelected = selectedPosts.includes(post.id);

                            return (
                                <div
                                    key={post.id}
                                    className={`rounded-lg border-2 p-4 shadow transition ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-transparent bg-white'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                                toggleSelectPost(post.id)
                                            }
                                            className="h-5 w-5"
                                        />

                                        <img
                                            src={
                                                post.user.profile_picture ||
                                                defaultProfilePicture
                                            }
                                            alt={post.user.full_name}
                                            className="h-12 w-12 rounded-full object-cover"
                                            onError={(e) =>
                                                (e.currentTarget.src =
                                                    defaultProfilePicture)
                                            }
                                        />

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">
                                                            {
                                                                post.user
                                                                    .full_name
                                                            }
                                                        </p>
                                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                            {post.user
                                                                .account_type ===
                                                            'practitioner'
                                                                ? 'Praticien'
                                                                : 'Utilisateur'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        @{post.user.username} ·{' '}
                                                        {moment(
                                                            post.created_at,
                                                        ).fromNow()}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                    {getPostTypeIcon(
                                                        post.post_type,
                                                    )}{' '}
                                                    {post_types[post.post_type]}
                                                </span>
                                            </div>

                                            <p className="text-gray-800">
                                                {post.content}
                                            </p>

                                            {post.images.length > 0 && (
                                                <div className="flex gap-2">
                                                    {post.images
                                                        .slice(0, 3)
                                                        .map((img) => (
                                                            <img
                                                                key={img.id}
                                                                src={
                                                                    img.image_url
                                                                }
                                                                className="h-16 w-16 rounded object-cover"
                                                                alt="Post"
                                                            />
                                                        ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 border-t pt-3 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Heart className="h-4 w-4 text-red-500" />
                                                    {post.likes_count}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="h-4 w-4 text-blue-500" />
                                                    {post.comments_count}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Share2 className="h-4 w-4 text-green-500" />
                                                    {post.shares_count}
                                                </span>
                                                <span
                                                    className={`ml-auto rounded-full border px-3 py-1 text-xs font-bold ${getEngagementColor(engagementScore)}`}
                                                >
                                                    Score: {engagementScore}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setShowModal(true);
                                                }}
                                                className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                                                title="Voir les détails"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(post.id)
                                                }
                                                className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {posts.data.length === 0 && (
                            <div className="rounded-lg bg-white p-12 text-center shadow">
                                <p className="text-gray-500">
                                    Aucune publication trouvée
                                </p>
                            </div>
                        )}
                    </div>

                    {/* PAGINATION */}
                    {posts.last_page > 1 && (
                        <div className="flex justify-center gap-2">
                            {Array.from(
                                { length: posts.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() =>
                                        router.get('/admin/posts', {
                                            ...localFilters,
                                            search: searchTerm,
                                            page,
                                        })
                                    }
                                    className={`rounded px-4 py-2 ${
                                        page === posts.current_page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE DÉTAILS DU POST */}
            {showModal && selectedPost && (
                <PostDetailsModal
                    post={selectedPost}
                    likedBy={selectedPost.liked_by || []}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                />
            )}
        </AdminLayout>
    );
}
