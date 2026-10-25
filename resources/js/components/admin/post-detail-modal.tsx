import { Comment } from '@/types/comment';
import { Post, Share } from '@/types/post';
import { User } from '@/types/user';
import { router } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    Heart,
    MessageCircle,
    Share2,
    Trash2,
    UserRound,
    X,
} from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// ========================================
// INTERFACES
// ========================================
// interface PostImage {
//     id: string;
//     image_url: string;
// }

// interface PostUser {
//     id: string;
//     full_name: string;
//     username: string;
//     profile_picture: string;
//     email: string;
//     account_type: 'user' | 'practitioner' | 'expert';
// }

// interface Comment {
//     id: string;
//     content: string;
//     created_at: string;
//     user: {
//         id: string;
//         full_name: string;
//         username: string;
//         profile_picture: string;
//     };
// }

// interface Share {
//     id: string;
//     share_type: string;
//     content?: string;
//     created_at: string;
//     user: {
//         id: string;
//         full_name: string;
//         username: string;
//         profile_picture: string;
//     };
// }

// interface LikedUser {
//     id: string;
//     full_name: string;
//     username: string;
//     profile_picture: string;
// }



interface PostDetailModalProps {
    post: Post | null;
    likedBy: User[];
    isOpen: boolean;
    onClose: () => void;
    onDelete?: (postId: string) => void;
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
export default function PostDetailModal({
    post,
    likedBy,
    isOpen,
    onClose,
    onDelete,
}: PostDetailModalProps) {
    const [activeTab, setActiveTab] = useState<
        'details' | 'likes' | 'comments' | 'shares'
    >('details');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // États pour les données chargées dynamiquement
    const [comments, setComments] = useState<Comment[]>([]);
    const [shares, setShares] = useState<Share[]>([]);
    const [likes, setLikes] = useState<User[]>(likedBy || []);

    // États de chargement par onglet
    const [loadingLikes, setLoadingLikes] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [loadingShares, setLoadingShares] = useState(false);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Charger les données selon l'onglet actif
    useEffect(() => {
        if (!isOpen || !post) return;

        // Initialiser les likes dès l'ouverture
        if (likedBy && likedBy.length > 0 && likes.length === 0) {
            setLoadingLikes(true);
            setLikes(likedBy);
        }

        if (activeTab === 'comments' && comments.length === 0) {
            loadComments();
        } else if (activeTab === 'shares' && shares.length === 0) {
            loadShares();
        }
    }, [activeTab, isOpen, post]);

    // Fonction pour charger les commentaires
    const loadComments = async () => {
        if (!post) return;

        setLoadingComments(true);

        try {
            const response = await fetch(`/posts/${post.id}/comments`);
            const data = await response.json();

            if (data.comments) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Erreur chargement commentaires:', error);
            toast.error('Échec du chargement des commentaires');
        } finally {
            setLoadingComments(false);
        }
    };

    // Fonction pour charger les partages via route admin
    const loadShares = () => {
        if (!post) return;

        setLoadingShares(true);

        // Utiliser fetch pour récupérer les partages
        fetch(`/admin/posts/${post.id}/shares`)
            .then((response) => response.json())
            .then((data) => {
                if (data.shares) {
                    setShares(data.shares);
                }
            })
            .catch((error) => {
                console.error('Erreur chargement partages:', error);
                // Ne pas afficher d'erreur si l'endpoint n'existe pas encore
            })
            .finally(() => {
                setLoadingShares(false);
            });
    };

    if (!isOpen || !post) return null;

    // Calculer le score d'engagement
    const totalEngagement =
        post.likes_count + post.comments_count + post.shares_count;
    const daysOld =
        (new Date().getTime() - new Date(post.created_at).getTime()) /
        (1000 * 60 * 60 * 24);
    const engagementScore =
        Math.round((totalEngagement / (daysOld || 1)) * 100) / 100;

    // Gérer la suppression
    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
            if (onDelete) {
                onDelete(post.id);
            } else {
                router.delete(`/admin/posts/${post.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Publication supprimée avec succès');
                        onClose();
                    },
                    onError: () => {
                        toast.error('Échec de la suppression');
                    },
                });
            }
        }
    };

    // Fonction pour naviguer vers un profil utilisateur
    const goToProfile = (userId: string) => {
        router.get(`/admin/users/${userId}`);
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-transparent transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-opacity-10 fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 transition-opacity">
                <div
                    className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Détails de la publication
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                                title="Supprimer"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="rounded-lg bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b bg-gray-50">
                        {[
                            { id: 'details', label: 'Détails', count: null },
                            {
                                id: 'likes',
                                label: 'Likes',
                                count: post.likes_count,
                            },
                            {
                                id: 'comments',
                                label: 'Commentaires',
                                count: post.comments_count,
                            },
                            {
                                id: 'shares',
                                label: 'Partages',
                                count: post.shares_count,
                            },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-blue-600 bg-white text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                                {tab.count !== null && (
                                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="max-h-[calc(90vh-160px)] overflow-y-auto p-6">
                        {/* ONGLET DÉTAILS */}
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                {/* Auteur */}
                                <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <img
                                        src={
                                            post.user.profile_picture ||
                                            defaultProfilePicture
                                        }
                                        alt={post.user.full_name}
                                        className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200"
                                        onError={(e) =>
                                            (e.currentTarget.src =
                                                defaultProfilePicture)
                                        }
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {post.user.full_name}
                                            </h3>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    post.user.account_type ===
                                                    'practitioner'
                                                        ? 'bg-green-100 text-green-800'
                                                        : post.user
                                                                .account_type ===
                                                            'expert'
                                                          ? 'bg-purple-100 text-purple-800'
                                                          : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {post.user.account_type ===
                                                'practitioner'
                                                    ? '🩺 Praticien'
                                                    : post.user.account_type ===
                                                        'expert'
                                                      ? '⭐ Expert'
                                                      : '👤 Utilisateur'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            @{post.user.username}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {post.user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            goToProfile(post.user.id)
                                        }
                                        className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-200"
                                    >
                                        <UserRound className="mr-1 inline h-4 w-4" />
                                        Voir profil
                                    </button>
                                </div>

                                {/* Contenu */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-700 uppercase">
                                        📝 Contenu de la publication
                                    </h4>
                                    {post.content ? (
                                        <p className="leading-relaxed whitespace-pre-line text-gray-800">
                                            {post.content}
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 italic">
                                            Aucun contenu textuel
                                        </p>
                                    )}
                                </div>

                                {/* Images */}
                                {post.images && post.images.length > 0 && (
                                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                                        <h4 className="mb-3 text-sm font-semibold text-gray-700 uppercase">
                                            🖼️ Images ({post.images.length})
                                        </h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {post.images.map((img) => (
                                                <div
                                                    key={img.id}
                                                    className="group relative"
                                                >
                                                    <img
                                                        src={img.image_url}
                                                        alt="Post"
                                                        className="h-32 w-full cursor-pointer rounded-lg object-cover transition hover:opacity-80"
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                img.image_url,
                                                            )
                                                        }
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition group-hover:opacity-100">
                                                        <Eye className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Statistiques d'engagement */}
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="rounded-lg border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 text-center">
                                        <Heart className="mx-auto mb-2 h-8 w-8 text-red-500" />
                                        <p className="text-3xl font-bold text-red-600">
                                            {post.likes_count}
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-gray-600">
                                            J'aime
                                        </p>
                                    </div>
                                    <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center">
                                        <MessageCircle className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                                        <p className="text-3xl font-bold text-blue-600">
                                            {post.comments_count}
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-gray-600">
                                            Commentaires
                                        </p>
                                    </div>
                                    <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 text-center">
                                        <Share2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                                        <p className="text-3xl font-bold text-green-600">
                                            {post.shares_count}
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-gray-600">
                                            Partages
                                        </p>
                                    </div>
                                    <div className="rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-4 text-center">
                                        <Eye className="mx-auto mb-2 h-8 w-8 text-orange-500" />
                                        <p className="text-3xl font-bold text-orange-600">
                                            {engagementScore}
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-gray-600">
                                            Score d'engagement
                                        </p>
                                    </div>
                                </div>

                                {/* Métadonnées */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <h4 className="mb-3 text-sm font-semibold text-gray-700 uppercase">
                                        ℹ️ Informations
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-gray-600">
                                                Créé le :
                                            </span>
                                            <span className="font-medium">
                                                {moment(post.created_at).format(
                                                    'DD/MM/YYYY à HH:mm',
                                                )}
                                            </span>
                                            <span className="text-gray-400">
                                                (
                                                {moment(
                                                    post.created_at,
                                                ).fromNow()}
                                                )
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">
                                                Type :
                                            </span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    post.post_type === 'text'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : post.post_type ===
                                                            'image'
                                                          ? 'bg-purple-100 text-purple-800'
                                                          : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {post.post_type === 'text'
                                                    ? '📝 Texte seul'
                                                    : post.post_type === 'image'
                                                      ? '🖼️ Image seule'
                                                      : '📸 Texte + Image'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">
                                                ID :
                                            </span>
                                            <code className="rounded bg-gray-200 px-2 py-1 font-mono text-xs">
                                                {post.id}
                                            </code>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">
                                                Engagement total :
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {totalEngagement} interactions
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ONGLET LIKES */}
                        {activeTab === 'likes' && (
                            <div className="space-y-3">
                                {loadingLikes ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                                    </div>
                                ) : likes.length > 0 ? (
                                    likes.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:bg-gray-50"
                                            onClick={() => goToProfile(user.id)}
                                        >
                                            <img
                                                src={
                                                    user.profile_picture ||
                                                    defaultProfilePicture
                                                }
                                                alt={user.full_name}
                                                className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                                                onError={(e) =>
                                                    (e.currentTarget.src =
                                                        defaultProfilePicture)
                                                }
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {user.full_name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    @{user.username}
                                                </p>
                                            </div>
                                            <Heart className="h-6 w-6 fill-red-500 text-red-500" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <Heart className="mx-auto mb-3 h-16 w-16 text-gray-300" />
                                        <p className="font-medium text-gray-500">
                                            Aucun j'aime pour le moment
                                        </p>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Cette publication n'a pas encore
                                            reçu de likes
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ONGLET COMMENTAIRES */}
                        {activeTab === 'comments' && (
                            <div className="space-y-3">
                                {loadingComments ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                                    </div>
                                ) : comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md"
                                        >
                                            <div className="mb-3 flex items-center gap-3">
                                                <img
                                                    src={
                                                        comment.user
                                                            .profile_picture ||
                                                        defaultProfilePicture
                                                    }
                                                    alt={comment.user.full_name}
                                                    className="h-10 w-10 cursor-pointer rounded-full object-cover"
                                                    onClick={() =>
                                                        goToProfile(
                                                            comment.user.id,
                                                        )
                                                    }
                                                    onError={(e) =>
                                                        (e.currentTarget.src =
                                                            defaultProfilePicture)
                                                    }
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {comment.user.full_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {moment(
                                                            comment.created_at,
                                                        ).fromNow()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="pl-13 text-sm leading-relaxed text-gray-700">
                                                {comment.content}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <MessageCircle className="mx-auto mb-3 h-16 w-16 text-gray-300" />
                                        <p className="font-medium text-gray-500">
                                            Aucun commentaire
                                        </p>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Soyez le premier à commenter cette
                                            publication
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ONGLET PARTAGES */}
                        {activeTab === 'shares' && (
                            <div className="space-y-3">
                                {loadingShares ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
                                    </div>
                                ) : shares.length > 0 ? (
                                    shares.map((share) => (
                                        <div
                                            key={share.id}
                                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md"
                                        >
                                            <img
                                                src={
                                                    share.user
                                                        .profile_picture ||
                                                    defaultProfilePicture
                                                }
                                                alt={share.user.full_name}
                                                className="h-12 w-12 cursor-pointer rounded-full object-cover"
                                                onClick={() =>
                                                    goToProfile(share.user.id)
                                                }
                                                onError={(e) =>
                                                    (e.currentTarget.src =
                                                        defaultProfilePicture)
                                                }
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {share.user.full_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {moment(
                                                        share.created_at,
                                                    ).fromNow()}{' '}
                                                    via{' '}
                                                    <span className="font-medium capitalize">
                                                        {share.share_type}
                                                    </span>
                                                </p>
                                                {share.content && (
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {share.content}
                                                    </p>
                                                )}
                                            </div>
                                            <Share2 className="h-6 w-6 text-green-500" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <Share2 className="mx-auto mb-3 h-16 w-16 text-gray-300" />
                                        <p className="font-medium text-gray-500">
                                            Aucun partage
                                        </p>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Cette publication n'a pas encore été
                                            partagée
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Visionneuse d'image en plein écran */}
            {selectedImage && (
                <div
                    className="bg-opacity-95 fixed inset-0 z-[60] flex items-center justify-center bg-black p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 rounded-full bg-white p-2 text-gray-900 transition hover:bg-gray-200"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
