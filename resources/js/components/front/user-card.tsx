// import type { DiscoverUser } from '@/types/discover';
// import { router } from '@inertiajs/react';
// import {
//     Clock,
//     Eye,
//     MapPin,
//     MessageSquare,
//     UserCheck,
//     UserPlus,
// } from 'lucide-react';
// import { useState } from 'react';
// import toast from 'react-hot-toast';
// import { bgGradient } from '../assets/assets';

// interface UserCardProps {
//     user: DiscoverUser;
//     onUpdate?: () => void;
// }

// const UserCard = ({ user, onUpdate }: UserCardProps) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const defaultProfilePicture =
//         'http://localhost:8000/storage/images/default-avatar.jpg';

//     // Suivre un utilisateur
//     const handleFollow = () => {
//         setIsLoading(true);
//         router.post(
//             `/users/${user.id}/follow`,
//             {},
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     toast.success('Abonnement réussi !');
//                     if (onUpdate) onUpdate();
//                 },
//                 onError: () => {
//                     toast.error("Echec de l'abonnement");
//                 },
//                 onFinish: () => setIsLoading(false),
//             },
//         );
//     };

//     // Ne plus suivre
//     const handleUnfollow = () => {
//         setIsLoading(true);
//         router.post(
//             `/users/${user.id}/unfollow`,
//             {},
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     toast.success('Désabonné avec succès !');
//                     if (onUpdate) onUpdate();
//                 },
//                 onError: () => {
//                     toast.error('Echec du désabonnement');
//                 },
//                 onFinish: () => setIsLoading(false),
//             },
//         );
//     };

//     // Envoyer une demande de connexion
//     const handleConnect = () => {
//         setIsLoading(true);
//         router.post(
//             '/connections',
//             { user_id: user.id },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     toast.success('Demande de connexion envoyée !');
//                     if (onUpdate) onUpdate();
//                 },
//                 onError: (errors) => {
//                     toast.error(Object.values(errors)[0] as string);
//                 },
//                 onFinish: () => setIsLoading(false),
//             },
//         );
//     };

//     return (
//         <div className="group w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl">
//             {/* Header avec photo de profil */}
//             <div className="relative h-32 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500">
//                 <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
//                     <img
//                         src={user.profile_picture || defaultProfilePicture}
//                         alt={user.full_name}
//                         className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
//                         onError={(e) => {
//                             e.currentTarget.src = defaultProfilePicture;
//                         }}
//                     />
//                 </div>
//             </div>

//             {/* Corps de la carte */}
//             <div className="px-6 pt-14 pb-6">
//                 {/* Nom et username */}
//                 <div className="text-center">
//                     <h3 className="text-lg font-bold text-slate-900">
//                         {user.full_name}
//                     </h3>
//                     <p className="text-sm text-slate-500">@{user.username}</p>
//                 </div>

//                 {/* Bio */}
//                 {user.bio && (
//                     <p className="mt-3 line-clamp-2 text-center text-sm text-gray-600">
//                         {user.bio}
//                     </p>
//                 )}

//                 {/* Localisation */}
//                 {user.location && (
//                     <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500">
//                         <MapPin className="h-3 w-3" />
//                         <span>{user.location}</span>
//                     </div>
//                 )}

//                 {/* Stats */}
//                 <div className="mt-4 flex justify-center gap-6 text-sm">
//                     <div className="text-center">
//                         <p className="font-bold text-slate-900">
//                             {user.followers_count}
//                         </p>
//                         <p className="text-xs text-gray-500">Abonnés</p>
//                     </div>
//                     <div className="text-center">
//                         <p className="font-bold text-slate-900">
//                             {user.following_count}
//                         </p>
//                         <p className="text-xs text-gray-500">Abonnements</p>
//                     </div>
//                 </div>

//                 {/* Badges de statut */}
//                 <div className="mt-4 flex flex-wrap justify-center gap-2">
//                     {user.is_connected && (
//                         <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
//                             <UserCheck className="h-3 w-3" />
//                             Connecté
//                         </span>
//                     )}
//                     {user.has_pending_request && !user.is_connected && (
//                         <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
//                             <Clock className="h-3 w-3" />
//                             En attente
//                         </span>
//                     )}
//                     {user.is_follower && (
//                         <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
//                             Vous suit
//                         </span>
//                     )}
//                 </div>

//                 {/* Boutons d'action */}
//                 <div className="mt-6 space-y-2">
//                     {/* Bouton principal */}
//                     {!user.is_connected && !user.has_pending_request && (
//                         <button
//                             onClick={handleConnect}
//                             disabled={isLoading}
//                             className={`flex w-full items-center justify-center gap-2 rounded-lg ${bgGradient} px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50`}
//                         >
//                             <UserPlus className="h-4 w-4" />
//                             Connexion
//                         </button>
//                     )}

//                     {user.is_connected && (
//                         <button
//                             onClick={() => router.get(`/messages/${user.id}`)}
//                             className={`flex w-full items-center justify-center gap-2 rounded-lg ${bgGradient} px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50`}
//                         >
//                             <MessageSquare className="h-4 w-4" />
//                             Message
//                         </button>
//                     )}

//                     {/* Boutons secondaires */}
//                     <div className="flex gap-2">
//                         {/* Bouton Follow/Unfollow */}
//                         {!user.is_following ? (
//                             <button
//                                 onClick={handleFollow}
//                                 disabled={isLoading}
//                                 className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50`}
//                             >
//                                 <UserPlus className="h-4 w-4" />
//                                 S'abonner
//                             </button>
//                         ) : (
//                             <button
//                                 onClick={handleUnfollow}
//                                 disabled={isLoading}
//                                 className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50`}
//                             >
//                                 <UserCheck className="h-4 w-4" />
//                                 Se désabonner
//                             </button>
//                         )}

//                         {/* Bouton voir profil */}
//                         <button
//                             onClick={() => router.get(`/profile/${user.id}`)}
//                             className="flex items-center justify-center rounded-lg border-2 border-gray-200 px-4 py-2 text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
//                         >
//                             <Eye className="h-4 w-4" />
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserCard;

import type { DiscoverUser } from '@/types/discover';
import { router } from '@inertiajs/react';
import {
    Clock,
    Eye,
    MapPin,
    MessageSquare,
    UserCheck,
    UserMinus,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { bgGradient } from '../assets/assets';

interface UserCardProps {
    user: DiscoverUser;
    onUpdate?: () => void;
}

const UserCard = ({ user, onUpdate }: UserCardProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // ── Actions réseau ────────────────────────────────────────────────────────

    const handleFollow = () => {
        setIsLoading(true);
        router.post(
            `/users/${user.id}/follow`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Abonnement réussi !');
                    onUpdate?.();
                },
                onError: () => toast.error("Échec de l'abonnement"),
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleUnfollow = () => {
        setIsLoading(true);
        router.post(
            `/users/${user.id}/unfollow`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Désabonné avec succès !');
                    onUpdate?.();
                },
                onError: () => toast.error('Échec du désabonnement'),
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleConnect = () => {
        setIsLoading(true);
        router.post(
            '/connections',
            { user_id: user.id },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Demande de connexion envoyée !');
                    onUpdate?.();
                },
                onError: (errors) =>
                    toast.error(Object.values(errors)[0] as string),
                onFinish: () => setIsLoading(false),
            },
        );
    };

    // ── Rendu ─────────────────────────────────────────────────────────────────

    return (
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-gray-200">
            {/* ── Avatar ───────────────────────────────────────────────────── */}
            <div className="relative flex-shrink-0">
                <img
                    src={user.profile_picture || defaultProfilePicture}
                    alt={user.full_name}
                    className="h-11 w-11 rounded-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = defaultProfilePicture;
                    }}
                />
                {/* Bandeau "Connecté" sur l'avatar */}
                {user.is_connected && (
                    <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
                        <UserCheck className="h-2.5 w-2.5 text-white" />
                    </span>
                )}
            </div>

            {/* ── Infos utilisateur ─────────────────────────────────────────── */}
            <div className="min-w-0 flex-1">
                {/* Ligne 1 : nom + badges d'état */}
                <div className="flex items-center gap-1.5 truncate">
                    <p className="truncate text-sm font-semibold text-gray-900">
                        {user.full_name}
                    </p>
                    {user.has_pending_request && !user.is_connected && (
                        <span title="Demande en attente">
                            <Clock className="h-3 w-3 flex-shrink-0 text-amber-500" />
                        </span>
                    )}
                    {user.is_follower && (
                        <span className="flex-shrink-0 rounded-sm bg-blue-50 px-1 py-0.5 text-[10px] leading-none font-medium text-blue-600">
                            Vous suit
                        </span>
                    )}
                </div>

                {/* Ligne 2 : username + localisation */}
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                    <span className="truncate">@{user.username}</span>
                    {user.location && (
                        <>
                            <span className="flex-shrink-0">·</span>
                            <span className="flex flex-shrink-0 items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {user.location}
                            </span>
                        </>
                    )}
                </div>

                {/* Ligne 3 : stats abonnés */}
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span>
                        <span className="font-semibold text-gray-700">
                            {user.followers_count ?? 0}
                        </span>{' '}
                        abonnés
                    </span>
                    <span>
                        <span className="font-semibold text-gray-700">
                            {user.following_count ?? 0}
                        </span>{' '}
                        abonn.
                    </span>
                </div>
            </div>

            {/* ── Boutons d'action ──────────────────────────────────────────── */}
            <div className="flex flex-shrink-0 items-center gap-1">
                {/* Bouton principal : Connexion / Message / En attente */}
                {user.is_connected ? (
                    <button
                        onClick={() =>
                            router.visit(`/messages?selectedUserId=${user.id}`)
                        }
                        title="Envoyer un message"
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgGradient} text-white transition active:scale-95`}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </button>
                ) : user.has_pending_request ? (
                    <span
                        title="Demande en attente"
                        className="flex h-8 items-center rounded-lg bg-amber-50 px-2 text-xs font-medium text-amber-600 ring-1 ring-amber-200"
                    >
                        En attente
                    </span>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        title="Envoyer une demande de connexion"
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgGradient} text-white transition active:scale-95 disabled:opacity-50`}
                    >
                        <UserPlus className="h-4 w-4" />
                    </button>
                )}

                {/* Bouton Follow / Unfollow */}
                {!user.is_following ? (
                    <button
                        onClick={handleFollow}
                        disabled={isLoading}
                        title="S'abonner"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-emerald-400 hover:text-emerald-600 active:scale-95 disabled:opacity-50"
                    >
                        <UserPlus className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleUnfollow}
                        disabled={isLoading}
                        title="Se désabonner"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
                    >
                        <UserMinus className="h-4 w-4" />
                    </button>
                )}

                {/* Bouton Voir le profil */}
                <button
                    onClick={() => router.visit(`/profile/${user.id}`)}
                    title="Voir le profil"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600 active:scale-95"
                >
                    <Eye className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default UserCard;
