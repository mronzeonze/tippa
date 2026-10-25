import type { PageProps } from '@/types/post';
import { router, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Heart,
    MessageCircle,
    Repeat2,
    Share2,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import toast from 'react-hot-toast';
import CommentsModal from './comment-modal';
import LikesModal from './like-modal'; // Import du composant réutilisable
import ShareModal from './share-modal';

// Props du composant
interface RepostCardProps {
    post: any; // Post republ ié
    onUpdate?: () => void; // Callback pour rafraîchir les données
}

/**
 * Composant RepostCard
 * Affiche une carte de republication avec l'auteur du partage et le post original
 */
export default function RepostCard({ post, onUpdate }: RepostCardProps) {
    // Récupération de l'utilisateur connecté
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;

    // ========================================
    // ÉTATS LOCAUX
    // ========================================

    // État pour le nombre de likes
    const [likes, setLikes] = useState(post.likes_count);

    // État pour savoir si l'utilisateur a liké
    const [isLiked, setIsLiked] = useState(post.is_liked);

    // État pour le nombre de commentaires
    const [commentsCount, setCommentsCount] = useState(
        post.comments_count || 0,
    );

    // État pour le nombre de partages
    const [sharesCount, setSharesCount] = useState(post.shares_count || 0);

    // État pour savoir si l'utilisateur a republié
    const [isReposted, setIsReposted] = useState(post.is_reposted || false);

    // États pour les modals
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false); // NOUVEAU

    // Image par défaut
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    /**
     * Fonction pour mettre en surbrillance les hashtags
     */
    const postWithHashtags = post.content
        ? post.content.replace(
              /(#\w+)/g,
              '<span class="text-indigo-600 font-medium">$1</span>',
          )
        : '';

    /**
     * Fonction pour gérer le like/unlike d'un post
     * Utilise l'optimistic update pour une meilleure UX
     */
    const handleLike = async () => {
        // Calculer le nouvel état
        const newIsLiked = !isLiked;
        const newLikes = newIsLiked ? likes + 1 : likes - 1;

        // Mise à jour immédiate de l'UI
        setIsLiked(newIsLiked);
        setLikes(newLikes);

        // Requête au serveur
        router.post(
            `/posts/${post.id}/like`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    if (onUpdate) onUpdate();
                },
                onError: (errors) => {
                    // Annuler l'optimistic update en cas d'erreur
                    setIsLiked(!newIsLiked);
                    setLikes(newIsLiked ? newLikes - 1 : newLikes + 1);
                    toast.error('Échec de la mise à jour du like');
                },
            },
        );
    };

    /**
     * Fonction pour ouvrir le modal des likes
     */
    const handleOpenLikes = () => {
        if (likes > 0) {
            setIsLikesModalOpen(true);
        }
    };

    /**
     * Callback pour mettre à jour le nombre de commentaires
     */
    const handleCommentsUpdate = (newCount: number) => {
        setCommentsCount(newCount);
    };

    /**
     * Fonction pour calculer la classe CSS de la grille d'images
     */
    const getImageGridClass = () => {
        const imageCount = post.images?.length || 0;
        if (imageCount === 0) return '';
        if (imageCount === 1) return 'grid-cols-1';
        if (imageCount === 2) return 'grid-cols-2';
        if (imageCount === 3) return 'grid-cols-2';
        return 'grid-cols-2';
    };

    // ========================================
    // RENDU DU COMPOSANT
    // ========================================

    return (
        <>
            {/* Carte de republication */}
            <div className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-4 shadow transition hover:shadow-md">
                {/* ========================================
                    INDICATEUR DE REPUBLICATION
                    Affiche qui a partagé et quand
                    ======================================== */}
                <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Repeat2 className="h-4 w-4" />
                    <span className="font-medium">
                        {post.reposted_by.id === currentUser.id
                            ? 'Vous avez'
                            : post.reposted_by.full_name}{' '}
                        republié
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">
                        {moment(post.repost_date).fromNow()}
                    </span>
                </div>

                {/* ========================================
                    COMMENTAIRE SUR LA REPUBLICATION
                    Affiché seulement si l'utilisateur a ajouté un commentaire
                    ======================================== */}
                {post.repost_content && (
                    <div className="rounded-lg bg-purple-50 p-3 text-sm text-gray-800">
                        {/* Photo et nom de l'utilisateur qui a partagé */}
                        <div className="mb-2 flex items-center gap-2">
                            <img
                                src={
                                    post.reposted_by.profile_picture ||
                                    defaultProfilePicture
                                }
                                alt={post.reposted_by.full_name}
                                className="h-6 w-6 rounded-full object-cover"
                            />
                            <span className="font-medium">
                                {post.reposted_by.full_name}
                            </span>
                        </div>
                        {/* Contenu du commentaire */}
                        <p className="whitespace-pre-line">
                            {post.repost_content}
                        </p>
                    </div>
                )}

                {/* ========================================
                    POST ORIGINAL
                    Affiché avec une bordure pour le distinguer
                    ======================================== */}
                <div className="space-y-3 rounded-lg border-2 border-gray-200 p-4">
                    {/* Header du post original */}
                    <div
                        onClick={() =>
                            router.get(`/profile/${post.original_author.id}`)
                        }
                        className="flex cursor-pointer items-center gap-3 transition hover:opacity-80"
                    >
                        {/* Photo de profil de l'auteur original */}
                        <img
                            src={
                                post.original_author.profile_picture ||
                                defaultProfilePicture
                            }
                            alt={post.original_author.full_name}
                            className="h-10 w-10 rounded-full object-cover shadow"
                            onError={(e) => {
                                e.currentTarget.src = defaultProfilePicture;
                            }}
                        />
                        {/* Nom et username de l'auteur original */}
                        <div>
                            <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-900">
                                    {post.original_author.full_name}
                                </span>
                                <BadgeCheck className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="text-sm text-gray-500">
                                @{post.original_author.username} ·{' '}
                                {moment(post.created_at).fromNow()}
                            </div>
                        </div>
                    </div>

                    {/* Contenu du post original */}
                    {post.content && post.content.trim() && (
                        <div
                            className="text-sm whitespace-pre-line text-gray-800"
                            dangerouslySetInnerHTML={{
                                __html: postWithHashtags,
                            }}
                        />
                    )}

                    {/* Images du post original */}
                    {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 ${getImageGridClass()}`}>
                            {post.images.map((image: any, index: number) => (
                                <div
                                    key={image.id}
                                    className={`overflow-hidden rounded-lg ${
                                        post.images.length === 1
                                            ? 'col-span-1'
                                            : post.images.length === 3 &&
                                                index === 0
                                              ? 'col-span-2'
                                              : ''
                                    }`}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={`Post image ${index + 1}`}
                                        className={`h-full w-full object-cover ${
                                            post.images.length === 1
                                                ? 'max-h-[500px]'
                                                : 'h-48'
                                        }`}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ========================================
                    SECTION ACTIONS
                    Compteurs et boutons d'interaction
                    ======================================== */}
                <div className="space-y-3 border-t border-gray-200 pt-3">
                    {/* Compteurs cliquables */}
                    {(likes > 0 || commentsCount > 0 || sharesCount > 0) && (
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                                {/* Compteur de likes (cliquable) */}
                                {likes > 0 && (
                                    <button
                                        onClick={handleOpenLikes}
                                        className="flex items-center gap-2 transition hover:text-green-600 hover:underline"
                                    >
                                        <div className="flex items-center justify-center rounded-full bg-green-500 p-1">
                                            <Heart className="h-3 w-3 fill-white text-white" />
                                        </div>
                                        <span className="font-medium">
                                            {likes} J'aime
                                        </span>
                                    </button>
                                )}
                                {/* Compteur de commentaires (cliquable) */}
                                {commentsCount > 0 && (
                                    <button
                                        onClick={() =>
                                            setIsCommentsModalOpen(true)
                                        }
                                        className="flex items-center gap-1 transition hover:text-blue-600 hover:underline"
                                    >
                                        <span className="font-medium">
                                            {commentsCount}{' '}
                                            {commentsCount === 1
                                                ? 'commentaire'
                                                : 'commentaires'}
                                        </span>
                                    </button>
                                )}
                            </div>
                            {/* Compteur de partages (cliquable) */}
                            {sharesCount > 0 && (
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="flex items-center gap-1 transition hover:text-purple-600 hover:underline"
                                >
                                    <span className="font-medium">
                                        {sharesCount}{' '}
                                        {sharesCount === 1
                                            ? 'partage'
                                            : 'partages'}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Boutons d'actions */}
                    <div className="flex items-center gap-6 border-t border-gray-100 pt-2 text-sm text-gray-600">
                        {/* Bouton Like */}
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-1.5 transition hover:text-green-500"
                        >
                            <Heart
                                className={`h-5 w-5 cursor-pointer transition hover:scale-110 ${
                                    isLiked
                                        ? 'fill-green-500 text-green-500'
                                        : 'hover:text-green-500'
                                }`}
                            />
                            <span className="font-medium">
                                {isLiked ? "J'aime" : 'Aimer'}
                            </span>
                        </button>

                        {/* Bouton Commentaires */}
                        <button
                            onClick={() => setIsCommentsModalOpen(true)}
                            className="flex items-center gap-1.5 transition hover:text-blue-500"
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span className="font-medium">Commenter</span>
                        </button>

                        {/* Bouton Partager */}
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className={`flex items-center gap-1.5 transition ${
                                isReposted
                                    ? 'text-purple-500'
                                    : 'hover:text-purple-500'
                            }`}
                        >
                            <Share2
                                className={`h-5 w-5 ${isReposted ? 'fill-purple-500' : ''}`}
                            />
                            <span className="font-medium">Partager</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================
                MODALS
                ======================================== */}

            {/* Modal des likes (NOUVEAU composant réutilisable) */}
            <LikesModal
                postId={post.id}
                isOpen={isLikesModalOpen}
                onClose={() => setIsLikesModalOpen(false)}
                likesCount={likes}
            />

            {/* Modal des commentaires */}
            <CommentsModal
                postId={post.id}
                isOpen={isCommentsModalOpen}
                onClose={() => setIsCommentsModalOpen(false)}
                initialCount={commentsCount}
                onCommentsUpdate={handleCommentsUpdate}
            />

            {/* Modal de partage */}
            <ShareModal
                postId={post.id}
                isOpen={isShareModalOpen}
                onClose={() => {
                    setIsShareModalOpen(false);
                    if (onUpdate) onUpdate();
                }}
                isReposted={isReposted}
                postUrl={`${window.location.origin}/posts/${post.id}`}
                postContent={post.content}
            />
        </>
    );
}
