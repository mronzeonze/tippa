import { Comment, CommentsModalProps, PageProps, Reply } from '@/types/comment';
import { router, usePage } from '@inertiajs/react';
import {
    Flag,
    Heart,
    MessageCircle,
    MoreVertical,
    Send,
    Trash2,
    X,
} from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ReportModal from './report-modal';

/**
 * Composant CommentsModal
 * Affiche un modal avec les commentaires d'un post et permet d'ajouter/supprimer/liker des commentaires
 */
export default function CommentsModal({
    postId,
    isOpen,
    onClose,
    initialCount,
    onCommentsUpdate,
}: CommentsModalProps) {
    const {
        auth,
        comments: pageComments,
        commentsCount: pageCommentsCount,
    } = usePage<PageProps>().props;

    const currentUser = auth.user;

    // États locaux
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsCount, setCommentsCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(
        null,
    );

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Réinitialiser le modal quand il se ferme
    useEffect(() => {
        if (!isOpen) {
            setComments([]);
            setNewComment('');
            setReplyingToId(null);
            setReplyContent('');
            setShowOptionsFor(null);
            setSubmitting(false);
            setLoading(false);
        }
    }, [isOpen]);

    // Charger les commentaires depuis les props Inertia ou via fetch
    useEffect(() => {
        if (isOpen) {
            if (pageComments && pageCommentsCount !== undefined) {
                setComments(pageComments);
                setCommentsCount(pageCommentsCount);
                if (onCommentsUpdate) {
                    onCommentsUpdate(pageCommentsCount);
                }
            } else {
                loadComments();
            }
        }
    }, [isOpen, pageComments, pageCommentsCount]);

    // Charger les commentaires via fetch
    const loadComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/posts/${postId}/comments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector<HTMLMetaElement>(
                            'meta[name="csrf-token"]',
                        )?.content || '',
                },
                credentials: 'include',
            });

            if (!response.ok)
                throw new Error('Erreur lors du chargement des commentaires');

            const data = await response.json();
            setComments(data.comments || []);
            setCommentsCount(data.commentsCount || 0);

            if (onCommentsUpdate) {
                onCommentsUpdate(data.commentsCount || 0);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            toast.error('Erreur lors du chargement des commentaires');
        } finally {
            setLoading(false);
        }
    };

    // Ajouter un commentaire principal
    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        router.post(
            `/posts/${postId}/comments`,
            { content: newComment.trim() },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setNewComment('');
                    loadComments();
                    setSubmitting(false);
                    toast.success('Commentaire ajouté avec succès');
                },
                onError: (errors) => {
                    toast.error("Erreur lors de l'ajout du commentaire");
                    console.error(errors);
                    setSubmitting(false);
                },
            },
        );
    };

    // Ajouter une réponse
    const handleAddReply = (e: React.FormEvent, parentId: string) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmitting(true);
        router.post(
            `/posts/${postId}/comments`,
            {
                content: replyContent.trim(),
                parent_id: parentId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setReplyContent('');
                    setReplyingToId(null);
                    loadComments();
                    setSubmitting(false);
                    toast.success('Réponse ajoutée avec succès');
                },
                onError: (errors) => {
                    toast.error("Erreur lors de l'ajout de la réponse");
                    console.error(errors);
                    setSubmitting(false);
                },
            },
        );
    };

    // Liker un commentaire
    const handleLikeComment = (commentId: string) => {
        router.post(
            `/comments/${commentId}/like`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => loadComments(),
                onError: (errors) => {
                    toast.error('Erreur lors du like');
                    console.error(errors);
                },
            },
        );
    };

    // Supprimer un commentaire
    const handleDeleteComment = (commentId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?'))
            return;

        router.delete(`/comments/${commentId}`, {
            preserveScroll: true,
            onSuccess: () => {
                loadComments();
                toast.success('Commentaire supprimé avec succès');
                setShowOptionsFor(null);
            },
            onError: (errors) => {
                toast.error('Erreur lors de la suppression');
                console.error(errors);
            },
        });
    };

    // Démarrer une réponse
    const startReply = (itemId: string, username: string) => {
        setReplyingToId(itemId);
        setReplyContent('');
    };

    // Annuler une réponse
    const cancelReply = () => {
        setReplyingToId(null);
        setReplyContent('');
    };

    /**
     * Composant récursif pour afficher un commentaire et ses réponses
     */
    const CommentItem = ({
        comment,
        level = 0,
        parentId = null,
    }: {
        comment: Reply | Comment;
        level?: number;
        parentId?: string | null;
    }) => {
        const itemId = comment.id;
        const replyParentId = parentId || comment.id;
        const isReply = level > 0;

        // Vérifier si l'utilisateur peut supprimer ce commentaire
        const canDelete = currentUser.id === comment.user.id;
        // Vérifier si l'utilisateur peut signaler ce commentaire
        const canReport = currentUser.id !== comment.user.id;

        return (
            <div className="space-y-3">
                <div className="flex space-x-3">
                    {/* Photo de profil */}
                    <img
                        src={
                            comment.user.profile_picture ||
                            defaultProfilePicture
                        }
                        alt={comment.user.full_name}
                        className={`${isReply ? 'h-8 w-8' : 'h-10 w-10'} flex-shrink-0 rounded-full object-cover`}
                        onError={(e) => {
                            e.currentTarget.src = defaultProfilePicture;
                        }}
                    />
                    <div className="min-w-0 flex-1">
                        {/* Bulle de commentaire */}
                        <div
                            className={`rounded-lg ${isReply ? 'bg-gray-50' : 'bg-gray-100'} relative p-3`}
                        >
                            <div className="mb-1 flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                    <span
                                        className={`font-semibold text-gray-900 ${isReply ? 'text-sm' : ''}`}
                                    >
                                        {comment.user.full_name}
                                    </span>
                                    <span
                                        className={`ml-2 text-gray-500 ${isReply ? 'text-xs' : 'text-sm'}`}
                                    >
                                        @{comment.user.username}
                                    </span>
                                </div>

                                {/* Bouton Menu (3 points) - Affiché uniquement si l'utilisateur peut supprimer OU signaler */}
                                {(canDelete || canReport) && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowOptionsFor(
                                                    showOptionsFor ===
                                                        comment.id
                                                        ? null
                                                        : comment.id,
                                                );
                                            }}
                                            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                                            title="Plus d'options"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>

                                        {/* Menu déroulant */}
                                        {showOptionsFor === comment.id && (
                                            <>
                                                {/* Overlay invisible pour fermer le menu */}
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() =>
                                                        setShowOptionsFor(null)
                                                    }
                                                />

                                                {/* Menu des options */}
                                                <div className="absolute top-full right-0 z-20 mt-1 w-48 rounded-lg border bg-white shadow-lg">
                                                    {/* Bouton Signaler (pour tous sauf l'auteur) */}
                                                    {canReport && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setReportingCommentId(
                                                                    comment.id,
                                                                );
                                                                setShowOptionsFor(
                                                                    null,
                                                                );
                                                            }}
                                                            className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-orange-600 transition hover:bg-orange-50"
                                                        >
                                                            <Flag className="h-4 w-4" />
                                                            <span>
                                                                Signaler
                                                            </span>
                                                        </button>
                                                    )}

                                                    {/* Bouton Supprimer (seulement pour l'auteur) */}
                                                    {canDelete && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteComment(
                                                                    comment.id,
                                                                );
                                                            }}
                                                            className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>
                                                                Supprimer
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Contenu du commentaire */}
                            <p
                                className={`break-words whitespace-pre-wrap text-gray-800 ${isReply ? 'text-sm' : 'text-sm'}`}
                            >
                                {comment.content}
                            </p>
                        </div>

                        {/* Actions du commentaire */}
                        <div
                            className={`mt-1 flex items-center space-x-4 text-gray-500 ${isReply ? 'text-xs' : 'text-sm'}`}
                        >
                            <span className="font-medium">
                                {moment(comment.created_at).fromNow()}
                            </span>

                            {/* Bouton Like */}
                            <button
                                onClick={() => handleLikeComment(comment.id)}
                                className="flex items-center space-x-1 font-medium transition hover:text-red-500"
                            >
                                <Heart
                                    className={`${isReply ? 'h-3 w-3' : 'h-4 w-4'} ${
                                        comment.is_liked
                                            ? 'fill-red-500 text-red-500'
                                            : ''
                                    }`}
                                />
                                {comment.likes_count > 0 && (
                                    <span>{comment.likes_count}</span>
                                )}
                                <span
                                    className={!comment.is_liked ? 'ml-1' : ''}
                                >
                                    {comment.is_liked ? 'Aimé' : 'Aimer'}
                                </span>
                            </button>

                            {/* Bouton Répondre */}
                            <button
                                onClick={() =>
                                    startReply(itemId, comment.user.username)
                                }
                                className="font-medium transition hover:text-blue-500"
                            >
                                Répondre
                            </button>
                        </div>

                        {/* Formulaire de réponse */}
                        {replyingToId === itemId && (
                            <form
                                onSubmit={(e) =>
                                    handleAddReply(e, replyParentId)
                                }
                                className="mt-3 flex space-x-2"
                            >
                                <img
                                    src={
                                        currentUser.profile_picture ||
                                        defaultProfilePicture
                                    }
                                    alt={currentUser.full_name}
                                    className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            defaultProfilePicture;
                                    }}
                                />
                                <div className="flex flex-1 space-x-2">
                                    <input
                                        type="text"
                                        value={replyContent}
                                        onChange={(e) =>
                                            setReplyContent(e.target.value)
                                        }
                                        placeholder={`Répondre à @${comment.user.username}...`}
                                        className="flex-1 rounded-full border border-blue-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        disabled={submitting}
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            submitting || !replyContent.trim()
                                        }
                                        className="flex-shrink-0 rounded-full bg-blue-500 p-2 text-white transition hover:bg-blue-600 disabled:opacity-50"
                                        title="Envoyer"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelReply}
                                        className="flex-shrink-0 rounded-full bg-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-300"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Réponses récursives */}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        level={level + 1}
                                        parentId={replyParentId}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-transparent transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-opacity-10 pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 transition-opacity">
                <div
                    className="pointer-events-auto flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* En-tête */}
                    <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="h-5 w-5 text-blue-500" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Commentaires
                            </h2>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-600">
                                {commentsCount}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Liste des commentaires */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="relative">
                                    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500" />
                                    <MessageCircle className="absolute inset-0 m-auto h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <div className="mb-4 rounded-full bg-gray-100 p-6">
                                    <MessageCircle className="h-12 w-12 text-gray-400" />
                                </div>
                                <p className="mb-1 text-lg font-medium text-gray-700">
                                    Aucun commentaire pour le moment
                                </p>
                                <p className="text-sm text-gray-500">
                                    Soyez le premier à partager votre avis !
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        level={0}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Formulaire d'ajout de commentaire */}
                    <div className="border-t bg-white p-4">
                        <form
                            onSubmit={handleAddComment}
                            className="flex space-x-3"
                        >
                            <img
                                src={
                                    currentUser.profile_picture ||
                                    defaultProfilePicture
                                }
                                alt={currentUser.full_name}
                                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = defaultProfilePicture;
                                }}
                            />
                            <div className="flex flex-1 space-x-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    placeholder="Écrire un commentaire..."
                                    className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    disabled={submitting}
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="flex-shrink-0 rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <span className="flex items-center space-x-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Envoi...</span>
                                        </span>
                                    ) : (
                                        'Publier'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal de signalement */}
            {reportingCommentId && (
                <ReportModal
                    isOpen={true}
                    onClose={() => setReportingCommentId(null)}
                    contentType="comment"
                    contentId={reportingCommentId}
                    contentAuthor={
                        comments.find((c) => c.id === reportingCommentId)?.user
                            .full_name
                    }
                />
            )}
        </>
    );
}
