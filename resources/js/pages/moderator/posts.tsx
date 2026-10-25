import PostCommentDetailModal from '@/components/admin/post-comment-detail-modal';
import ModeratorLayout from '@/layouts/moderator-layout';
import { router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Eye,
    Filter,
    Flag,
    Heart,
    MessageSquare,
    Search,
    Share2,
    Trash2,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

interface Post {
    id: string;
    content: string;
    post_type: string;
    created_at: string;
    user: {
        id: string;
        full_name: string;
        username: string;
        profile_picture: string | null;
    };
    images: Array<{
        id: string;
        image_url: string;
    }>;
    liked_by_count: number;
    comments_count: number;
    shares_count: number;
    reports_count: number;
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
    posts: {
        data: Post[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        filter: string;
        search: string;
    };
    auth: {
        user: any;
    };
    [key: string]: any;
}

export default function ModeratorPosts() {
    const { posts, filters } = usePage<PageProps>().props;

    const [selectedFilter, setSelectedFilter] = useState(filters.filter);
    const [searchQuery, setSearchQuery] = useState(filters.search);
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showModal, setShowModal] = useState(false);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    const handleFilterChange = (newFilter: string) => {
        setSelectedFilter(newFilter);
        router.get(
            '/moderator/posts',
            {
                filter: newFilter,
                search: searchQuery,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSearchSubmit = () => {
        router.get(
            '/moderator/posts',
            {
                filter: selectedFilter,
                search: searchQuery,
            },
            {
                preserveState: true,
                preserveScroll: false,
            },
        );
    };

    const handleDeletePost = (postId: string) => {
        if (
            !confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')
        ) {
            return;
        }

        router.delete(`/moderator/posts/${postId}`, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Publication supprimée avec succès');
            },
            onError: (errors) => {
                alert('Erreur lors de la suppression');
                console.error(errors);
            },
        });
    };

    const handleBulkDelete = () => {
        if (selectedPosts.length === 0) {
            alert('Veuillez sélectionner au moins une publication');
            return;
        }

        if (!confirm(`Supprimer ${selectedPosts.length} publication(s) ?`)) {
            return;
        }

        alert('Fonction de suppression en masse à implémenter');
    };

    const togglePostSelection = (postId: string) => {
        setSelectedPosts((prev) =>
            prev.includes(postId)
                ? prev.filter((id) => id !== postId)
                : [...prev, postId],
        );
    };

    const handlePostDeleted = () => {
        setShowModal(false);
        setSelectedPost(null);
        // Rafraîchir la liste
        router.reload({ only: ['posts'] });
    };

    return (
        <ModeratorLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Modération des Publications
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {posts.total} publication(s) •{' '}
                        {posts.data.filter((p) => p.reports_count > 0).length}{' '}
                        signalée(s)
                    </p>
                </div>

                <div className="mb-6 rounded-lg bg-white p-4 shadow">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        handleSearchSubmit()
                                    }
                                    placeholder="Rechercher dans le contenu..."
                                    className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <select
                                value={selectedFilter}
                                onChange={(e) =>
                                    handleFilterChange(e.target.value)
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            >
                                <option value="all">
                                    Toutes les publications
                                </option>
                                <option value="reported">
                                    Publications signalées
                                </option>
                                <option value="today">Aujourd'hui</option>
                                <option value="week">Cette semaine</option>
                            </select>
                        </div>

                        {selectedPosts.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                                Supprimer ({selectedPosts.length})
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {posts.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow">
                            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-600">
                                Aucune publication trouvée
                            </p>
                        </div>
                    ) : (
                        posts.data.map((post) => (
                            <div
                                key={post.id}
                                className={`rounded-lg bg-white p-6 shadow transition hover:shadow-md ${
                                    post.reports_count > 0
                                        ? 'border-l-4 border-red-500'
                                        : ''
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedPosts.includes(
                                                post.id,
                                            )}
                                            onChange={() =>
                                                togglePostSelection(post.id)
                                            }
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <img
                                        src={
                                            post.user.profile_picture ||
                                            defaultProfilePicture
                                        }
                                        alt={post.user.full_name}
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
                                                    {post.user.full_name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    @{post.user.username} •{' '}
                                                    {moment(
                                                        post.created_at,
                                                    ).fromNow()}
                                                </p>
                                            </div>

                                            {post.reports_count > 0 && (
                                                <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                    <Flag className="h-3 w-3" />
                                                    {post.reports_count}{' '}
                                                    signalement(s)
                                                </span>
                                            )}
                                        </div>

                                        <p className="mb-4 whitespace-pre-line text-gray-800">
                                            {post.content}
                                        </p>

                                        {post.images &&
                                            post.images.length > 0 && (
                                                <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                                                    {post.images
                                                        .slice(0, 3)
                                                        .map((image) => (
                                                            <img
                                                                key={image.id}
                                                                src={
                                                                    image.image_url
                                                                }
                                                                alt="Post image"
                                                                className="h-32 w-full rounded-lg object-cover"
                                                            />
                                                        ))}
                                                    {post.images.length > 3 && (
                                                        <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                +
                                                                {post.images
                                                                    .length -
                                                                    3}{' '}
                                                                autres
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        <div className="mb-4 flex items-center gap-6 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-4 w-4" />
                                                <span>
                                                    {post.liked_by_count}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>
                                                    {post.comments_count}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Share2 className="h-4 w-4" />
                                                <span>{post.shares_count}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setShowModal(true);
                                                }}
                                                className="flex items-center gap-2 rounded-lg border-2 border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Voir détails
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeletePost(post.id)
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

                {posts.last_page > 1 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {Array.from(
                                { length: posts.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() =>
                                        router.get(
                                            `/moderator/posts?page=${page}`,
                                        )
                                    }
                                    className={`rounded-lg px-4 py-2 ${
                                        page === posts.current_page
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
                <PostCommentDetailModal
                    post={selectedPost}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onDelete={handlePostDeleted}
                    type="post"
                />
            </div>
        </ModeratorLayout>
    );
}
