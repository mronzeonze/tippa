// import { Link } from '@inertiajs/react';
// import moment from 'moment';
// import { useEffect, useState } from 'react';
// import { dummyRecentMessagesData } from '../assets/assets';

// const RecentMessages = () => {
//     const [messages, setMessages] = useState<any[]>([]);

//     const fetchRecentMessages = async () => {
//         setMessages(dummyRecentMessagesData as any);
//     };

//     useEffect(() => {
//         fetchRecentMessages();
//     }, []);

//     return (
//         <div className="mt-4 min-h-20 max-w-xs rounded-md bg-white p-4 text-xs text-slate-800 shadow">
//             <h3 className="text-slate-8 mb-4 font-semibold">Recent Messages</h3>
//             <div className="no-scrollbar flex max-h-56 flex-col overflow-y-scroll">
//                 {messages.map((message, index) => (
//                     <Link
//                         href={`/messages/${message.from_user_id._id}`}
//                         key={index}
//                         className="flex items-center gap-2 py-2 hover:bg-slate-100"
//                     >
//                         <img
//                             src={message.from_user_id.profile_picture}
//                             alt=""
//                             className="h-8 w-8 rounded-full"
//                         />
//                         <div className="w-full">
//                             <div className="flex justify-between">
//                                 <p className="font-medium">
//                                     {message.from_user_id.full_name}
//                                 </p>
//                                 <p className="text-[10px] text-slate-400">
//                                     {moment(message.createdAt).fromNow()}
//                                 </p>
//                             </div>
//                             <div className="flex justify-between">
//                                 <p className="text-gray-500">
//                                     {message.text ? message.text : 'Media'}
//                                 </p>
//                                 {!message.seen && (
//                                     <p className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white">
//                                         1
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
//                     </Link>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default RecentMessages;

import { router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Interface TypeScript pour les conversations
interface User {
    id: string;
    full_name: string;
    username: string;
    profile_picture: string | null;
}

interface LastMessage {
    id: string;
    text: string | null;
    message_type: 'text' | 'image';
    media_url: string | null;
    seen: boolean;
    created_at: string;
    from_user_id: string;
    to_user_id: string;
}

interface Conversation {
    user: User;
    last_message: LastMessage | null;
    unread_count: number;
}

const RecentMessages = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    // Image par défaut
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Fonction pour récupérer les messages récents
    const fetchRecentMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/recent-messages', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    // Ajouter le token CSRF si nécessaire
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Échec de la récupération des messages');
            }

            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error(
                'Erreur lors de la récupération des messages:',
                error,
            );
            toast.error('Impossible de charger les messages récents');
        } finally {
            setLoading(false);
        }
    };

    // Charger les messages au montage du composant
    useEffect(() => {
        fetchRecentMessages();

        // Optionnel: Rafraîchir toutes les 30 secondes
        const interval = setInterval(() => {
            fetchRecentMessages();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Fonction pour naviguer vers la page messages avec l'utilisateur sélectionné
    const openConversation = (userId: string) => {
        router.get(`/messages`, {
            selectedUserId: userId,
        });
    };

    // Formater le dernier message
    const formatLastMessage = (message: LastMessage | null) => {
        if (!message) return 'Pas de message';

        if (message.message_type === 'image') {
            return message.text ? `📷 ${message.text}` : '📷 Image';
        }

        return message.text || 'Message';
    };

    // État de chargement
    if (loading) {
        return (
            <div className="mt-4 min-h-20 max-w-xs rounded-md bg-white p-4 text-xs shadow">
                <h3 className="mb-4 font-semibold text-slate-800">
                    Messages récents
                </h3>
                <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600"></div>
                </div>
            </div>
        );
    }

    // État vide
    if (conversations.length === 0) {
        return (
            <div className="mt-4 min-h-20 max-w-xs rounded-md bg-white p-4 text-xs shadow">
                <h3 className="mb-4 font-semibold text-slate-800">
                    Messages récents
                </h3>
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <MessageSquare className="mb-2 h-12 w-12 text-gray-300" />
                    <p className="text-center text-xs">
                        Aucune conversation récente
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 min-h-20 max-w-xs rounded-md bg-white p-4 text-xs text-slate-800 shadow">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                    Messages récents
                </h3>
                <button
                    onClick={() => router.visit('/messages')}
                    className="text-xs text-emerald-600 transition hover:text-emerald-700 hover:underline"
                >
                    Voir tout
                </button>
            </div>

            {/* Liste des conversations */}
            <div className="no-scrollbar flex max-h-56 flex-col overflow-y-scroll">
                {conversations.map((conversation) => (
                    <button
                        key={conversation.user.id}
                        onClick={() => openConversation(conversation.user.id)}
                        className="flex w-full items-center gap-2 rounded-lg py-2 text-left transition hover:bg-slate-50"
                    >
                        {/* Photo de profil avec badge si non lu */}
                        <div className="relative">
                            <img
                                src={
                                    conversation.user.profile_picture ||
                                    defaultProfilePicture
                                }
                                alt={conversation.user.full_name}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = defaultProfilePicture;
                                }}
                            />
                            {/* Badge de messages non lus */}
                            {conversation.unread_count > 0 && (
                                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {conversation.unread_count > 9
                                        ? '9+'
                                        : conversation.unread_count}
                                </div>
                            )}
                        </div>

                        {/* Informations du message */}
                        <div className="flex-1 overflow-hidden">
                            {/* Nom et date */}
                            <div className="flex items-center justify-between">
                                <p
                                    className={`truncate font-medium ${
                                        conversation.unread_count > 0
                                            ? 'text-slate-900'
                                            : 'text-slate-700'
                                    }`}
                                >
                                    {conversation.user.full_name}
                                </p>
                                {conversation.last_message && (
                                    <p className="ml-2 text-[10px] text-slate-400">
                                        {moment(
                                            conversation.last_message
                                                .created_at,
                                        ).fromNow()}
                                    </p>
                                )}
                            </div>

                            {/* Dernier message */}
                            <div className="flex items-center justify-between">
                                <p
                                    className={`truncate ${
                                        conversation.unread_count > 0
                                            ? 'font-semibold text-slate-700'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    {formatLastMessage(
                                        conversation.last_message,
                                    )}
                                </p>

                                {/* Indicateur vu/non vu */}
                                {conversation.last_message &&
                                    conversation.unread_count === 0 && (
                                        <span className="ml-2 text-[10px] text-emerald-600">
                                            ✓
                                        </span>
                                    )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RecentMessages;
