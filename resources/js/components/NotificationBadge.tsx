// import { useMessageNotifications } from '@/hooks/useMessageNotifications';
// import { Link } from '@inertiajs/react';
// import { Bell, MessageSquare } from 'lucide-react';
// import { useState } from 'react';

// export const NotificationBadge = () => {
//     const { unreadCount, notifications, isConnected } =
//         useMessageNotifications();
//     const [showDropdown, setShowDropdown] = useState(false);

//     return (
//         <div className="relative">
//             {/* Bouton avec badge */}
//             <button
//                 onClick={() => setShowDropdown(!showDropdown)}
//                 className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
//             >
//                 <MessageSquare className="h-6 w-6" />

//                 {/* Badge de compteur */}
//                 {unreadCount > 0 && (
//                     <span className="absolute top-0 right-0 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
//                         {unreadCount > 9 ? '9+' : unreadCount}
//                     </span>
//                 )}

//                 {/* Indicateur de connexion */}
//                 <span
//                     className={`absolute right-0 bottom-0 h-2 w-2 rounded-full ${
//                         isConnected ? 'bg-green-500' : 'bg-gray-300'
//                     }`}
//                     title={isConnected ? 'Connecté' : 'Déconnecté'}
//                 />
//             </button>

//             {/* Dropdown des notifications */}
//             {showDropdown && (
//                 <>
//                     {/* Overlay pour fermer */}
//                     <div
//                         className="fixed inset-0 z-10"
//                         onClick={() => setShowDropdown(false)}
//                     />

//                     {/* Menu dropdown */}
//                     <div className="ring-opacity-5 absolute right-0 z-20 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black">
//                         {/* Header */}
//                         <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
//                             <h3 className="text-sm font-semibold text-gray-900">
//                                 Messages ({unreadCount})
//                             </h3>
//                             {unreadCount > 0 && (
//                                 <Link
//                                     href="/messages"
//                                     className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
//                                     onClick={() => setShowDropdown(false)}
//                                 >
//                                     Voir tout
//                                 </Link>
//                             )}
//                         </div>

//                         {/* Liste des notifications */}
//                         <div className="max-h-96 overflow-y-auto">
//                             {notifications.length > 0 ? (
//                                 notifications
//                                     .slice(0, 5)
//                                     .map((notification, index) => (
//                                         <Link
//                                             key={index}
//                                             // 🔥 CORRECTION: Redirection vers chat-box avec l'ID de l'expéditeur
//                                             href={`/api/messages/${notification.sender.id}`}
//                                             className="flex items-start gap-3 border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50"
//                                             onClick={() =>
//                                                 setShowDropdown(false)
//                                             }
//                                         >
//                                             {/* Avatar */}
//                                             <div className="relative flex-shrink-0">
//                                                 <img
//                                                     src={
//                                                         notification.sender
//                                                             .profile_picture ||
//                                                         'http://localhost:8000/storage/images/default-avatar.jpg'
//                                                     }
//                                                     alt={
//                                                         notification.sender
//                                                             .full_name
//                                                     }
//                                                     className="h-10 w-10 rounded-full object-cover"
//                                                     onError={(e) => {
//                                                         e.currentTarget.src =
//                                                             'http://localhost:8000/storage/images/default-avatar.jpg';
//                                                     }}
//                                                 />
//                                                 {/* Indicateur de message non lu */}
//                                                 <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-blue-500"></span>
//                                             </div>

//                                             {/* Contenu */}
//                                             <div className="min-w-0 flex-1">
//                                                 <div className="mb-1 flex items-center justify-between">
//                                                     <p className="text-sm font-semibold text-gray-900">
//                                                         {
//                                                             notification.sender
//                                                                 .full_name
//                                                         }
//                                                     </p>
//                                                     <p className="text-xs text-gray-400">
//                                                         {new Date(
//                                                             notification.notification.timestamp,
//                                                         ).toLocaleTimeString(
//                                                             'fr-FR',
//                                                             {
//                                                                 hour: '2-digit',
//                                                                 minute: '2-digit',
//                                                             },
//                                                         )}
//                                                     </p>
//                                                 </div>

//                                                 {/* Aperçu du message */}
//                                                 <p className="truncate text-sm text-gray-600">
//                                                     {notification.message
//                                                         .message_type ===
//                                                     'image' ? (
//                                                         <span className="flex items-center gap-1">
//                                                             <span>📷</span>
//                                                             <span>
//                                                                 {notification
//                                                                     .message
//                                                                     .text ||
//                                                                     'Image'}
//                                                             </span>
//                                                         </span>
//                                                     ) : (
//                                                         notification.message
//                                                             .text
//                                                     )}
//                                                 </p>

//                                                 {/* Username */}
//                                                 <p className="mt-0.5 text-xs text-gray-400">
//                                                     @
//                                                     {notification.sender
//                                                         .username ||
//                                                         notification.sender
//                                                             .full_name}
//                                                 </p>
//                                             </div>
//                                         </Link>
//                                     ))
//                             ) : (
//                                 <div className="px-4 py-8 text-center">
//                                     <Bell className="mx-auto h-8 w-8 text-gray-400" />
//                                     <p className="mt-2 text-sm text-gray-500">
//                                         Aucun nouveau message
//                                     </p>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Footer */}
//                         {notifications.length > 5 && (
//                             <div className="border-t border-gray-200 px-4 py-2 text-center">
//                                 <Link
//                                     href="/messages"
//                                     className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
//                                     onClick={() => setShowDropdown(false)}
//                                 >
//                                     Voir tous les messages ({unreadCount})
//                                 </Link>
//                             </div>
//                         )}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { Link } from '@inertiajs/react';
import { Bell, MessageSquare, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export const NotificationBadge = () => {
    const { unreadCount, notifications, isConnected } =
        useMessageNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const [animatePulse, setAnimatePulse] = useState(false);

    // Animation du badge quand nouveau message
    useEffect(() => {
        if (unreadCount > 0) {
            setAnimatePulse(true);
            const timer = setTimeout(() => setAnimatePulse(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [unreadCount]);

    // Fermer le dropdown avec Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowDropdown(false);
        };

        if (showDropdown) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [showDropdown]);

    // Formater l'heure relative
    const getRelativeTime = (timestamp: string) => {
        const now = new Date().getTime();
        const messageTime = new Date(timestamp).getTime();
        const diffMinutes = Math.floor((now - messageTime) / 60000);

        if (diffMinutes < 1) return "À l'instant";
        if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `Il y a ${diffHours}h`;

        const diffDays = Math.floor(diffHours / 24);
        return `Il y a ${diffDays}j`;
    };

    return (
        <div className="relative">
            {/* Bouton principal */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="group relative rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                aria-label={`Messages (${unreadCount} non lus)`}
            >
                <MessageSquare className="h-6 w-6 transition-transform group-hover:scale-110" />

                {/* Badge de compteur avec animation */}
                {unreadCount > 0 && (
                    <span
                        className={`absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1 text-xs font-bold text-white shadow-lg transition-all ${animatePulse ? 'animate-bounce' : ''} `}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* Indicateur de connexion WebSocket */}
                <span
                    className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white transition-all ${isConnected ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-300'} `}
                    title={
                        isConnected ? 'Connecté en temps réel' : 'Déconnecté'
                    }
                />
            </button>

            {/* Dropdown des notifications */}
            {showDropdown && (
                <>
                    {/* Overlay semi-transparent */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm duration-200 animate-in fade-in"
                        onClick={() => setShowDropdown(false)}
                    />

                    {/* Menu dropdown */}
                    <div className="absolute right-0 z-50 mt-2 w-96 duration-300 animate-in slide-in-from-top-2">
                        <div className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
                            {/* Header avec gradient */}
                            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-white" />
                                        <h3 className="font-semibold text-white">
                                            Messages
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setShowDropdown(false)}
                                        className="rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Indicateur de connexion */}
                                <div className="mt-2 flex items-center gap-2 text-xs text-white/90">
                                    <div
                                        className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-300' : 'bg-white/50'}`}
                                    />
                                    <span>
                                        {isConnected
                                            ? 'Connecté'
                                            : 'Déconnecté'}
                                    </span>
                                </div>
                            </div>

                            {/* Liste des notifications */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {notifications
                                            .slice(0, 5)
                                            .map((notification, index) => (
                                                <Link
                                                    key={index}
                                                    href={`/messages?selectedUserId=${notification.sender.id}`}
                                                    className="group flex items-start gap-3 bg-gradient-to-r from-blue-50/50 to-transparent px-4 py-3 transition-all hover:from-blue-50 hover:to-blue-50/30"
                                                    onClick={() =>
                                                        setShowDropdown(false)
                                                    }
                                                >
                                                    {/* Avatar avec indicateur */}
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={
                                                                notification
                                                                    .sender
                                                                    .profile_picture ||
                                                                'http://localhost:8000/storage/images/default-avatar.jpg'
                                                            }
                                                            alt={
                                                                notification
                                                                    .sender
                                                                    .full_name
                                                            }
                                                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white transition-transform group-hover:scale-105"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    'http://localhost:8000/storage/images/default-avatar.jpg';
                                                            }}
                                                        />
                                                        {/* Point bleu de notification */}
                                                        <span className="absolute right-0 bottom-0 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-blue-500 shadow-lg" />
                                                    </div>

                                                    {/* Contenu du message */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex items-start justify-between gap-2">
                                                            <p className="font-semibold text-gray-900 group-hover:text-emerald-600">
                                                                {
                                                                    notification
                                                                        .sender
                                                                        .full_name
                                                                }
                                                            </p>
                                                            <span className="flex-shrink-0 text-xs text-gray-500">
                                                                {getRelativeTime(
                                                                    notification
                                                                        .notification
                                                                        .timestamp,
                                                                )}
                                                            </span>
                                                        </div>

                                                        <p className="mb-1 text-xs text-gray-500">
                                                            @
                                                            {
                                                                notification
                                                                    .sender
                                                                    .username
                                                            }
                                                        </p>

                                                        {/* Aperçu du message */}
                                                        <div className="flex items-start gap-1">
                                                            {notification
                                                                .message
                                                                .message_type ===
                                                                'image' && (
                                                                <span className="text-sm">
                                                                    📷
                                                                </span>
                                                            )}
                                                            <p className="line-clamp-2 text-sm text-gray-700">
                                                                {notification
                                                                    .message
                                                                    .message_type ===
                                                                'image'
                                                                    ? notification
                                                                          .message
                                                                          .text ||
                                                                      'Vous a envoyé une image'
                                                                    : notification
                                                                          .message
                                                                          .text}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Flèche indicatrice */}
                                                    <div className="flex-shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            ))}
                                    </div>
                                ) : (
                                    /* État vide */
                                    <div className="px-4 py-12 text-center">
                                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                            <Bell className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="mb-1 font-medium text-gray-900">
                                            Aucun nouveau message
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Vos conversations apparaîtront ici
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                                    <Link
                                        href="/messages"
                                        className="block text-center text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        {notifications.length > 5
                                            ? `Voir tous les messages (${unreadCount})`
                                            : 'Ouvrir la messagerie'}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};