import PostCommentDetailModal from '@/components/admin/post-comment-detail-modal';
import ViewPostModal from '@/components/admin/view-post-modal';
import ModeratorLayout from '@/layouts/moderator-layout';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, Eye, Filter, Flag, Trash2 } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user: {
        id: string;
        full_name: string;
        username: string;
        profile_picture: string | null;
    };
    post: {
        id: string;
        content: string;
    };
    reports_count: number;
    // AJOUTER CETTE LIGNE :
    reports?: Array<{
        id: string;
        reason: string;
        description: string | null;
        created_at: string;
        reporter: {
            id: string;
            full_name: string;
            username: string;
        };
    }>;
}

interface PageProps {
    comments: {
        data: Comment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filter: string;
    auth: {
        user: any;
    };
    [key: string]: any;
}

export default function ModeratorComments() {
    // Récupérer les props de la page
    const { comments, filter } = usePage<PageProps>().props;
    // Pour le filtrage des commentaires
    const [selectedFilter, setSelectedFilter] = useState(filter);
    // Pour la sélection en masse
    const [selectedComments, setSelectedComments] = useState<string[]>([]);

    // Pour le modal de détails du commentaire
    const [selectedComment, setSelectedComment] = useState<Comment | null>(
        null,
    );
    const [showModal, setShowModal] = useState(false);

    // Pour la visualisation du post associé
    const [viewPostId, setViewPostId] = useState<string | null>(null);
    const [showViewPostModal, setShowViewPostModal] = useState(false);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    const handleFilterChange = (newFilter: string) => {
        setSelectedFilter(newFilter);
        router.get(
            '/moderator/comments',
            {
                filter: newFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleDeleteComment = (commentId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
            return;
        }

        router.delete(`/moderator/comments/${commentId}`, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Commentaire supprimé avec succès');
            },
            onError: (errors) => {
                alert('Erreur lors de la suppression');
                console.error(errors);
            },
        });
    };

    const handleBulkDelete = () => {
        if (selectedComments.length === 0) {
            alert('Veuillez sélectionner au moins un commentaire');
            return;
        }

        if (!confirm(`Supprimer ${selectedComments.length} commentaire(s) ?`)) {
            return;
        }

        alert('Fonction de suppression en masse à implémenter');
    };

    const toggleCommentSelection = (commentId: string) => {
        setSelectedComments((prev) =>
            prev.includes(commentId)
                ? prev.filter((id) => id !== commentId)
                : [...prev, commentId],
        );
    };

    const handleOpenCommentDetails = (comment: Comment) => {
        setSelectedComment(comment);
        setShowModal(true);
    };

    const handleCommentDeleted = () => {
        setShowModal(false);
        setSelectedComment(null);
        // Rafraîchir la liste
        router.reload({ only: ['comments'] });
    };

    return (
        <ModeratorLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Modération des Commentaires
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {comments.total} commentaire(s) •{' '}
                        {
                            comments.data.filter((c) => c.reports_count > 0)
                                .length
                        }{' '}
                        signalé(s)
                    </p>
                </div>

                <div className="mb-6 rounded-lg bg-white p-4 shadow">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <select
                                value={selectedFilter}
                                onChange={(e) =>
                                    handleFilterChange(e.target.value)
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            >
                                <option value="recent">Plus récents</option>
                                <option value="reported">
                                    Commentaires signalés
                                </option>
                                <option value="today">Aujourd'hui</option>
                                <option value="week">Cette semaine</option>
                            </select>
                        </div>

                        {selectedComments.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                                Supprimer ({selectedComments.length})
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {comments.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow">
                            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-600">
                                Aucun commentaire trouvé
                            </p>
                        </div>
                    ) : (
                        comments.data.map((comment) => (
                            <div
                                key={comment.id}
                                className={`rounded-lg bg-white p-6 shadow transition hover:shadow-md ${
                                    comment.reports_count > 0
                                        ? 'border-l-4 border-red-500'
                                        : ''
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedComments.includes(
                                                comment.id,
                                            )}
                                            onChange={() =>
                                                toggleCommentSelection(
                                                    comment.id,
                                                )
                                            }
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <img
                                        src={
                                            comment.user.profile_picture ||
                                            defaultProfilePicture
                                        }
                                        alt={comment.user.full_name}
                                        className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                defaultProfilePicture;
                                        }}
                                    />

                                    <div className="flex-1">
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {comment.user.full_name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    @{comment.user.username} •{' '}
                                                    {moment(
                                                        comment.created_at,
                                                    ).fromNow()}
                                                </p>
                                            </div>

                                            {comment.reports_count > 0 && (
                                                <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                    <Flag className="h-3 w-3" />
                                                    {comment.reports_count}{' '}
                                                    signalement(s)
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-4 rounded-lg bg-gray-50 p-3">
                                            <p className="mb-2 text-sm font-medium text-gray-600">
                                                Commentaire sur la publication :
                                            </p>
                                            <p className="line-clamp-2 text-sm text-gray-500">
                                                {comment.post.content}
                                            </p>
                                        </div>

                                        <p className="mb-4 whitespace-pre-line text-gray-800">
                                            {comment.content}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleOpenCommentDetails(
                                                        comment,
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-lg border-2 border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Voir détails
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setViewPostId(
                                                        comment.post.id,
                                                    );
                                                    setShowViewPostModal(true);
                                                }}
                                                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Voir le post
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteComment(
                                                        comment.id,
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {comments.last_page > 1 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {Array.from(
                                { length: comments.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() =>
                                        router.get(
                                            `/moderator/comments?page=${page}&filter=${selectedFilter}`,
                                        )
                                    }
                                    className={`rounded-lg px-4 py-2 ${
                                        page === comments.current_page
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal de détails du commentaire */}
                <PostCommentDetailModal
                    post={selectedComment}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onDelete={handleCommentDeleted}
                    type="comment"
                />

                {/* Modal de visualisation du post */}
                <ViewPostModal
                    postId={viewPostId}
                    isOpen={showViewPostModal}
                    onClose={() => {
                        setShowViewPostModal(false);
                        setViewPostId(null);
                    }}
                />
            </div>
        </ModeratorLayout>
    );
}
