import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Heart,
    Loader2,
    MessageCircle,
    MoreHorizontal,
    Repeat2,
    Send,
    Smile,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────
interface PostUser {
    id: string;
    full_name: string;
    username: string;
    profile_picture: string | null;
}
interface PostImage {
    id: string;
    post_id: string;
    image_url: string;
}
interface Comment {
    id: string;
    content: string;
    created_at: string;
    user: PostUser;
    likes_count?: number;
}
interface PostDetail {
    id: string;
    content: string;
    post_type: string;
    created_at: string;
    user: PostUser;
    images: PostImage[];
    likes_count: number;
    comments_count: number;
    shares_count: number;
    is_liked: boolean;
    comments: Comment[];
}
interface PostModalProps {
    postId: string | null;
    onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}j`;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    });
}

function Avatar({
    src,
    name,
    size = 'md',
}: {
    src: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg';
}) {
    const s = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    if (src)
        return (
            <img
                src={src}
                alt={name}
                className={`${s[size]} flex-shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900`}
            />
        );
    return (
        <div
            className={`${s[size]} flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-semibold text-white`}
        >
            {initials}
        </div>
    );
}

function ActionBtn({
    icon,
    label,
    onClick,
    active = false,
    activeClass = 'text-blue-600',
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    active?: boolean;
    activeClass?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 ${active ? activeClass : 'text-zinc-500 dark:text-zinc-400'}`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

function CommentItem({ comment }: { comment: Comment }) {
    return (
        <div className="group flex gap-2.5">
            <Avatar
                src={comment.user.profile_picture}
                name={comment.user.full_name}
                size="sm"
            />
            <div className="min-w-0 flex-1">
                <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2.5 dark:bg-zinc-800">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {comment.user.full_name}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed break-words text-zinc-700 dark:text-zinc-200">
                        {comment.content}
                    </p>
                </div>
                <div className="mt-1 flex items-center gap-3 pl-2">
                    <span className="text-xs text-zinc-400">
                        {timeAgo(comment.created_at)}
                    </span>
                    {(comment.likes_count ?? 0) > 0 && (
                        <span className="text-xs text-zinc-400">
                            {comment.likes_count} j'aime
                        </span>
                    )}
                    <button className="text-xs font-semibold text-zinc-400 opacity-0 transition-all group-hover:opacity-100 hover:text-blue-500">
                        J'aime
                    </button>
                    <button className="text-xs font-semibold text-zinc-400 opacity-0 transition-all group-hover:opacity-100 hover:text-blue-500">
                        Répondre
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────
export default function PostModal({ postId, onClose }: PostModalProps) {
    const { auth } = usePage().props as any;
    const currentUser = auth?.user;

    const [post, setPost] = useState<PostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [imgIndex, setImgIndex] = useState(0);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!postId) return;
        setLoading(true);
        setPost(null);
        setImgIndex(0);
        setExpanded(false);
        axios
            .get(`/api/posts/${postId}/details`)
            .then(({ data }) => {
                setPost(data.post);
                setLiked(data.post.is_liked);
                setLikesCount(data.post.likes_count);
                setComments(data.post.comments || []);
            })
            .finally(() => setLoading(false));
    }, [postId]);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', h);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', h);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node))
                setMenuOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleLike = useCallback(() => {
        if (!post) return;
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
        router.post(
            `/posts/${post.id}/like`,
            {},
            {
                preserveScroll: true,
                onError: () => {
                    setLiked(wasLiked);
                    setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
                },
            },
        );
    }, [post, liked]);

    const handleComment = useCallback(async () => {
        if (!post || !commentText.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await axios.post(`/posts/${post.id}/comments`, {
                content: commentText,
            });
            const newComment: Comment = data.comment ?? {
                id: crypto.randomUUID(),
                content: commentText,
                created_at: new Date().toISOString(),
                user: currentUser,
                likes_count: 0,
            };
            setComments((prev) => [newComment, ...prev]);
            setPost((p) =>
                p ? { ...p, comments_count: p.comments_count + 1 } : p,
            );
            setCommentText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } finally {
            setSubmitting(false);
        }
    }, [post, commentText, currentUser]);

    if (!postId) return null;
    const hasImages = post && post.images.length > 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            style={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(6px)',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row dark:bg-zinc-900"
                style={{ maxHeight: '92vh', minHeight: '440px' }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white shadow-md transition-colors hover:bg-black/75"
                >
                    <X size={15} />
                </button>

                {/* ══ LEFT – Image viewer ══ */}
                {loading ? (
                    <div className="flex min-h-[280px] flex-1 items-center justify-center bg-zinc-950">
                        <Loader2
                            className="animate-spin text-white/40"
                            size={36}
                        />
                    </div>
                ) : hasImages ? (
                    <div className="relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden bg-zinc-950">
                        <img
                            src={post.images[imgIndex].image_url}
                            alt={`Image ${imgIndex + 1}`}
                            className="h-full w-full object-contain"
                            style={{ maxHeight: '92vh' }}
                            draggable={false}
                        />
                        {post.images.length > 1 && (
                            <>
                                <button
                                    onClick={() =>
                                        setImgIndex((i) => Math.max(0, i - 1))
                                    }
                                    disabled={imgIndex === 0}
                                    className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/75 disabled:opacity-20"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() =>
                                        setImgIndex((i) =>
                                            Math.min(
                                                post.images.length - 1,
                                                i + 1,
                                            ),
                                        )
                                    }
                                    disabled={
                                        imgIndex === post.images.length - 1
                                    }
                                    className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/75 disabled:opacity-20"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-3 py-1.5">
                                    {post.images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setImgIndex(i)}
                                            className={`h-1.5 rounded-full bg-white transition-all ${i === imgIndex ? 'w-5 opacity-100' : 'w-1.5 opacity-50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : null}

                {/* ══ RIGHT – Details panel ══ */}
                <div
                    className={`flex flex-col overflow-hidden bg-white dark:bg-zinc-900 ${hasImages ? 'w-full md:w-[400px] md:flex-shrink-0' : 'w-full'}`}
                    style={{ maxHeight: '92vh' }}
                >
                    {loading ? (
                        <div className="flex flex-1 items-center justify-center p-10">
                            <Loader2
                                className="animate-spin text-zinc-300"
                                size={28}
                            />
                        </div>
                    ) : post ? (
                        <>
                            {/* Header */}
                            <div className="flex flex-shrink-0 items-start justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
                                <div className="flex items-start gap-3">
                                    <Avatar
                                        src={post.user.profile_picture}
                                        name={post.user.full_name}
                                        size="lg"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                            {post.user.full_name}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            @{post.user.username}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-1.5">
                                            <span className="text-xs text-zinc-400">
                                                {timeAgo(post.created_at)}
                                            </span>
                                            <span className="text-xs text-zinc-300">
                                                ·
                                            </span>
                                            <span className="text-xs">🌐</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-shrink-0 items-center gap-1.5">
                                    {currentUser?.id !== post.user.id && (
                                        <button className="flex items-center gap-1 rounded-full border-2 border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50">
                                            <UserPlus size={12} /> Suivre
                                        </button>
                                    )}
                                    <div className="relative" ref={menuRef}>
                                        <button
                                            onClick={() =>
                                                setMenuOpen((o) => !o)
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                        {menuOpen && (
                                            <div className="absolute top-9 right-0 z-50 w-44 overflow-hidden rounded-xl border border-zinc-100 bg-white py-1 shadow-2xl dark:border-zinc-700 dark:bg-zinc-800">
                                                {currentUser?.id ===
                                                post.user.id ? (
                                                    <button
                                                        onClick={() => {
                                                            setMenuOpen(false);
                                                            if (
                                                                confirm(
                                                                    'Supprimer cette publication ?',
                                                                )
                                                            )
                                                                router.delete(
                                                                    `/posts/${post.id}`,
                                                                    {
                                                                        onSuccess:
                                                                            onClose,
                                                                    },
                                                                );
                                                        }}
                                                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    >
                                                        <Trash2 size={14} />{' '}
                                                        Supprimer
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setMenuOpen(false);
                                                            router.post(
                                                                `/posts/${post.id}/report`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }}
                                                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
                                                    >
                                                        <Flag size={14} />{' '}
                                                        Signaler
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable content */}
                            <div
                                className="min-h-0 flex-1 overflow-y-auto"
                                style={{ scrollbarWidth: 'thin' }}
                            >
                                <div className="space-y-4 p-4">
                                    {/* Content text */}
                                    {post.content && (
                                        <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-100">
                                            {expanded ||
                                            post.content.length <= 300
                                                ? post.content
                                                : post.content.slice(0, 300)}
                                            {post.content.length > 300 && (
                                                <button
                                                    onClick={() =>
                                                        setExpanded((e) => !e)
                                                    }
                                                    className="ml-1 text-xs font-bold text-blue-500 hover:underline"
                                                >
                                                    {expanded
                                                        ? ' voir moins'
                                                        : ' … voir plus'}
                                                </button>
                                            )}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex -space-x-1">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[10px] dark:border-zinc-900">
                                                    👍
                                                </span>
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] dark:border-zinc-900">
                                                    ❤️
                                                </span>
                                            </div>
                                            <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                                                {likesCount}
                                            </span>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="cursor-pointer hover:underline">
                                                {post.comments_count}{' '}
                                                commentaire
                                                {post.comments_count !== 1
                                                    ? 's'
                                                    : ''}
                                            </span>
                                            <span className="cursor-pointer hover:underline">
                                                {post.shares_count}{' '}
                                                republication
                                                {post.shares_count !== 1
                                                    ? 's'
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center justify-around border-b border-zinc-100 pb-3 dark:border-zinc-800">
                                        <ActionBtn
                                            icon={
                                                <Heart
                                                    size={18}
                                                    className={
                                                        liked
                                                            ? 'fill-red-500 text-red-500'
                                                            : ''
                                                    }
                                                />
                                            }
                                            label="J'aime"
                                            active={liked}
                                            activeClass="text-red-500"
                                            onClick={handleLike}
                                        />
                                        {/* <ActionBtn
                                            icon={<MessageCircle size={18} />}
                                            label="Commenter"
                                            onClick={() =>
                                                textareaRef.current?.focus()
                                            }
                                        /> */}
                                        <ActionBtn
                                            icon={<Repeat2 size={18} />}
                                            label="Republier"
                                            onClick={() =>
                                                router.post(
                                                    `/posts/${post.id}/repost`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        />
                                        <ActionBtn
                                            icon={<Send size={18} />}
                                            label="Envoyer"
                                            onClick={() =>
                                                router.post(
                                                    `/posts/${post.id}/share`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Comments list */}
                                    <div className="space-y-4 pb-2">
                                        {comments.length === 0 ? (
                                            <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-600">
                                                💬 Aucun commentaire. Soyez le
                                                premier !
                                            </p>
                                        ) : (
                                            comments.map((c) => (
                                                <CommentItem
                                                    key={c.id}
                                                    comment={c}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Comment input — pinned bottom */}
                            <div className="flex-shrink-0 border-t border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-end gap-2.5">
                                    <Avatar
                                        src={
                                            currentUser?.profile_picture ?? null
                                        }
                                        name={currentUser?.full_name ?? 'Moi'}
                                        size="sm"
                                    />
                                    <div className="flex flex-1 items-end gap-2 rounded-2xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                                        <textarea
                                            ref={textareaRef}
                                            rows={1}
                                            value={commentText}
                                            onChange={(e) => {
                                                setCommentText(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                                            }}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' &&
                                                    !e.shiftKey
                                                ) {
                                                    e.preventDefault();
                                                    handleComment();
                                                }
                                            }}
                                            placeholder="Ajouter un commentaire..."
                                            className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-zinc-800 placeholder-zinc-400 outline-none dark:text-zinc-200"
                                            style={{
                                                maxHeight: '100px',
                                                overflowY: 'auto',
                                            }}
                                        />
                                        <button className="mb-px flex-shrink-0 text-zinc-400 transition-colors hover:text-yellow-400">
                                            <Smile size={17} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleComment}
                                        disabled={
                                            !commentText.trim() || submitting
                                        }
                                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {submitting ? (
                                            <Loader2
                                                size={15}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Send size={15} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-10 text-sm text-zinc-400">
                            Publication introuvable.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
