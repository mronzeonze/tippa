// import echo from '@/echo';
// import { router, usePage } from '@inertiajs/react';
// import { useCallback, useEffect, useState } from 'react';
// import toast from 'react-hot-toast';

// interface MessageNotification {
//     message: {
//         id: string;
//         text: string;
//         message_type: string;
//         media_url: string | null;
//         created_at: string;
//         from_user_id: string;
//         to_user_id: string;
//     };
//     sender: {
//         id: string;
//         full_name: string;
//         username: string;
//         profile_picture: string | null;
//     };
    
//     notification: {
//         title: string;
//         body: string;
//         timestamp: string;
//     };
// }

// export const useMessageNotifications = () => {
//     const { auth } = usePage<any>().props;
//     const currentUser = auth?.user;

//     const [unreadCount, setUnreadCount] = useState(0);
//     const [notifications, setNotifications] = useState<MessageNotification[]>(
//         [],
//     );
//     const [isConnected, setIsConnected] = useState(false);

//     // Charger le nombre initial de messages non lus
//     useEffect(() => {
//         if (!currentUser) return;

//         fetch('/api/messages/unread-count')
//             .then((res) => res.json())
//             .then((data) => {
//                 setUnreadCount(data.unread_count || 0);
//             })
//             .catch((err) => console.error('Error fetching unread count:', err));
//     }, [currentUser]);

//     // Écouter les nouveaux messages en temps réel
//     useEffect(() => {
//         if (!currentUser) return;

//         const channel = echo.private(`user.${currentUser.id}`);

//         // Événement de connexion
//         channel.subscribed(() => {
//             console.log(`✅ Subscribed to user.${currentUser.id}`);
//             setIsConnected(true);
//         });

//         // Écouter l'événement message.sent
//         channel.listen('.message.sent', (data: MessageNotification) => {
//             console.log('🔔 New message received:', data);

//             // Ajouter aux notifications
//             setNotifications((prev) => [data, ...prev]);

//             // Incrémenter le compteur
//             setUnreadCount((prev) => prev + 1);

//             // Afficher une notification toast
//             showMessageToast(data);

//             // Jouer un son (optionnel)
//             playNotificationSound();

//             // Rafraîchir la liste des conversations si on est sur la page messages
//             if (window.location.pathname === '/messages') {
//                 router.reload({ only: ['conversations', 'unread_total'] });
//             }
//         });

//         // Nettoyage
//         return () => {
//             channel.stopListening('.message.sent');
//             echo.leave(`user.${currentUser.id}`);
//             setIsConnected(false);
//         };
//     }, [currentUser]);

//     // Afficher un toast de notification
//     const showMessageToast = (data: MessageNotification) => {
//         const defaultAvatar =
//             'http://localhost:8000/storage/images/default-avatar.jpg';

//         toast.custom(
//             (t) => (
//                 <div
//                     className={`${
//                         t.visible ? 'animate-enter' : 'animate-leave'
//                     } ring-opacity-5 pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black`}
//                     onClick={() => {
//                         toast.dismiss(t.id);
//                         router.visit(`/messages/${data.sender.id}`);
//                     }}
//                 >
//                     <div className="flex-1 p-4">
//                         <div className="flex items-start gap-3">
//                             {/* Avatar */}
//                             <img
//                                 src={
//                                     data.sender.profile_picture || defaultAvatar
//                                 }
//                                 alt={data.sender.full_name}
//                                 className="h-10 w-10 rounded-full object-cover"
//                             />

//                             {/* Contenu */}
//                             <div className="flex-1">
//                                 <p className="text-sm font-medium text-gray-900">
//                                     {data.sender.full_name}
//                                 </p>
//                                 <p className="mt-1 text-sm text-gray-500">
//                                     {data.message.message_type === 'image'
//                                         ? '📷 Image'
//                                         : data.message.text.substring(0, 50) +
//                                           (data.message.text.length > 50
//                                               ? '...'
//                                               : '')}
//                                 </p>
//                             </div>

//                             {/* Bouton fermer */}
//                             <button
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     toast.dismiss(t.id);
//                                 }}
//                                 className="flex-shrink-0 text-gray-400 hover:text-gray-500"
//                             >
//                                 <span className="sr-only">Close</span>
//                                 <svg
//                                     className="h-5 w-5"
//                                     fill="currentColor"
//                                     viewBox="0 0 20 20"
//                                 >
//                                     <path
//                                         fillRule="evenodd"
//                                         d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                                         clipRule="evenodd"
//                                     />
//                                 </svg>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             ),
//             {
//                 duration: 5000,
//                 position: 'top-right',
//             },
//         );
//     };

//     // Jouer un son de notification
//     const playNotificationSound = () => {
//         try {
//             const audio = new Audio('/sounds/notification.mp3');
//             audio.volume = 0.5;
//             audio
//                 .play()
//                 .catch((err) =>
//                     console.log('Could not play notification sound:', err),
//                 );
//         } catch (err) {
//             console.log('Notification sound not available');
//         }
//     };

//     // Marquer toutes les notifications comme lues
//     const markAllAsRead = useCallback(() => {
//         setNotifications([]);
//         setUnreadCount(0);
//     }, []);

//     return {
//         unreadCount,
//         notifications,
//         isConnected,
//         markAllAsRead,
//     };
// };

// hooks/useMessageNotifications.ts
// Version simplifiée qui utilise les props Inertia partagées

import { usePage } from '@inertiajs/react';

interface Message {
    id: string;
    text: string;
    message_type: 'text' | 'image';
    media_url?: string;
    created_at: string;
    seen: boolean;
}

interface Sender {
    id: string;
    full_name: string;
    username: string;
    profile_picture?: string;
}

interface Notification {
    sender: Sender;
    message: Message;
    unread_count: number;
}

interface SharedProps {
    auth: {
        user: any;
    };
    unread_messages?: {
        notifications: Notification[];
        unread_count: number;
    };
    [key: string]: any;
}

export function useMessageNotifications() {
    const { props } = usePage<SharedProps>();
    
    // Récupérer les données depuis les props partagées
    const notificationsData = props.unread_messages || {
        notifications: [],
        unread_count: 0
    };

    return {
        notifications: notificationsData.notifications,
        unreadCount: notificationsData.unread_count,
        isConnected: true, // Toujours connecté avec Inertia
        refresh: () => {
            // Rafraîchir via Inertia
            window.location.reload();
        }
    };
}
