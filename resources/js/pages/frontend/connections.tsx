// import { bgGradient } from '@/components/assets/assets';
// import AppLayout from '@/layouts/app-layout';
// import { ConnectionPageProps } from '@/types/connection';
// import { router, usePage } from '@inertiajs/react';
// import {
//     Check,
//     Clock,
//     Eye,
//     Link,
//     MessageSquare,
//     RefreshCcw,
//     Trash2,
//     UserCheck,
//     UserPlus,
//     Users,
//     X,
// } from 'lucide-react';
// import moment from 'moment';
// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';

// // ========================================
// // COMPOSANT PRINCIPAL
// // ========================================
// const Connections = () => {
//     // Récupération des données depuis Inertia
//     const {
//         connections: initialConnections,
//         followers: initialFollowers,
//         following: initialFollowing,
//         pending_requests: initialPendingRequests,
//         sent_requests: initialSentRequests,
//         counts,
//         active_tab: initialTab,
//         auth,
//     } = usePage<ConnectionPageProps>().props;

//     // États locaux
//     const [currentTab, setCurrentTab] = useState(initialTab || 'connections');
//     const [connections, setConnections] = useState(initialConnections || []);
//     const [followers, setFollowers] = useState(initialFollowers || []);
//     const [following, setFollowing] = useState(initialFollowing || []);
//     const [pendingRequests, setPendingRequests] = useState(
//         initialPendingRequests || [],
//     );
//     const [sentRequests, setSentRequests] = useState(initialSentRequests || []);

//     // Image par défaut
//     const defaultProfilePicture =
//         'http://localhost:8000/storage/images/default-avatar.jpg';

//     const currentUser = auth.user;

//     // ========================================
//     // FONCTIONS D'ACTION
//     // ========================================

//     // Envoyer une demande de connexion
//     const sendConnectionRequest = (userId: string) => {
//         router.post(
//             '/connections',
//             { user_id: userId },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     toast.success('Connexion demandée avec succès !');
//                     refreshData();
//                 },
//                 onError: (errors) => {
//                     const errorMessage = Object.values(errors)[0] as string;
//                     toast.error(
//                         errorMessage || "Échec de l'envoi de la demande",
//                     );
//                 },
//             },
//         );
//     };

//     // Accepter une demande de connexion
//     const acceptConnection = (connectionId: string) => {
//         router.patch(
//             `/connections/${connectionId}/accept`,
//             {},
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     toast.success('Connexion acceptée !');
//                     refreshData();
//                 },
//                 onError: () => {
//                     toast.error("Échec de l'acceptation de la connexion");
//                 },
//             },
//         );
//     };

//     // Rejeter/Supprimer une connexion
//     const removeConnection = (
//         connectionId: string,
//         message: string = 'Supprimer cette connexion ?',
//     ) => {
//         if (!confirm(message)) return;

//         router.delete(`/connections/${connectionId}`, {
//             preserveState: true,
//             preserveScroll: true,
//             onSuccess: () => {
//                 toast.success('Connexion supprimée avec succès !');
//                 refreshData();
//             },
//             onError: () => {
//                 toast.error('Échec de la suppression de la connexion');
//             },
//         });
//     };

//     // Unfollow un utilisateur
//     const unfollowUser = (userId: string) => {
//         if (!confirm('Désabonner cet utilisateur ?')) return;

//         router.post(
//             `/users/${userId}/unfollow`,
//             {},
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     toast.success('Désabonné avec succès !');
//                     refreshData();
//                 },
//                 onError: () => {
//                     toast.error('Échec du désabonnement');
//                 },
//             },
//         );
//     };

//     // Rafraîchir les données
//     const refreshData = () => {
//         router.get(
//             '/connections',
//             { tab: currentTab },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 only: [
//                     'connections',
//                     'followers',
//                     'following',
//                     'pending_requests',
//                     'sent_requests',
//                     'counts',
//                 ],
//             },
//         );
//     };

//     // Changer d'onglet
//     const changeTab = (tab: string) => {
//         setCurrentTab(tab);
//         router.get(
//             '/connections',
//             { tab },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 only: ['active_tab'],
//             },
//         );
//     };

//     // ========================================
//     // EFFETS
//     // ========================================

//     // Mettre à jour les états quand les props changent
//     useEffect(() => {
//         if (initialConnections) setConnections(initialConnections);
//         if (initialFollowers) setFollowers(initialFollowers);
//         if (initialFollowing) setFollowing(initialFollowing);
//         if (initialPendingRequests) setPendingRequests(initialPendingRequests);
//         if (initialSentRequests) setSentRequests(initialSentRequests);
//     }, [
//         initialConnections,
//         initialFollowers,
//         initialFollowing,
//         initialPendingRequests,
//         initialSentRequests,
//     ]);

//     // ========================================
//     // CONFIGURATION DES ONGLETS
//     // ========================================
//     const dataArray = [
//         {
//             label: 'Abonnés',
//             value: followers,
//             icon: Users,
//             count: counts.followers,
//             color: 'blue',
//         },
//         {
//             label: 'Abonnements',
//             value: following,
//             icon: UserCheck,
//             count: counts.following,
//             color: 'purple',
//         },
//         {
//             label: 'En attente',
//             value: [...pendingRequests, ...sentRequests],
//             icon: RefreshCcw,
//             count: counts.pending,
//             color: 'orange',
//         },
//         {
//             label: 'Connexions',
//             value: connections,
//             icon: Link,
//             count: counts.connections,
//             color: 'green',
//         },
//     ];

//     // ========================================
//     // COMPOSANT CARTE UTILISATEUR
//     // ========================================
//     const UserCard = ({ user, type }: { user: any; type: string }) => {
//         // Déterminer si c'est une demande reçue ou envoyée
//         const isReceivedRequest =
//             'connection_id' in user &&
//             pendingRequests.some((r) => r.connection_id === user.connection_id);
//         const isSentRequest =
//             'connection_id' in user &&
//             sentRequests.some((r) => r.connection_id === user.connection_id);

//         // Extraire les données utilisateur
//         const userData = 'user' in user ? user.user : user;

//         return (
//             <div className="flex w-full max-w-xl gap-5 rounded-xl bg-white p-6 shadow transition hover:shadow-md">
//                 {/* Photo de profil */}
//                 <img
//                     src={userData.profile_picture || defaultProfilePicture}
//                     alt={userData.full_name}
//                     className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-gray-100"
//                     onError={(e) => {
//                         e.currentTarget.src = defaultProfilePicture;
//                     }}
//                 />

//                 {/* Informations utilisateur */}
//                 <div className="flex-1">
//                     <p className="font-semibold text-slate-800">
//                         {userData.full_name}
//                     </p>
//                     <p className="text-sm text-slate-500">
//                         @{userData.username}
//                     </p>
//                     <p className="mt-1 line-clamp-1 text-sm text-gray-600">
//                         {userData.bio}
//                     </p>

//                     {/* Informations supplémentaires */}
//                     {user.followers_count !== undefined && (
//                         <div className="mt-2 flex gap-4 text-xs text-gray-500">
//                             <span>{user.followers_count} Abonnés</span>
//                             <span>{user.following_count} Abonnements</span>
//                         </div>
//                     )}

//                     {/* Date pour les demandes */}
//                     {user.created_at && (
//                         <p className="mt-2 text-xs text-gray-500">
//                             {moment(user.created_at).fromNow()}
//                         </p>
//                     )}

//                     {/* Boutons d'action */}
//                     <div className="mt-4 flex gap-2 max-sm:flex-col">
//                         {/* Bouton Voir le profil (toujours visible) */}
//                         <button
//                             onClick={() =>
//                                 router.get(`/profile/${userData.id}`)
//                             }
//                             className={`flex w-full items-center justify-center gap-2 rounded-lg ${bgGradient} px-4 py-2 text-sm font-medium text-white transition active:scale-95`}
//                         >
//                             <Eye className="h-4 w-4" />
//                             Voir le profil
//                         </button>

//                         {/* Boutons spécifiques selon l'onglet */}
//                         {type === 'Following' && (
//                             <button
//                                 onClick={() => unfollowUser(userData.id)}
//                                 className="w-full rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-200 active:scale-95"
//                             >
//                                 Se désabonner
//                             </button>
//                         )}

//                         {type === 'Followers' &&
//                             !user.is_connected &&
//                             !user.has_pending_request && (
//                                 <button
//                                     onClick={() =>
//                                         sendConnectionRequest(userData.id)
//                                     }
//                                     className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-200 active:scale-95"
//                                 >
//                                     <Link className="h-4 w-4" />
//                                     Connecter
//                                 </button>
//                             )}

//                         {type === 'Pending' && isReceivedRequest && (
//                             <>
//                                 <button
//                                     onClick={() =>
//                                         acceptConnection(user.connection_id)
//                                     }
//                                     className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-200 active:scale-95"
//                                 >
//                                     <Check className="h-4 w-4" />
//                                     Accepter
//                                 </button>
//                                 <button
//                                     onClick={() =>
//                                         removeConnection(
//                                             user.connection_id,
//                                             'Rejeter cette demande?',
//                                         )
//                                     }
//                                     className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-200 active:scale-95"
//                                 >
//                                     <X className="h-4 w-4" />
//                                     Rejeter
//                                 </button>
//                             </>
//                         )}

//                         {type === 'Pending' && isSentRequest && (
//                             <button
//                                 onClick={() =>
//                                     removeConnection(
//                                         user.connection_id,
//                                         'Annuler cette demande?',
//                                     )
//                                 }
//                                 className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200 active:scale-95"
//                             >
//                                 <Trash2 className="h-4 w-4" />
//                                 Annuler la demande
//                             </button>
//                         )}

//                         {type === 'Connections' && (
//                             <button
//                                 onClick={() =>
//                                     router.get(`/messages/${userData.id}`)
//                                 }
//                                 className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 active:scale-95"
//                             >
//                                 <MessageSquare className="h-4 w-4" />
//                                 Message
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // ========================================
//     // RENDU DU COMPOSANT
//     // ========================================
//     return (
//         <AppLayout>
//             <div className="min-h-screen bg-slate-50">
//                 <div className="mx-auto max-w-6xl p-6">
//                     {/* Header - Titre */}
//                     <div className="mb-8">
//                         <h1 className="mb-2 text-3xl font-bold text-slate-900">
//                             Connexions
//                         </h1>
//                         <p className="text-slate-600">
//                             Gérer votre réseau et découvrir de nouvelles
//                             connexions
//                         </p>
//                     </div>

//                     {/* Compteurs des onglets */}
//                     <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
//                         {dataArray.map((item, index) => {
//                             const Icon = item.icon;
//                             return (
//                                 <div
//                                     key={index}
//                                     onClick={() => changeTab(item.label)}
//                                     className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 bg-white p-6 shadow transition hover:shadow-md ${
//                                         currentTab === item.label
//                                             ? `border-${item.color}-500`
//                                             : 'border-gray-200'
//                                     }`}
//                                 >
//                                     <Icon
//                                         className={`h-6 w-6 ${
//                                             currentTab === item.label
//                                                 ? `text-${item.color}-600`
//                                                 : 'text-gray-400'
//                                         }`}
//                                     />
//                                     <div className="text-center">
//                                         <p className="text-2xl font-bold text-slate-900">
//                                             {item.count}
//                                         </p>
//                                         <p className="text-sm text-slate-600">
//                                             {item.label}
//                                         </p>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>

//                     {/* Onglets de navigation */}
//                     {/* <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow">
//                         {dataArray.map((tab) => {
//                             const Icon = tab.icon;
//                             const isActive = currentTab === tab.label;

//                             return (
//                                 <button
//                                     onClick={() => changeTab(tab.label)}
//                                     key={tab.label}
//                                     className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
//                                         isActive
//                                             ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow'
//                                             : 'text-gray-600 hover:bg-gray-100'
//                                     }`}
//                                 >
//                                     <Icon className="h-4 w-4" />
//                                     <span>{tab.label}</span>
//                                     <span
//                                         className={`rounded-full px-2 py-0.5 text-xs font-bold ${
//                                             isActive
//                                                 ? 'bg-white/20 text-white'
//                                                 : 'bg-gray-100 text-gray-700'
//                                         }`}
//                                     >
//                                         {tab.count}
//                                     </span>
//                                 </button>
//                             );
//                         })}
//                     </div> */}

//                     {/* Contenu de l'onglet actif */}
//                     <div className="space-y-4">
//                         {/* Message d'information selon l'onglet */}
//                         {currentTab === 'En attente' &&
//                             pendingRequests.length > 0 && (
//                                 <div className="rounded-lg bg-orange-50 p-4">
//                                     <p className="text-sm font-medium text-orange-800">
//                                         📬 Vous avez {pendingRequests.length}{' '}
//                                         demande de connexion en attente
//                                         {pendingRequests.length !== 1
//                                             ? 's'
//                                             : ''}{' '}
//                                         en attente de votre réponse. Veuillez
//                                         accepter ou rejeter ces demandes.
//                                     </p>
//                                 </div>
//                             )}

//                         {/* Demandes reçues (Pending) */}
//                         {currentTab === 'En attente' &&
//                             pendingRequests.length > 0 && (
//                                 <div className="mb-6">
//                                     <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
//                                         <Clock className="h-5 w-5 text-orange-600" />
//                                         Demandes reçues
//                                         <span className="rounded-full bg-orange-100 px-2 py-0.5 text-sm font-bold text-orange-700">
//                                             {pendingRequests.length}
//                                         </span>
//                                     </h2>
//                                     <div className="space-y-4">
//                                         {pendingRequests.map((request) => (
//                                             <UserCard
//                                                 key={request.connection_id}
//                                                 user={request}
//                                                 type="Pending"
//                                             />
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                         {/* Demandes envoyées (Pending) */}
//                         {currentTab === 'En attente' &&
//                             sentRequests.length > 0 && (
//                                 <div className="mb-6">
//                                     <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
//                                         <UserPlus className="h-5 w-5 text-blue-600" />
//                                         Envois de demandes
//                                         <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm font-bold text-blue-700">
//                                             {sentRequests.length}
//                                         </span>
//                                     </h2>
//                                     <div className="space-y-4">
//                                         {sentRequests.map((request) => (
//                                             <UserCard
//                                                 key={request.connection_id}
//                                                 user={request}
//                                                 type="Pending"
//                                             />
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                         {/* Liste des utilisateurs pour les autres onglets */}
//                         {currentTab !== 'En attente' && (
//                             <>
//                                 {dataArray
//                                     .find((item) => item.label === currentTab)
//                                     ?.value.map((user: any) => (
//                                         <UserCard
//                                             key={user.user?.id || user.id}
//                                             user={user}
//                                             type={currentTab}
//                                         />
//                                     ))}
//                             </>
//                         )}

//                         {/* États vides */}
//                         {dataArray.find((item) => item.label === currentTab)
//                             ?.count === 0 && (
//                             <div className="rounded-xl bg-white p-12 text-center shadow">
//                                 {currentTab === 'Abonnés' && (
//                                     <>
//                                         <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//                                         <h3 className="mb-2 text-xl font-bold text-gray-900">
//                                             Aucuns abonnés pour le moment
//                                         </h3>
//                                         <p className="text-gray-600">
//                                             Partagez du contenu intéressant pour
//                                             gagner des abonnés
//                                         </p>
//                                     </>
//                                 )}
//                                 {currentTab === 'Abonnements' && (
//                                     <>
//                                         <UserCheck className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//                                         <h3 className="mb-2 text-xl font-bold text-gray-900">
//                                             Vous ne suivez encore personne
//                                         </h3>
//                                         <p className="text-gray-600">
//                                             Découvrez et suivez des personnes
//                                             intéressantes
//                                         </p>
//                                     </>
//                                 )}
//                                 {currentTab === 'En attente' && (
//                                     <>
//                                         <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//                                         <h3 className="mb-2 text-xl font-bold text-gray-900">
//                                             Aucune demande en attente
//                                         </h3>
//                                         <p className="text-gray-600">
//                                             Vous n'avez aucune demande de
//                                             connexion en attente
//                                         </p>
//                                     </>
//                                 )}
//                                 {currentTab === 'Connexions' && (
//                                     <>
//                                         <UserPlus className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//                                         <h3 className="mb-2 text-xl font-bold text-gray-900">
//                                             Aucune connexion pour le moment
//                                         </h3>
//                                         <p className="text-gray-600">
//                                             Commencez à vous connecter avec des
//                                             personnes pour développer votre
//                                             réseau
//                                         </p>
//                                     </>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// };

// export default Connections;

import AppLayout from '@/layouts/app-layout';
import { ConnectionPageProps } from '@/types/connection';
import { router, usePage } from '@inertiajs/react';
import {
    Check,
    Clock,
    Eye,
    Link as LinkIcon,
    MessageSquare,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
const Connections = () => {
    // Récupération des données depuis Inertia
    const {
        connections: initialConnections,
        followers: initialFollowers,
        following: initialFollowing,
        pending_requests: initialPendingRequests,
        sent_requests: initialSentRequests,
        counts,
        active_tab: initialTab,
        auth,
    } = usePage<ConnectionPageProps>().props;

    // États locaux
    const [currentTab, setCurrentTab] = useState(initialTab || 'connections');
    const [connections, setConnections] = useState(initialConnections || []);
    const [followers, setFollowers] = useState(initialFollowers || []);
    const [following, setFollowing] = useState(initialFollowing || []);
    const [pendingRequests, setPendingRequests] = useState(
        initialPendingRequests || [],
    );
    const [sentRequests, setSentRequests] = useState(initialSentRequests || []);

    // Image par défaut
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    const currentUser = auth.user;

    // ========================================
    // FONCTIONS D'ACTION
    // ========================================

    // Envoyer une demande de connexion
    const sendConnectionRequest = (userId: string) => {
        router.post(
            '/connections',
            { user_id: userId },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Connexion demandée avec succès !');
                    refreshData();
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors)[0] as string;
                    toast.error(
                        errorMessage || "Échec de l'envoi de la demande",
                    );
                },
            },
        );
    };

    // Accepter une demande de connexion
    const acceptConnection = (connectionId: string) => {
        router.patch(
            `/connections/${connectionId}/accept`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Connexion acceptée !');
                    refreshData();
                },
                onError: () => {
                    toast.error("Échec de l'acceptation de la connexion");
                },
            },
        );
    };

    // Rejeter/Supprimer une connexion
    const removeConnection = (
        connectionId: string,
        message: string = 'Supprimer cette connexion ?',
    ) => {
        if (!confirm(message)) return;

        router.delete(`/connections/${connectionId}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Connexion supprimée avec succès !');
                refreshData();
            },
            onError: () => {
                toast.error('Échec de la suppression de la connexion');
            },
        });
    };

    // Unfollow un utilisateur
    const unfollowUser = (userId: string) => {
        if (!confirm('Désabonner cet utilisateur ?')) return;

        router.post(
            `/users/${userId}/unfollow`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Désabonné avec succès !');
                    refreshData();
                },
                onError: () => {
                    toast.error('Échec du désabonnement');
                },
            },
        );
    };

    // Ouvrir la conversation avec un utilisateur
    const openConversation = (userId: string) => {
        router.get('/messages', {
            selectedUserId: userId,
        });
    };

    // Rafraîchir les données
    const refreshData = () => {
        router.get(
            '/connections',
            { tab: currentTab },
            {
                preserveState: true,
                preserveScroll: true,
                only: [
                    'connections',
                    'followers',
                    'following',
                    'pending_requests',
                    'sent_requests',
                    'counts',
                ],
            },
        );
    };

    // Changer d'onglet
    const changeTab = (tab: string) => {
        setCurrentTab(tab);
        router.get(
            '/connections',
            { tab },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['active_tab'],
            },
        );
    };

    // ========================================
    // EFFETS
    // ========================================

    // Mettre à jour les états quand les props changent
    useEffect(() => {
        if (initialConnections) setConnections(initialConnections);
        if (initialFollowers) setFollowers(initialFollowers);
        if (initialFollowing) setFollowing(initialFollowing);
        if (initialPendingRequests) setPendingRequests(initialPendingRequests);
        if (initialSentRequests) setSentRequests(initialSentRequests);
    }, [
        initialConnections,
        initialFollowers,
        initialFollowing,
        initialPendingRequests,
        initialSentRequests,
    ]);

    // ========================================
    // CONFIGURATION DES ONGLETS
    // ========================================
    const navigationItems = [
        {
            label: 'Connexions',
            value: 'Connexions',
            icon: Users,
            count: counts.connections,
        },
        {
            label: 'Abonnés',
            value: 'Abonnés',
            icon: Users,
            count: counts.followers,
        },
        {
            label: 'Abonnements',
            value: 'Abonnements',
            icon: UserCheck,
            count: counts.following,
        },
        {
            label: 'En attente',
            value: 'En attente',
            icon: Clock,
            count: counts.pending,
        },
    ];

    const dataMap: Record<string, any[]> = {
        Connexions: connections,
        Abonnés: followers,
        Abonnements: following,
        'En attente': [...pendingRequests, ...sentRequests],
    };

    // ========================================
    // COMPOSANT CARTE UTILISATEUR
    // ========================================
    const UserCard = ({ user, type }: { user: any; type: string }) => {
        // Déterminer si c'est une demande reçue ou envoyée
        const isReceivedRequest =
            'connection_id' in user &&
            pendingRequests.some((r) => r.connection_id === user.connection_id);
        const isSentRequest =
            'connection_id' in user &&
            sentRequests.some((r) => r.connection_id === user.connection_id);

        // Extraire les données utilisateur
        const userData = 'user' in user ? user.user : user;

        return (
            <div className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex gap-4">
                    {/* Photo de profil */}
                    <img
                        src={userData.profile_picture || defaultProfilePicture}
                        alt={userData.full_name}
                        className="h-16 w-16 rounded-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = defaultProfilePicture;
                        }}
                    />

                    {/* Informations utilisateur */}
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-gray-900">
                            {userData.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            @{userData.username}
                        </p>
                        {userData.bio && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                {userData.bio}
                            </p>
                        )}

                        {/* Stats */}
                        {user.followers_count !== undefined && (
                            <div className="mt-2 flex gap-4 text-xs text-gray-500">
                                <span>{user.followers_count} Abonnés</span>
                                <span>•</span>
                                <span>{user.following_count} Abonnements</span>
                            </div>
                        )}

                        {/* Date pour les demandes */}
                        {user.created_at && (
                            <p className="mt-2 text-xs text-gray-500">
                                {moment(user.created_at).fromNow()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    {/* Bouton Voir le profil */}
                    <button
                        onClick={() => router.get(`/profile/${userData.id}`)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                    >
                        <Eye className="h-4 w-4" />
                        Voir le profil
                    </button>

                    {/* Boutons spécifiques selon l'onglet */}
                    {type === 'Abonnements' && (
                        <button
                            onClick={() => unfollowUser(userData.id)}
                            className="flex-1 rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Se désabonner
                        </button>
                    )}

                    {type === 'Abonnés' &&
                        !user.is_connected &&
                        !user.has_pending_request && (
                            <button
                                onClick={() =>
                                    sendConnectionRequest(userData.id)
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                <LinkIcon className="h-4 w-4" />
                                Connecter
                            </button>
                        )}

                    {type === 'En attente' && isReceivedRequest && (
                        <>
                            <button
                                onClick={() =>
                                    acceptConnection(user.connection_id)
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                <Check className="h-4 w-4" />
                                Accepter
                            </button>
                            <button
                                onClick={() =>
                                    removeConnection(
                                        user.connection_id,
                                        'Rejeter cette demande?',
                                    )
                                }
                                className="flex-1 rounded-full border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                                Ignorer
                            </button>
                        </>
                    )}

                    {type === 'En attente' && isSentRequest && (
                        <button
                            onClick={() =>
                                removeConnection(
                                    user.connection_id,
                                    'Annuler cette demande?',
                                )
                            }
                            className="flex-1 rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                    )}

                    {type === 'Connexions' && (
                        <button
                            onClick={() => openConversation(userData.id)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Message
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // ========================================
    // RENDU DU COMPOSANT
    // ========================================
    return (
        <AppLayout
            leftSidebarContent={
                // Sidebar gauche personnalisée
                <div className="sticky top-20 hidden w-64 lg:block">
                    <div className="rounded-xl bg-white shadow-sm">
                        {/* Header */}
                        <div className="border-b border-gray-200 p-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Gérer mon réseau
                            </h2>
                        </div>

                        {/* Navigation */}
                        <nav className="p-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentTab === item.value;

                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => changeTab(item.value)}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                isActive
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {item.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            }
        >
            <div className="w-full space-y-6">
                {/* Header avec tabs mobile */}
                <div className="lg:hidden">
                    <div className="flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-sm">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentTab === item.value;

                            return (
                                <button
                                    key={item.value}
                                    onClick={() => changeTab(item.value)}
                                    className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            isActive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {item.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Conteneur principal avec onglets desktop */}
                <div className="rounded-xl bg-white shadow-sm">
                    {/* Tabs navigation desktop */}
                    <div className="hidden border-b border-gray-200 lg:block">
                        <div className="flex gap-8 px-6">
                            {[
                                { label: 'Développer', value: 'develop' },
                                {
                                    label: 'Reprendre contact',
                                    value: 'reconnect',
                                },
                            ].map((tab, index) => (
                                <button
                                    key={index}
                                    className={`relative border-b-2 py-4 text-sm font-semibold transition ${
                                        index === 0
                                            ? 'border-emerald-600 text-emerald-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                        {/* Message d'information selon l'onglet */}
                        {currentTab === 'En attente' &&
                            pendingRequests.length > 0 && (
                                <div className="mb-6 rounded-lg bg-orange-50 p-4">
                                    <p className="text-sm font-medium text-orange-800">
                                        📬 Invitations ({pendingRequests.length}
                                        )
                                    </p>
                                    <p className="mt-1 text-sm text-orange-700">
                                        Vous avez {pendingRequests.length}{' '}
                                        demande
                                        {pendingRequests.length > 1
                                            ? 's'
                                            : ''}{' '}
                                        de connexion en attente de votre
                                        réponse.
                                    </p>
                                </div>
                            )}

                        {/* Section des demandes reçues (En attente) */}
                        {currentTab === 'En attente' &&
                            pendingRequests.length > 0 && (
                                <div className="mb-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-gray-900">
                                            Invitations (
                                            {pendingRequests.length})
                                        </h3>
                                        <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                                            Tout afficher
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {pendingRequests
                                            .slice(0, 3)
                                            .map((request) => (
                                                <UserCard
                                                    key={request.connection_id}
                                                    user={request}
                                                    type="En attente"
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                        {/* Section des demandes envoyées (En attente) */}
                        {currentTab === 'En attente' &&
                            sentRequests.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-4 text-base font-semibold text-gray-900">
                                        Demandes envoyées ({sentRequests.length}
                                        )
                                    </h3>
                                    <div className="space-y-4">
                                        {sentRequests.map((request) => (
                                            <UserCard
                                                key={request.connection_id}
                                                user={request}
                                                type="En attente"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Liste des utilisateurs pour les autres onglets */}
                        {currentTab !== 'En attente' && (
                            <div className="space-y-4">
                                {dataMap[currentTab]?.map((user: any) => (
                                    <UserCard
                                        key={user.user?.id || user.id}
                                        user={user}
                                        type={currentTab}
                                    />
                                ))}
                            </div>
                        )}

                        {/* États vides */}
                        {dataMap[currentTab]?.length === 0 && (
                            <div className="rounded-xl p-12 text-center">
                                {currentTab === 'Abonnés' && (
                                    <>
                                        <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                            Aucun abonné pour le moment
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Partagez du contenu intéressant pour
                                            gagner des abonnés
                                        </p>
                                    </>
                                )}
                                {currentTab === 'Abonnements' && (
                                    <>
                                        <UserCheck className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                            Vous ne suivez encore personne
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Découvrez et suivez des personnes
                                            intéressantes
                                        </p>
                                    </>
                                )}
                                {currentTab === 'En attente' && (
                                    <>
                                        <Clock className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                            Aucune demande en attente
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Vous n'avez aucune demande de
                                            connexion en attente
                                        </p>
                                    </>
                                )}
                                {currentTab === 'Connexions' && (
                                    <>
                                        <UserPlus className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                            Aucune connexion pour le moment
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Commencez à vous connecter avec des
                                            personnes pour développer votre
                                            réseau
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Connections;
