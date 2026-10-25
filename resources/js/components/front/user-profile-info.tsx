// components/user-profile-info.tsx
// Composant affichant les informations d'un profil utilisateur
// Gère les actions : follow/unfollow, connect, message

import { UserProfileInfoProps } from '@/types/profile';
import { router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    MapPin,
    MessageSquare,
    Settings,
    UserCheck,
    UserPlus,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { bgGradient } from '../assets/assets';

/**
 * ================================================================================
 * COMPOSANT USER PROFILE INFO
 * ================================================================================
 *
 * Affiche les informations d'un utilisateur et les boutons d'action :
 * - Photo de profil
 * - Nom, username, bio
 * - Localisation et date d'inscription
 * - Statistiques (posts, partages, followers, connexions)
 * - Boutons d'action selon la relation avec l'utilisateur courant
 */
const UserProfileInfo = ({
    user, // L'utilisateur dont on affiche le profil
    stats, // Statistiques (posts_count, followers_count, etc.)
    relationship, // Relations avec l'utilisateur courant
    setShowEdit, // Fonction pour ouvrir le modal d'édition
    onUpdate, // Callback après une action (follow, connect, etc.)
}: UserProfileInfoProps) => {
    // ========================================
    // ÉTATS LOCAUX
    // ========================================

    // État de chargement pour désactiver les boutons pendant les requêtes
    const [isLoading, setIsLoading] = useState(false);

    // Photo de profil par défaut si l'utilisateur n'en a pas
    const defaultProfilePicture =
        'https://ui-avatars.com/api/?name=' +
        encodeURIComponent(user.full_name) +
        '&background=6366f1&color=fff&size=200';

    // ========================================
    // FONCTION : SUIVRE/NE PLUS SUIVRE
    // ========================================

    /**
     * Gère l'action de follow/unfollow
     *
     * ÉTAPES :
     * 1. Désactiver le bouton (setIsLoading)
     * 2. Déterminer l'action (follow ou unfollow)
     * 3. Envoyer la requête POST au serveur
     * 4. Afficher un message de succès/erreur
     * 5. Rafraîchir les données du profil
     * 6. Réactiver le bouton
     */
    const handleFollowToggle = () => {
        setIsLoading(true);

        // Déterminer l'action en fonction de l'état actuel
        const action = relationship.is_following ? 'unfollow' : 'follow';

        // Envoyer la requête au serveur
        router.post(
            `/users/${user.id}/${action}`, // Route : /users/{id}/follow ou /users/{id}/unfollow
            {}, // Pas de données à envoyer
            {
                preserveState: true, // Garder l'état React actuel
                preserveScroll: true, // Ne pas scroller
                onSuccess: () => {
                    // Afficher un message de succès
                    toast.success(
                        relationship.is_following
                            ? 'Désabonné avec succès !'
                            : 'Abonnement réussi !',
                    );

                    // Rafraîchir les données du profil
                    if (onUpdate) onUpdate();
                },
                onError: () => {
                    // Afficher un message d'erreur
                    toast.error(`Échec de l'abonnement`);
                },
                onFinish: () => {
                    // Toujours réactiver le bouton à la fin
                    setIsLoading(false);
                },
            },
        );
    };

    // ========================================
    // FONCTION : ENVOYER UNE DEMANDE DE CONNEXION
    // ========================================

    /**
     * Envoie une demande de connexion à un utilisateur
     *
     * ÉTAPES :
     * 1. Désactiver le bouton
     * 2. Envoyer la requête POST à /connections
     * 3. Afficher un message de succès/erreur
     * 4. Rafraîchir les données
     * 5. Réactiver le bouton
     */
    const handleConnect = () => {
        setIsLoading(true);

        router.post(
            '/connections', // Route pour créer une connexion
            { user_id: user.id }, // Envoyer l'ID de l'utilisateur
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Demande de connexion envoyée !');
                    if (onUpdate) onUpdate();
                },
                onError: (errors) => {
                    // Afficher le premier message d'erreur
                    toast.error(Object.values(errors)[0] as string);
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    // ========================================
    // RENDU DU COMPOSANT
    // ========================================

    return (
        <div className="relative px-6 pb-6">
            {/* ========================================
                PHOTO DE PROFIL
                ======================================== */}

            {/* Photo positionnée au-dessus de la carte */}
            <div className="absolute -top-16 left-6">
                <img
                    src={user.profile_picture || defaultProfilePicture}
                    alt={user.full_name}
                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl"
                    onError={(e) => {
                        // En cas d'erreur de chargement, utiliser l'image par défaut
                        e.currentTarget.src = defaultProfilePicture;
                    }}
                />
            </div>

            {/* ========================================
                BOUTONS D'ACTION (en haut à droite)
                ======================================== */}

            <div className="flex justify-end gap-2 pt-4">
                {/* CAS 1 : C'est mon propre profil */}
                {relationship.is_own_profile ? (
                    <button
                        onClick={() => setShowEdit(true)}
                        className="flex items-center gap-2 rounded-lg border-2 border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                    >
                        <Settings className="h-4 w-4" />
                        Modifier Profil
                    </button>
                ) : (
                    /* CAS 2 : C'est le profil d'un autre utilisateur */
                    <>
                        {/* ========================================
                            BOUTON FOLLOW/UNFOLLOW
                            ======================================== */}

                        <button
                            onClick={handleFollowToggle}
                            disabled={isLoading}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                                relationship.is_following
                                    ? 'border-2 border-gray-300 bg-white text-gray-700 hover:border-red-500 hover:text-red-600'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            {relationship.is_following ? (
                                <>
                                    <UserCheck className="h-4 w-4" />
                                    Abonné
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    S'abonner
                                </>
                            )}
                        </button>

                        {/* ========================================
                            BOUTON CONNECT / MESSAGE / EN ATTENTE
                            ======================================== */}

                        {/* Si déjà connectés : bouton Message */}
                        {relationship.is_connected ? (
                            <button
                                onClick={() =>
                                    router.visit(`/messages/${user.id}`)
                                }
                                className={`flex items-center gap-2 rounded-lg ${bgGradient} px-4 py-2 text-sm font-medium text-white transition hover:from-emerald-600 hover:to-green-700`}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Message
                            </button>
                        ) : /* Si demande en attente : bouton désactivé */
                        relationship.has_pending_request ? (
                            <button
                                disabled
                                className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700"
                            >
                                <Clock className="h-4 w-4" />
                                En attente
                            </button>
                        ) : (
                            /* Sinon : bouton Connexion */
                            <button
                                onClick={handleConnect}
                                disabled={isLoading}
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                                <UserPlus className="h-4 w-4" />
                                Connexion
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* ========================================
                INFORMATIONS UTILISATEUR
                ======================================== */}

            <div className="mt-16">
                {/* Nom et username */}
                <h1 className="text-2xl font-bold text-gray-900">
                    {user.full_name}
                </h1>
                <p className="text-gray-600">@{user.username}</p>

                {/* Badge "Vous suit" si l'utilisateur nous suit */}
                {!relationship.is_own_profile && relationship.is_follower && (
                    <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        Vous suit
                    </span>
                )}

                {/* Bio de l'utilisateur */}
                {user.bio && (
                    <p className="mt-4 whitespace-pre-line text-gray-700">
                        {user.bio}
                    </p>
                )}

                {/* ========================================
                    INFORMATIONS SUPPLÉMENTAIRES
                    ======================================== */}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    {/* Localisation */}
                    {user.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{user.location}</span>
                        </div>
                    )}

                    {/* Date d'inscription */}
                    {user.created_at && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                                Rejoint en{' '}
                                {moment(user.created_at).format('MMMM YYYY')}
                            </span>
                        </div>
                    )}
                </div>

                {/* ========================================
                    STATISTIQUES RAPIDES
                    ======================================== */}

                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {/* Publications */}
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-sm transition hover:shadow-md">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">
                                {stats.posts_count || 0}
                            </p>
                            <p className="text-sm text-gray-600">
                                Publications
                            </p>
                        </div>
                    </div>

                    {/* Partages */}
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 shadow-sm transition hover:shadow-md">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.shares_count || 0}
                            </p>
                            <p className="text-sm text-gray-600">Partages</p>
                        </div>
                    </div>

                    {/* Abonnés */}
                    <div className="rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 p-4 shadow-sm transition hover:shadow-md">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-pink-600">
                                {stats.followers_count || 0}
                            </p>
                            <p className="text-sm text-gray-600">Abonnés</p>
                        </div>
                    </div>

                    {/* Connexions */}
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm transition hover:shadow-md">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.connections_count || 0}
                            </p>
                            <p className="text-sm text-gray-600">Connexions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileInfo;
