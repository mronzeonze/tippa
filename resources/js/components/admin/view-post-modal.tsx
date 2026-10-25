import { BadgeCheck, Heart, MessageSquare, Share2, X } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface ViewPostModalProps {
    postId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

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
    images?: Array<{
        id: string;
        image_url: string;
    }>;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    is_liked: boolean;
    comments?: Array<{
        id: string;
        content: string;
        created_at: string;
        user: {
            id: string;
            full_name: string;
            username: string;
            profile_picture: string | null;
        };
        likes_count: number;
        replies?: any[];
    }>;
}

export default function ViewPostModal({
    postId,
    isOpen,
    onClose,
}: ViewPostModalProps) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'post' | 'comments'>('post');

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Charger les détails du post
    useEffect(() => {
        if (isOpen && postId) {
            loadPostDetails();
        }
    }, [isOpen, postId]);

    const loadPostDetails = async () => {
        if (!postId) return;

        setLoading(true);

        try {
            const response = await fetch(`/api/posts/${postId}/details`);
            const data = await response.json();
            setPost(data.post);
        } catch (error) {
            console.error('Erreur lors du chargement du post:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageGridClass = () => {
        const imageCount = post?.images?.length || 0;
        if (imageCount === 0) return '';
        if (imageCount === 1) return 'grid-cols-1';
        if (imageCount === 2) return 'grid-cols-2';
        return 'grid-cols-2';
    };

    if (!isOpen || !postId) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-40 bg-black/60 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="pointer-events-auto flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b p-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Détails de la publication
                        </h2>
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
                            onClick={() => setActiveTab('post')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                                activeTab === 'post'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Publication
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                                activeTab === 'comments'
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Commentaires ({post?.comments_count || 0})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                            </div>
                        ) : post ? (
                            <>
                                {/* Onglet Publication */}
                                {activeTab === 'post' && (
                                    <div className="space-y-4">
                                        {/* Header utilisateur */}
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={
                                                    post.user.profile_picture ||
                                                    defaultProfilePicture
                                                }
                                                alt={post.user.full_name}
                                                className="h-12 w-12 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        defaultProfilePicture;
                                                }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {post.user.full_name}
                                                    </span>
                                                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    @{post.user.username} •{' '}
                                                    {moment(
                                                        post.created_at,
                                                    ).fromNow()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenu */}
                                        {post.content && (
                                            <div className="whitespace-pre-line text-gray-800">
                                                {post.content}
                                            </div>
                                        )}

                                        {/* Images */}
                                        {post.images &&
                                            post.images.length > 0 && (
                                                <div
                                                    className={`grid gap-2 ${getImageGridClass()}`}
                                                >
                                                    {post.images.map(
                                                        (image) => (
                                                            <div
                                                                key={image.id}
                                                                className="overflow-hidden rounded-lg"
                                                            >
                                                                <img
                                                                    src={
                                                                        image.image_url
                                                                    }
                                                                    alt="Post image"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                        {/* Statistiques */}
                                        <div className="flex items-center gap-6 border-t pt-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-5 w-5 text-red-500" />
                                                <span>{post.likes_count}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                                <span>
                                                    {post.comments_count}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Share2 className="h-5 w-5 text-purple-500" />
                                                <span>{post.shares_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Onglet Commentaires */}
                                {activeTab === 'comments' && (
                                    <div className="space-y-4">
                                        {post.comments &&
                                        post.comments.length > 0 ? (
                                            post.comments.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className="rounded-lg border border-gray-200 p-4"
                                                >
                                                    <div className="mb-2 flex items-start gap-3">
                                                        <img
                                                            src={
                                                                comment.user
                                                                    .profile_picture ||
                                                                defaultProfilePicture
                                                            }
                                                            alt={
                                                                comment.user
                                                                    .full_name
                                                            }
                                                            className="h-8 w-8 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    defaultProfilePicture;
                                                            }}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-gray-900">
                                                                {
                                                                    comment.user
                                                                        .full_name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                @
                                                                {
                                                                    comment.user
                                                                        .username
                                                                }{' '}
                                                                •{' '}
                                                                {moment(
                                                                    comment.created_at,
                                                                ).fromNow()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-800">
                                                        {comment.content}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                        <Heart className="h-3 w-3" />
                                                        {comment.likes_count ||
                                                            0}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-gray-500">
                                                Aucun commentaire
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                Publication introuvable
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t p-4">
                        <button
                            onClick={onClose}
                            className="w-full rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
