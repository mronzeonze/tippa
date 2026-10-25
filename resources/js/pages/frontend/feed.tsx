// Import des composants
import PostCard from '@/components/front/post-card';
import PostModal from '@/components/front/post-modal';
import RepostCard from '@/components/front/repost-card';
import StoriesBar from '@/components/front/stories-bar';
import Loading from '@/components/loading';
import AppLayout from '@/layouts/app-layout';
import type { PageProps, Post } from '@/types/post';
import { router, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────
// Composant principal — Feed
// ─────────────────────────────────────────────────────────────────
export default function Feed() {
    const { posts: initialPosts, auth } = usePage<PageProps>().props;

    // États du feed
    const [feeds, setFeeds] = useState<Post[]>(initialPosts?.data || []);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingPrevious, setLoadingPrevious] = useState(false);
    const [currentPage, setCurrentPage] = useState(
        initialPosts?.current_page || 1,
    );
    const [firstLoadedPage, setFirstLoadedPage] = useState(
        initialPosts?.current_page || 1,
    );
    const [lastLoadedPage, setLastLoadedPage] = useState(
        initialPosts?.current_page || 1,
    );
    const [hasMorePages, setHasMorePages] = useState(
        initialPosts?.next_page_url !== null,
    );
    const [hasPreviousPages, setHasPreviousPages] = useState(
        initialPosts?.prev_page_url !== null,
    );
    const [totalPosts, setTotalPosts] = useState(initialPosts?.total || 0);

    // ── State du modal ──
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Références scroll
    const scrollPositionRef = useRef<number>(0);
    const contentHeightRef = useRef<number>(0);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Charger page suivante
    const loadMorePosts = useCallback(() => {
        if (!hasMorePages || loadingMore) return;
        setLoadingMore(true);
        const nextPage = lastLoadedPage + 1;
        router.get(
            `/feeds?page=${nextPage}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['posts'],
                onSuccess: (page) => {
                    const newPosts = (page.props as unknown as PageProps).posts;
                    if (newPosts && newPosts.data.length > 0) {
                        setFeeds((prev) => [...prev, ...newPosts.data]);
                        setCurrentPage(newPosts.current_page);
                        setLastLoadedPage(newPosts.current_page);
                        setHasMorePages(newPosts.next_page_url !== null);
                        setTotalPosts(newPosts.total);
                    } else {
                        setHasMorePages(false);
                    }
                },
                onError: (errors) =>
                    console.error('Error loading more posts:', errors),
                onFinish: () => setLoadingMore(false),
            },
        );
    }, [lastLoadedPage, hasMorePages, loadingMore]);

    // Charger page précédente
    const loadPreviousPosts = useCallback(() => {
        if (
            !hasPreviousPages ||
            loadingPrevious ||
            loadingMore ||
            firstLoadedPage <= 1
        )
            return;
        setLoadingPrevious(true);
        const previousPage = firstLoadedPage - 1;
        contentHeightRef.current = document.documentElement.scrollHeight;
        scrollPositionRef.current = window.scrollY;
        router.get(
            `/feeds?page=${previousPage}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['posts'],
                onSuccess: (page) => {
                    const newPosts = (page.props as unknown as PageProps).posts;
                    if (newPosts && newPosts.data.length > 0) {
                        setFeeds((prev) => [...newPosts.data, ...prev]);
                        setFirstLoadedPage(newPosts.current_page);
                        setHasPreviousPages(newPosts.prev_page_url !== null);
                        setTotalPosts(newPosts.total);
                        setTimeout(() => {
                            const newH = document.documentElement.scrollHeight;
                            window.scrollTo(
                                0,
                                scrollPositionRef.current +
                                    (newH - contentHeightRef.current),
                            );
                        }, 0);
                    } else {
                        setHasPreviousPages(false);
                    }
                },
                onError: (errors) =>
                    console.error('Error loading previous posts:', errors),
                onFinish: () => setLoadingPrevious(false),
            },
        );
    }, [firstLoadedPage, hasPreviousPages, loadingPrevious, loadingMore]);

    // Rafraîchir le feed
    const refreshPosts = useCallback(() => {
        router.get(
            '/feeds',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['posts'],
                onSuccess: (page) => {
                    const newPosts = (page.props as unknown as PageProps).posts;
                    if (newPosts) {
                        setFeeds(newPosts.data);
                        setCurrentPage(newPosts.current_page);
                        setFirstLoadedPage(newPosts.current_page);
                        setLastLoadedPage(newPosts.current_page);
                        setHasMorePages(newPosts.next_page_url !== null);
                        setHasPreviousPages(newPosts.prev_page_url !== null);
                        setTotalPosts(newPosts.total);
                    }
                },
                onError: (errors) =>
                    console.error('Error refreshing posts:', errors),
            },
        );
    }, []);

    // Scroll infini bidirectionnel
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            if (
                scrollTop < 400 &&
                hasPreviousPages &&
                !loadingPrevious &&
                !loadingMore
            )
                loadPreviousPosts();
            if (
                scrollHeight - scrollTop - clientHeight < 800 &&
                hasMorePages &&
                !loadingMore &&
                !loadingPrevious
            )
                loadMorePosts();
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [
        loadMorePosts,
        loadPreviousPosts,
        hasPreviousPages,
        hasMorePages,
        loadingPrevious,
        loadingMore,
    ]);

    // Sync props Inertia
    useEffect(() => {
        if (initialPosts) {
            setFeeds(initialPosts.data);
            setCurrentPage(initialPosts.current_page);
            setFirstLoadedPage(initialPosts.current_page);
            setLastLoadedPage(initialPosts.current_page);
            setHasMorePages(initialPosts.next_page_url !== null);
            setHasPreviousPages(initialPosts.prev_page_url !== null);
            setTotalPosts(initialPosts.total);
        }
    }, [initialPosts]);

    if (loading) return <Loading />;

    return (
        <AppLayout>
            <div className="w-full space-y-6">
                {/* Stories */}
                <StoriesBar />

                {/* Créer un post — mobile uniquement */}
                <div className="rounded-xl bg-white p-4 shadow lg:hidden">
                    <button
                        onClick={() => router.visit('/create-post')}
                        className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-emerald-600 p-4 text-left transition hover:border-green-600 hover:bg-green-50"
                    >
                        <img
                            src={
                                auth.user.profile_picture ||
                                defaultProfilePicture
                            }
                            alt={auth.user.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = defaultProfilePicture;
                            }}
                        />
                        <span className="flex-1 text-gray-500">
                            Qu'est-ce qui vous préoccupe,{' '}
                            {auth.user.full_name.split(' ')[0]}?
                        </span>
                        <PlusCircle className="h-6 w-6 text-emerald-600" />
                    </button>
                </div>

                {/* Liste des posts */}
                <div className="space-y-6">
                    {feeds.length > 0 ? (
                        <>
                            {feeds.map((item) =>
                                item.item_type === 'repost' ? (
                                    /* ── Repost cliquable ── */
                                    <div
                                        key={`repost-${item.id}`}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            setSelectedPostId(
                                                item.original_post?.id ??
                                                    item.id,
                                            )
                                        }
                                    >
                                        <RepostCard
                                            post={item}
                                            onUpdate={refreshPosts}
                                        />
                                    </div>
                                ) : (
                                    /* ── Post cliquable ── */
                                    <div
                                        key={`post-${item.id}`}
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                            // Éviter d'ouvrir le modal si on clique sur un bouton d'action
                                            const target =
                                                e.target as HTMLElement;
                                            if (
                                                target.closest('button') ||
                                                target.closest('a') ||
                                                target.closest(
                                                    '[data-no-modal]',
                                                )
                                            )
                                                return;
                                            setSelectedPostId(item.id);
                                        }}
                                    >
                                        <PostCard
                                            post={item}
                                            onUpdate={refreshPosts}
                                        />
                                    </div>
                                ),
                            )}

                            {/* Chargement vers le bas */}
                            {loadingMore && (
                                <div className="flex justify-center py-8">
                                    <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm text-indigo-600">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                                        <span className="font-medium">
                                            Chargement des posts suivants...
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Fin du feed */}
                            {!hasMorePages &&
                                !loadingMore &&
                                feeds.length > 0 && (
                                    <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-8 text-center">
                                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                                            <span className="text-2xl">🎉</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            Vous êtes à jour !
                                        </p>
                                        <p className="mt-1 text-xs text-gray-600">
                                            Vous avez vu tous les {totalPosts}{' '}
                                            post
                                            {totalPosts !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}
                        </>
                    ) : (
                        /* État vide */
                        <div className="rounded-xl bg-white p-12 text-center shadow">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                                <svg
                                    className="h-10 w-10 text-emerald-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900">
                                Pas de publications encore
                            </h3>
                            <p className="mb-6 text-gray-600">
                                Soyez le premier à partager quelque chose
                                d'incroyable avec la communauté !
                            </p>
                            <button
                                onClick={() => router.visit('/create-post')}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:from-emerald-600 hover:to-green-700 hover:shadow-xl active:scale-95"
                            >
                                <PlusCircle className="h-5 w-5" />
                                Créer votre première publication
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ══ Modal post — monté au root du layout ══ */}
            {selectedPostId && (
                <PostModal
                    postId={selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                />
            )}
        </AppLayout>
    );
}
