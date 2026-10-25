// Import du router Inertia pour la navigation SPA
import { router, usePage } from '@inertiajs/react';
// Import des icônes Lucide React
import {
    BadgeCheck,
    Heart,
    MessageCircle,
    MoreVertical,
    Share2,
    Trash2,
} from 'lucide-react';
// Import de moment.js pour formatter les dates
import moment from 'moment';
// Import des hooks React
import { useState } from 'react';
// Import de react-hot-toast pour les notifications
import toast from 'react-hot-toast';
// Import des types partagés
import type { PageProps, PostCardProps } from '@/types/post';
// Import du modal des commentaires
import CommentsModal from './comment-modal';
// Import du modal de partage
import ShareModal from './share-modal';
// Import du modal des likes
import LikesModal from './like-modal';

import { Flag } from 'lucide-react';
import ReportModal from './report-modal';

/**
 * Composant principal PostCard
 * Affiche une carte de post avec toutes ses interactions possibles
 */
const PostCard = ({ post, onUpdate }: PostCardProps) => {
    // Récupération de l'utilisateur connecté via Inertia
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;

    // ========================================
    // ÉTATS LOCAUX
    // ========================================

    // État pour le nombre de likes (optimistic update)
    const [likes, setLikes] = useState(post.likes_count);

    // État pour savoir si l'utilisateur a liké (optimistic update)
    const [isLiked, setIsLiked] = useState(post.is_liked);

    // État pour le processus de suppression
    const [isDeleting, setIsDeleting] = useState(false);

    // État pour le modal des likes
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);

    // État pour le modal des commentaires
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

    // État local pour le nombre de commentaires
    const [commentsCount, setCommentsCount] = useState(
        post.comments_count || 0,
    );

    // État pour le modal de partage
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // État pour savoir si l'utilisateur a republié
    const [isReposted, setIsReposted] = useState(post.is_reposted || false);

    // État local pour le nombre de partages
    const [sharesCount, setSharesCount] = useState(post.shares_count || 0);

    // report modal state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    //state pour afficher/masquer les options
    const [showOptions, setShowOptions] = useState(false);

    // URL de l'image par défaut si l'utilisateur n'a pas de photo de profil
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    /**
     * Fonction pour mettre en surbrillance les hashtags dans le contenu
     * Remplace tous les #mot par <span class="...">$1</span>
     */
    const postWithHashtags = post.content
        ? post.content.replace(
              /(#\w+)/g,
              '<span class="text-indigo-600 font-medium">$1</span>',
          )
        : '';

    // ========================================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ========================================

    /**
     * Fonction pour gérer le like/unlike d'un post
     * Utilise l'optimistic update pour une meilleure UX
     */
    const handleLike = async () => {
        // Calculer le nouvel état
        const newIsLiked = !isLiked;
        const newLikes = newIsLiked ? likes + 1 : likes - 1;

        // Mise à jour immédiate de l'UI (optimistic update)
        setIsLiked(newIsLiked);
        setLikes(newLikes);

        // Appel API vers le serveur avec Inertia
        router.post(
            `/posts/${post.id}/like`,
            {},
            {
                preserveScroll: true, // Maintenir la position de scroll
                preserveState: true, // Garder l'état React
                onSuccess: () => {
                    // Notifier le parent pour rafraîchir les données
                    if (onUpdate) onUpdate();
                },
                onError: (errors) => {
                    // Annuler l'optimistic update en cas d'erreur
                    setIsLiked(!newIsLiked);
                    setLikes(newIsLiked ? newLikes - 1 : newLikes + 1);
                    toast.error('Échec de la mise à jour du like');
                    console.error(errors);
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
     * Fonction pour fermer le modal des likes
     */
    const handleCloseLikes = () => {
        setIsLikesModalOpen(false);
    };

    /**
     * Fonction pour ouvrir le modal des commentaires
     */
    const handleOpenComments = () => {
        setIsCommentsModalOpen(true);
    };

    /**
     * Fonction pour fermer le modal des commentaires
     */
    const handleCloseComments = () => {
        setIsCommentsModalOpen(false);
    };

    /**
     * Callback pour mettre à jour le nombre de commentaires
     * Appelé depuis le modal des commentaires
     */
    const handleCommentsUpdate = (newCount: number) => {
        setCommentsCount(newCount);
    };

    /**
     * Fonction pour ouvrir le modal de partage
     */
    const handleOpenShare = () => {
        setIsShareModalOpen(true);
    };

    /**
     * Fonction pour fermer le modal de partage
     */
    const handleCloseShare = () => {
        setIsShareModalOpen(false);
        // Recharger pour mettre à jour les stats
        if (onUpdate) onUpdate();
    };

    /**
     * Fonction pour gérer la suppression d'un post
     * Affiche une confirmation avant de supprimer
     */
    const handleDelete = () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?'))
            return;

        setIsDeleting(true);

        // Requête DELETE vers le serveur
        router.delete(`/posts/${post.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Publication supprimée avec succès');
                if (onUpdate) onUpdate();
            },
            onError: (errors) => {
                toast.error('Échec de la suppression');
                console.error(errors);
                setIsDeleting(false);
            },
        });
    };

    /**
     * Fonction pour naviguer vers le profil de l'utilisateur
     */
    const handleProfileClick = () => {
        router.get(`/profile/${post.user.id}`);
    };

    /**
     * Fonction pour calculer la classe CSS de la grille d'images
     * Adapte la disposition selon le nombre d'images
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
            {/* Carte du post */}
            <div className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-4 shadow transition hover:shadow-md">
                {/* ========================================
                    SECTION HEADER - Informations de l'auteur
                    ======================================== */}
                <div className="flex items-start justify-between">
                    {/* Informations utilisateur (cliquable) */}
                    <div
                        onClick={handleProfileClick}
                        className="inline-flex cursor-pointer items-center gap-3 transition hover:opacity-80"
                    >
                        {/* Photo de profil */}

                        <img
                            src={
                                post.user.profile_picture ||
                                defaultProfilePicture
                            }
                            alt={post.user.full_name}
                            className="h-10 w-10 rounded-full object-cover shadow"
                            onError={(e) => {
                                e.currentTarget.src = defaultProfilePicture;
                            }}
                        />
                        {/* Nom et username */}
                        <div>
                            <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-900">
                                    {post.user.full_name}
                                </span>
                                {/* Badge vérifié */}
                                <BadgeCheck className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="text-sm text-gray-500">
                                @{post.user.username} ·{' '}
                                {moment(post.created_at).fromNow()}
                            </div>
                        </div>
                    </div>
                    {/* Menu options (3 points) - visible pour tous */}
                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>

                        {showOptions && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowOptions(false)}
                                />
                                <div className="absolute top-full right-0 z-20 mt-1 w-48 rounded-lg border bg-white shadow-lg">
                                    {/* Bouton Signaler (pour tous) */}
                                    {currentUser.id !== post.user_id && (
                                        <button
                                            onClick={() => {
                                                setIsReportModalOpen(true);
                                                setShowOptions(false);
                                            }}
                                            className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                                        >
                                            <Flag className="h-4 w-4" />
                                            <span>Signaler</span>
                                        </button>
                                    )}

                                    {/* Bouton Supprimer (seulement pour l'auteur) */}
                                    {currentUser.id === post.user_id && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span>Supprimer</span>
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ========================================
                    SECTION CONTENU - Texte du post
                    ======================================== */}
                {post.content && post.content.trim() && (
                    <div
                        className="text-sm whitespace-pre-line text-gray-800"
                        dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                    />
                )}

                {/* ========================================
                    SECTION IMAGES - Galerie d'images
                    ======================================== */}
                {post.images && post.images.length > 0 && (
                    <div className={`grid gap-2 ${getImageGridClass()}`}>
                        {post.images.map((image, index) => (
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

                {/* ========================================
                    SECTION ACTIONS - Compteurs et boutons
                    ======================================== */}
                <div className="space-y-3 border-t border-gray-200 pt-3">
                    {/* Compteurs de likes, commentaires et partages - Cliquables */}
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
                                            {likes}{' '}
                                            {likes === 1 ? "J'aime" : "J'aime"}
                                        </span>
                                    </button>
                                )}

                                {/* Compteur de commentaires (cliquable) */}
                                {commentsCount > 0 && (
                                    <button
                                        onClick={handleOpenComments}
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
                                    onClick={handleOpenShare}
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

                    {/* Boutons d'actions principaux */}
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
                            onClick={handleOpenComments}
                            className="flex items-center gap-1.5 transition hover:text-blue-500"
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span className="font-medium">Commenter</span>
                        </button>

                        {/* Bouton Partager */}
                        <button
                            onClick={handleOpenShare}
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
                MODALS - Composants modaux
                ======================================== */}

            {/* Modal des utilisateurs qui ont liké (NOUVEAU composant réutilisable) */}
            <LikesModal
                postId={post.id}
                isOpen={isLikesModalOpen}
                onClose={handleCloseLikes}
                likesCount={likes}
            />

            {/* Modal des commentaires */}
            <CommentsModal
                postId={post.id}
                isOpen={isCommentsModalOpen}
                onClose={handleCloseComments}
                initialCount={commentsCount}
                onCommentsUpdate={handleCommentsUpdate}
            />

            {/* Modal de partage */}
            <ShareModal
                postId={post.id}
                isOpen={isShareModalOpen}
                onClose={handleCloseShare}
                isReposted={isReposted}
                postUrl={`${window.location.origin}/posts/${post.id}`}
                postContent={post.content}
            />

            {/* Modal de signalement */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                contentType="post"
                contentId={post.id}
                contentAuthor={post.user.full_name}
            />
        </>
    );
};

export default PostCard;
