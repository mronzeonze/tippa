// likes-modal.tsx
// Composant modal réutilisable pour afficher la liste des utilisateurs qui ont liké un post

import { router } from '@inertiajs/react';
import { Heart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Interface pour les utilisateurs qui ont liké
interface LikedUser {
    id: string;
    full_name: string;
    username: string;
    profile_picture: string | null;
}

// Props du composant
interface LikesModalProps {
    postId: string; // ID du post
    isOpen: boolean; // État d'ouverture du modal
    onClose: () => void; // Fonction pour fermer le modal
    likesCount: number; // Nombre total de likes
}

/**
 * Composant LikesModal
 * Affiche un modal avec la liste des utilisateurs qui ont liké un post
 */
export default function LikesModal({
    postId,
    isOpen,
    onClose,
    likesCount,
}: LikesModalProps) {
    // État pour stocker la liste des utilisateurs qui ont liké
    const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);

    // État pour le chargement des données
    const [isLoading, setIsLoading] = useState(false);

    // Image par défaut pour les profils sans photo
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Effet pour charger les utilisateurs quand le modal s'ouvre
    useEffect(() => {
        // Si le modal est ouvert et qu'il y a des likes
        if (isOpen && likesCount > 0) {
            loadLikedUsers();
        }

        // Réinitialiser la liste quand le modal se ferme
        if (!isOpen) {
            setLikedUsers([]);
        }
    }, [isOpen, postId, likesCount]);

    /**
     * Fonction pour charger la liste des utilisateurs qui ont liké
     * Utilise Inertia pour faire une requête au serveur
     */
    const loadLikedUsers = () => {
        setIsLoading(true);

        // Requête GET vers l'endpoint des likes
        router.get(
            `/posts/${postId}/likes`,
            {},
            {
                preserveState: true, // Garder l'état React actuel
                preserveScroll: true, // Ne pas scroller
                only: ['likes'], // Optimisation : ne récupérer que les likes
                onSuccess: (page: any) => {
                    // Extraire la liste des utilisateurs de la réponse
                    setLikedUsers(page.props.likes || []);
                    setIsLoading(false);
                },
                onError: (errors) => {
                    // Afficher un message d'erreur
                    toast.error('Erreur lors du chargement des likes');
                    console.error(errors);
                    setIsLoading(false);
                    onClose(); // Fermer le modal en cas d'erreur
                },
            },
        );
    };

    /**
     * Fonction pour naviguer vers le profil d'un utilisateur
     * @param userId - ID de l'utilisateur
     */
    const handleUserClick = (userId: string) => {
        router.get(`/profile/${userId}`);
        onClose(); // Fermer le modal après la navigation
    };

    // Ne rien afficher si le modal est fermé
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay transparent (cliquable pour fermer) */}
            <div
                className="fixed inset-0 z-40 bg-transparent transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Container du modal */}
            <div className="bg-opacity-10 pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 transition-opacity">
                {/* Modal */}
                <div
                    className="flex max-h-[80vh] w-full max-w-md flex-col rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // Empêcher la fermeture au clic sur le modal
                >
                    {/* En-tête du modal */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4">
                        <div className="flex items-center space-x-2">
                            {/* Icône cœur */}
                            <Heart className="h-5 w-5 fill-green-500 text-green-500" />
                            {/* Titre avec compteur */}
                            <h2 className="text-lg font-semibold text-gray-900">
                                J'aime ({likesCount})
                            </h2>
                        </div>
                        {/* Bouton de fermeture */}
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Fermer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Liste des utilisateurs (scrollable) */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* État de chargement */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500" />
                            </div>
                        ) : likedUsers.length === 0 ? (
                            // État vide : aucun like
                            <div className="py-8 text-center text-gray-500">
                                <Heart className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                <p className="text-sm">
                                    Aucun j'aime pour le moment
                                </p>
                            </div>
                        ) : (
                            // Liste des utilisateurs qui ont liké
                            <ul className="space-y-3">
                                {likedUsers.map((user) => (
                                    <li
                                        key={user.id}
                                        className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition hover:bg-gray-50"
                                        onClick={() => handleUserClick(user.id)}
                                    >
                                        {/* Photo de profil */}
                                        <img
                                            src={
                                                user.profile_picture ||
                                                defaultProfilePicture
                                            }
                                            alt={user.full_name}
                                            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    defaultProfilePicture;
                                            }}
                                        />
                                        {/* Informations utilisateur */}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-gray-900">
                                                {user.full_name}
                                            </p>
                                            <p className="truncate text-sm text-gray-500">
                                                @{user.username}
                                            </p>
                                        </div>
                                        {/* Icône cœur */}
                                        <Heart className="h-5 w-5 flex-shrink-0 fill-green-500 text-green-500" />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Pied de page avec bouton de fermeture */}
                    {/* <div className="border-t border-gray-200 p-4">
                        <button
                            onClick={onClose}
                            className="w-full rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
                        >
                            Fermer
                        </button>
                    </div> */}
                </div>
            </div>
        </>
    );
}
