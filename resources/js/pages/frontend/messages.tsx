// import echo from '@/echo';
// import AppLayout from '@/layouts/app-layout';
// import type { Conversation, MessagePageProps } from '@/types/message';
// import { Message } from '@/types/message';
// import { router, usePage } from '@inertiajs/react';
// import {
//     ArrowLeft,
//     Edit,
//     Image as ImageIcon,
//     MessageSquare,
//     MoreVertical,
//     Paperclip,
//     Search,
//     Smile,
//     Star,
//     Trash2,
//     X,
// } from 'lucide-react';
// import moment from 'moment';
// import { useEffect, useRef, useState } from 'react';
// import toast from 'react-hot-toast';

// const Messages = () => {
//     const {
//         conversations: initialConversations,
//         unread_total,
//         auth,
//     } = usePage<MessagePageProps>().props;

//     const [conversations, setConversations] = useState<Conversation[]>(
//         initialConversations || [],
//     );
//     const [selectedConversation, setSelectedConversation] =
//         useState<Conversation | null>(null);
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [text, setText] = useState('');
//     const [image, setImage] = useState<File | null>(null);
//     const [imagePreview, setImagePreview] = useState<string | null>(null);
//     const [sending, setSending] = useState(false);
//     const [filterTab, setFilterTab] = useState('Prioritaire');
//     const [loadingMessages, setLoadingMessages] = useState(false);

//     const messagesEndRef = useRef<HTMLDivElement>(null);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const searchParams = new URLSearchParams(window.location.search);
//     const selectedUserId = searchParams.get('selectedUserId');

//     const currentUser = auth.user;
//     const defaultProfilePicture =
//         'http://localhost:8000/storage/images/default-avatar.jpg';

//     // Écoute en temps réel
//     useEffect(() => {
//         if (!currentUser || !selectedConversation) return;

//         const channel = echo.private(`user.${currentUser.id}`);

//         channel.listen('.message.sent', (data: any) => {
//             if (data.message.from_user_id === selectedConversation.user.id) {
//                 const newMessage: Message = {
//                     id: data.message.id,
//                     from_user_id: data.message.from_user_id,
//                     to_user_id: data.message.to_user_id,
//                     text: data.message.text,
//                     message_type: data.message.message_type,
//                     media_url: data.message.media_url,
//                     seen: false,
//                     created_at: data.message.created_at,
//                     updated_at: data.message.created_at,
//                     sender: data.sender,
//                     receiver: currentUser,
//                 };

//                 setMessages((prev) => [...prev, newMessage]);

//                 setTimeout(() => {
//                     fetch(`/api/messages/${newMessage.id}/mark-as-read`, {
//                         method: 'PATCH',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'X-CSRF-TOKEN':
//                                 document
//                                     .querySelector('meta[name="csrf-token"]')
//                                     ?.getAttribute('content') || '',
//                         },
//                     });
//                 }, 1000);
//             }
//         });

//         return () => {
//             channel.stopListening('.message.sent');
//         };
//     }, [currentUser, selectedConversation]);

//     useEffect(() => {
//         if (selectedUserId && conversations.length > 0) {
//             const conversation = conversations.find(
//                 (conv) => conv.user.id === selectedUserId,
//             );

//             if (conversation) {
//                 // Charger automatiquement cette conversation
//                 loadConversationMessages(conversation);
//             }
//         }
//     }, [selectedUserId, conversations]);

//     // Charger les messages via fetch API
//     const loadConversationMessages = async (conversation: Conversation) => {
//         setSelectedConversation(conversation);
//         setLoadingMessages(true);

//         try {
//             const response = await fetch(
//                 `/api/messages/${conversation.user.id}`,
//                 {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Accept: 'application/json',
//                         'X-Requested-With': 'XMLHttpRequest',
//                         'X-CSRF-TOKEN':
//                             document
//                                 .querySelector('meta[name="csrf-token"]')
//                                 ?.getAttribute('content') || '',
//                     },
//                     credentials: 'same-origin',
//                 },
//             );

//             if (!response.ok) {
//                 throw new Error('Erreur de chargement');
//             }

//             const data = await response.json();

//             if (data.messages) {
//                 setMessages(data.messages);
//             }
//         } catch (error) {
//             console.error('Error loading messages:', error);
//             toast.error('Erreur lors du chargement des messages');
//         } finally {
//             setLoadingMessages(false);
//         }
//     };

//     // Envoyer un message
//     const sendMessage = () => {
//         if (!text.trim() && !image) {
//             toast.error('Veuillez entrer un message ou sélectionner une image');
//             return;
//         }

//         if (!selectedConversation) return;
//         if (sending) return;

//         setSending(true);

//         const formData = new FormData();
//         formData.append('to_user_id', selectedConversation.user.id);

//         if (text.trim()) {
//             formData.append('text', text.trim());
//         }

//         if (image) {
//             formData.append('media', image);
//         }

//         router.post('/messages', formData, {
//             preserveScroll: true,
//             preserveState: true,
//             forceFormData: true,
//             onSuccess: () => {
//                 setText('');
//                 setImage(null);
//                 setImagePreview(null);
//                 if (fileInputRef.current) {
//                     fileInputRef.current.value = '';
//                 }

//                 // Recharger les messages de la conversation
//                 setTimeout(() => {
//                     loadConversationMessages(selectedConversation);
//                 }, 300);
//             },
//             onError: (errors) => {
//                 console.error('Send message errors:', errors);
//                 const errorMessage = Object.values(errors)[0] as string;
//                 toast.error(errorMessage || "Échec de l'envoi du message");
//             },
//             onFinish: () => {
//                 setSending(false);
//             },
//         });
//     };

//     // Supprimer un message
//     const deleteMessage = (messageId: string) => {
//         if (!confirm('Supprimer ce message ?')) return;

//         router.delete(`/messages/${messageId}`, {
//             preserveState: true,
//             preserveScroll: true,
//             onSuccess: () => {
//                 toast.success('Message supprimé !');
//                 if (selectedConversation) {
//                     loadConversationMessages(selectedConversation);
//                 }
//             },
//             onError: () => {
//                 toast.error('Échec de la suppression du message');
//             },
//         });
//     };

//     const formatLastMessage = (message: Conversation['last_message']) => {
//         if (!message) return 'Aucun message';
//         if (message.message_type === 'image') {
//             return message.text ? `📷 ${message.text}` : '📷 Image';
//         }
//         return message.text || 'Message';
//     };

//     const filteredConversations = conversations.filter(
//         (conv) =>
//             conv.user.full_name
//                 .toLowerCase()
//                 .includes(searchQuery.toLowerCase()) ||
//             conv.user.username
//                 .toLowerCase()
//                 .includes(searchQuery.toLowerCase()),
//     );

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     useEffect(() => {
//         if (image) {
//             const objectUrl = URL.createObjectURL(image);
//             setImagePreview(objectUrl);
//             return () => URL.revokeObjectURL(objectUrl);
//         } else {
//             setImagePreview(null);
//         }
//     }, [image]);

//     return (
//         // 🔥 MASQUER LA SIDEBAR GAUCHE DU LAYOUT
//         <AppLayout
//             showLeftSidebar={false}
//             showRecentMessages={false}
//             showCreatePostWidget={false}
//         >
//             {/* 🔥 CONTAINER PRINCIPAL - HAUTEUR FIXE, PAS DE SCROLL */}
//             {/* <div className="-m-6 flex h-screen overflow-hidden bg-gray-50 p-6"> */}
//             <div
//                 className="flex overflow-hidden rounded-xl bg-gray-50 shadow-lg"
//                 style={{
//                     height: 'calc(98vh - 100px)', // 64px navbar + 24px padding
//                 }}
//             >
//                 {/* ========================================
//                     SIDEBAR GAUCHE - LISTE DES CONVERSATIONS
//                 ======================================== */}
//                 <div
//                     className={`${
//                         selectedConversation ? 'hidden md:flex' : 'flex'
//                     } w-full flex-col border-r border-gray-200 bg-white md:w-96`}
//                 >
//                     {/* Header fixe - Titre + Recherche */}
//                     <div className="flex-shrink-0 border-b border-gray-200 p-4">
//                         <div className="mb-4 flex items-center justify-between">
//                             <h1 className="text-2xl font-bold text-gray-900">
//                                 Messagerie
//                             </h1>
//                             <div className="flex items-center gap-2">
//                                 <button className="rounded-lg p-2 transition hover:bg-gray-100">
//                                     <MoreVertical className="h-5 w-5 text-gray-600" />
//                                 </button>
//                                 <button
//                                     onClick={() => router.visit('/connections')}
//                                     className="rounded-lg p-2 transition hover:bg-gray-100"
//                                 >
//                                     <Edit className="h-5 w-5 text-gray-600" />
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Barre de recherche */}
//                         <div className="relative">
//                             <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Rechercher dans les messages"
//                                 className="w-full rounded-lg border-none bg-blue-50 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                         </div>
//                     </div>

//                     {/* Filtres - fixe */}
//                     <div className="flex flex-shrink-0 gap-2 overflow-x-auto border-b border-gray-200 px-4 py-3">
//                         {['Prioritaire', 'Non lus', 'Groupes'].map((tab) => (
//                             <button
//                                 key={tab}
//                                 onClick={() => setFilterTab(tab)}
//                                 className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
//                                     filterTab === tab
//                                         ? 'bg-green-700 text-white'
//                                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                                 }`}
//                             >
//                                 {tab}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Liste des conversations - SCROLLABLE */}
//                     <div className="flex-1 overflow-y-auto">
//                         {filteredConversations.length > 0 ? (
//                             filteredConversations.map((conversation) => (
//                                 <div
//                                     key={conversation.user.id}
//                                     onClick={() =>
//                                         loadConversationMessages(conversation)
//                                     }
//                                     className={`flex cursor-pointer items-start gap-3 border-l-4 p-4 transition hover:bg-gray-50 ${
//                                         selectedConversation?.user.id ===
//                                         conversation.user.id
//                                             ? 'border-blue-600 bg-blue-50'
//                                             : 'border-transparent'
//                                     }`}
//                                 >
//                                     {/* Photo de profil avec indicateur en ligne */}
//                                     <div className="relative flex-shrink-0">
//                                         <img
//                                             src={
//                                                 conversation.user
//                                                     .profile_picture ||
//                                                 defaultProfilePicture
//                                             }
//                                             alt={conversation.user.full_name}
//                                             className="h-14 w-14 rounded-full object-cover"
//                                             onError={(e) => {
//                                                 e.currentTarget.src =
//                                                     defaultProfilePicture;
//                                             }}
//                                         />
//                                         {conversation.user.is_online && (
//                                             <div className="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
//                                         )}
//                                     </div>

//                                     {/* Infos conversation */}
//                                     <div className="min-w-0 flex-1">
//                                         <div className="mb-1 flex items-start justify-between gap-2">
//                                             <p
//                                                 className={`truncate text-sm font-semibold ${
//                                                     conversation.unread_count >
//                                                     0
//                                                         ? 'text-gray-900'
//                                                         : 'text-gray-700'
//                                                 }`}
//                                             >
//                                                 {conversation.user.full_name}
//                                             </p>
//                                             {conversation.last_message && (
//                                                 <span className="flex-shrink-0 text-xs text-gray-500">
//                                                     {moment(
//                                                         conversation
//                                                             .last_message
//                                                             .created_at,
//                                                     ).format('D MMM')}
//                                                 </span>
//                                             )}
//                                         </div>

//                                         {conversation.last_message && (
//                                             <div className="flex items-center justify-between gap-2">
//                                                 <p
//                                                     className={`truncate text-sm ${
//                                                         conversation.unread_count >
//                                                         0
//                                                             ? 'font-semibold text-gray-900'
//                                                             : 'text-gray-600'
//                                                     }`}
//                                                 >
//                                                     {formatLastMessage(
//                                                         conversation.last_message,
//                                                     )}
//                                                 </p>
//                                                 {conversation.unread_count >
//                                                     0 && (
//                                                     <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
//                                                         <span className="text-xs font-bold text-white">
//                                                             {conversation.unread_count >
//                                                             9
//                                                                 ? '9+'
//                                                                 : conversation.unread_count}
//                                                         </span>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}

//                                         <p className="mt-0.5 text-xs text-gray-500">
//                                             @{conversation.user.username}
//                                         </p>
//                                     </div>

//                                     {/* Actions (étoile + menu) */}
//                                     <div className="flex flex-shrink-0 flex-col gap-1">
//                                         <button
//                                             onClick={(e) => e.stopPropagation()}
//                                             className="rounded p-1 hover:bg-gray-200"
//                                         >
//                                             <Star className="h-4 w-4 text-gray-400" />
//                                         </button>
//                                         <button
//                                             onClick={(e) => e.stopPropagation()}
//                                             className="rounded p-1 hover:bg-gray-200"
//                                         >
//                                             <MoreVertical className="h-4 w-4 text-gray-400" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             // État vide
//                             <div className="flex h-full flex-col items-center justify-center p-8 text-center">
//                                 <MessageSquare className="mb-4 h-16 w-16 text-gray-300" />
//                                 <p className="mb-2 font-medium text-gray-600">
//                                     Aucune conversation
//                                 </p>
//                                 <p className="text-sm text-gray-500">
//                                     Commencez à discuter avec vos connexions
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* ========================================
//                     ZONE DE CHAT À DROITE
//                 ======================================== */}
//                 <div
//                     className={`${
//                         !selectedConversation ? 'hidden md:flex' : 'flex'
//                     } flex-1 flex-col bg-white`}
//                 >
//                     {selectedConversation ? (
//                         <>
//                             {/* Header conversation - FIXE EN HAUT */}
//                             <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 p-4">
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         {/* Bouton retour (mobile) */}
//                                         <button
//                                             onClick={() =>
//                                                 setSelectedConversation(null)
//                                             }
//                                             className="rounded-lg p-2 hover:bg-gray-200 md:hidden"
//                                         >
//                                             <ArrowLeft className="h-5 w-5" />
//                                         </button>

//                                         {/* Photo de profil */}
//                                         <img
//                                             src={
//                                                 selectedConversation.user
//                                                     .profile_picture ||
//                                                 defaultProfilePicture
//                                             }
//                                             alt={
//                                                 selectedConversation.user
//                                                     .full_name
//                                             }
//                                             className="h-12 w-12 rounded-full object-cover"
//                                             onError={(e) => {
//                                                 e.currentTarget.src =
//                                                     defaultProfilePicture;
//                                             }}
//                                         />

//                                         {/* Nom et statut */}
//                                         <div>
//                                             <p className="font-semibold text-gray-900">
//                                                 {
//                                                     selectedConversation.user
//                                                         .full_name
//                                                 }
//                                             </p>
//                                             <p className="text-sm text-gray-600">
//                                                 {selectedConversation.user
//                                                     .is_online
//                                                     ? 'En ligne'
//                                                     : `Vu ${moment(
//                                                           selectedConversation
//                                                               .last_message
//                                                               ?.created_at,
//                                                       ).fromNow()}`}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* Actions header */}
//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             onClick={() =>
//                                                 router.visit(
//                                                     `/profile/${selectedConversation.user.id}`,
//                                                 )
//                                             }
//                                             className="rounded-lg px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
//                                         >
//                                             Voir le profil
//                                         </button>
//                                         <button className="rounded-lg p-2 hover:bg-gray-200">
//                                             <MoreVertical className="h-5 w-5 text-gray-600" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Zone des messages - SCROLLABLE */}
//                             <div className="flex-1 space-y-6 overflow-y-auto p-6">
//                                 {loadingMessages ? (
//                                     // Loading spinner
//                                     <div className="flex h-full items-center justify-center">
//                                         <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
//                                     </div>
//                                 ) : messages.length > 0 ? (
//                                     // Liste des messages
//                                     messages
//                                         .sort(
//                                             (a, b) =>
//                                                 new Date(
//                                                     a.created_at,
//                                                 ).getTime() -
//                                                 new Date(
//                                                     b.created_at,
//                                                 ).getTime(),
//                                         )
//                                         .map((message, index) => {
//                                             const isSentByMe =
//                                                 message.from_user_id ===
//                                                 currentUser.id;
//                                             const showDate =
//                                                 index === 0 ||
//                                                 !moment(
//                                                     message.created_at,
//                                                 ).isSame(
//                                                     messages[index - 1]
//                                                         .created_at,
//                                                     'day',
//                                                 );

//                                             return (
//                                                 <div key={message.id}>
//                                                     {/* Séparateur de date */}
//                                                     {showDate && (
//                                                         <div className="my-4 flex items-center justify-center">
//                                                             <div className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
//                                                                 {moment(
//                                                                     message.created_at,
//                                                                 ).format(
//                                                                     'D MMMM YYYY',
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     )}

//                                                     {/* Message */}
//                                                     <div
//                                                         className={`flex items-start gap-3 ${
//                                                             isSentByMe
//                                                                 ? 'flex-row-reverse'
//                                                                 : ''
//                                                         }`}
//                                                     >
//                                                         {/* Avatar (uniquement pour messages reçus) */}
//                                                         {!isSentByMe && (
//                                                             <img
//                                                                 src={
//                                                                     selectedConversation
//                                                                         .user
//                                                                         .profile_picture ||
//                                                                     defaultProfilePicture
//                                                                 }
//                                                                 alt=""
//                                                                 className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
//                                                             />
//                                                         )}

//                                                         {/* Bulle de message */}
//                                                         <div
//                                                             className={`group relative max-w-xl ${
//                                                                 isSentByMe
//                                                                     ? 'items-end'
//                                                                     : ''
//                                                             }`}
//                                                         >
//                                                             <div
//                                                                 className={`rounded-2xl px-4 py-2 ${
//                                                                     isSentByMe
//                                                                         ? 'bg-blue-600 text-white'
//                                                                         : 'bg-gray-100 text-gray-900'
//                                                                 } max-w-full overflow-hidden break-words`}
//                                                             >
//                                                                 {/* Image si présente */}
//                                                                 {message.message_type ===
//                                                                     'image' &&
//                                                                     message.media_url && (
//                                                                         <img
//                                                                             src={
//                                                                                 message.media_url
//                                                                             }
//                                                                             alt="Attachment"
//                                                                             className="mb-2 max-w-full rounded-lg"
//                                                                         />
//                                                                     )}

//                                                                 {/* Texte */}
//                                                                 {message.text && (
//                                                                     <p className="word-break-break-word text-sm break-all">
//                                                                         {
//                                                                             message.text
//                                                                         }
//                                                                     </p>
//                                                                 )}
//                                                             </div>

//                                                             {/* Heure et statut */}
//                                                             <div
//                                                                 className={`mt-1 flex items-center gap-2 text-xs text-gray-500 ${
//                                                                     isSentByMe
//                                                                         ? 'justify-end'
//                                                                         : ''
//                                                                 }`}
//                                                             >
//                                                                 <span>
//                                                                     {moment(
//                                                                         message.created_at,
//                                                                     ).format(
//                                                                         'HH:mm',
//                                                                     )}
//                                                                 </span>
//                                                                 {isSentByMe && (
//                                                                     <span>
//                                                                         {message.seen
//                                                                             ? '✓✓'
//                                                                             : '✓'}
//                                                                     </span>
//                                                                 )}
//                                                             </div>

//                                                             {/* Bouton supprimer (hover) */}
//                                                             {isSentByMe && (
//                                                                 <button
//                                                                     onClick={() =>
//                                                                         deleteMessage(
//                                                                             message.id,
//                                                                         )
//                                                                     }
//                                                                     className="absolute top-1/2 -right-6 -translate-y-1/2 rounded-full bg-red-100 p-1.5 text-red-600 opacity-0 transition group-hover:opacity-100 hover:bg-red-200"
//                                                                 >
//                                                                     <Trash2 className="h-3 w-3" />
//                                                                 </button>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             );
//                                         })
//                                 ) : (
//                                     // État vide (pas de messages)
//                                     <div className="flex h-full flex-col items-center justify-center">
//                                         <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
//                                             <MessageSquare className="h-8 w-8 text-blue-600" />
//                                         </div>
//                                         <p className="mb-1 font-medium text-gray-900">
//                                             Commencez la conversation
//                                         </p>
//                                         <p className="text-sm text-gray-600">
//                                             Envoyez votre premier message à{' '}
//                                             {
//                                                 selectedConversation.user
//                                                     .full_name
//                                             }
//                                         </p>
//                                     </div>
//                                 )}
//                                 {/* Référence pour auto-scroll */}
//                                 <div ref={messagesEndRef} />
//                             </div>

//                             {/* Zone de saisie - FIXÉE EN BAS */}
//                             <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
//                                 {/* Prévisualisation image */}
//                                 {imagePreview && (
//                                     <div className="mb-3 flex items-center">
//                                         <div className="relative">
//                                             <img
//                                                 src={imagePreview}
//                                                 alt="Preview"
//                                                 className="h-20 rounded-lg"
//                                             />
//                                             <button
//                                                 onClick={() => {
//                                                     setImage(null);
//                                                     setImagePreview(null);
//                                                     if (fileInputRef.current) {
//                                                         fileInputRef.current.value =
//                                                             '';
//                                                     }
//                                                 }}
//                                                 className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
//                                             >
//                                                 <X className="h-3 w-3" />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Formulaire d'envoi */}
//                                 <div className="flex items-end gap-2">
//                                     <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-3">
//                                         {/* Textarea */}
//                                         <textarea
//                                             placeholder="Rédigez un message..."
//                                             className="w-full resize-none bg-transparent text-sm outline-none"
//                                             rows={1}
//                                             value={text}
//                                             onChange={(e) =>
//                                                 setText(e.target.value)
//                                             }
//                                             onKeyDown={(e) => {
//                                                 if (
//                                                     e.key === 'Enter' &&
//                                                     !e.shiftKey &&
//                                                     !sending
//                                                 ) {
//                                                     e.preventDefault();
//                                                     sendMessage();
//                                                 }
//                                             }}
//                                             disabled={sending}
//                                         />

//                                         {/* Barre d'actions */}
//                                         <div className="mt-2 flex items-center justify-between">
//                                             <div className="flex items-center gap-1">
//                                                 {/* Upload image */}
//                                                 <label
//                                                     htmlFor="image-upload"
//                                                     className="cursor-pointer rounded-lg p-2 transition hover:bg-gray-200"
//                                                 >
//                                                     <ImageIcon className="h-5 w-5 text-gray-600" />
//                                                     <input
//                                                         ref={fileInputRef}
//                                                         id="image-upload"
//                                                         type="file"
//                                                         hidden
//                                                         accept="image/*"
//                                                         disabled={sending}
//                                                         onChange={(e) => {
//                                                             const files =
//                                                                 e.target.files;
//                                                             if (
//                                                                 files &&
//                                                                 files[0]
//                                                             ) {
//                                                                 setImage(
//                                                                     files[0],
//                                                                 );
//                                                             }
//                                                         }}
//                                                     />
//                                                 </label>
//                                                 {/* Autres actions */}
//                                                 <button className="rounded-lg p-2 transition hover:bg-gray-200">
//                                                     <Paperclip className="h-5 w-5 text-gray-600" />
//                                                 </button>
//                                                 <button className="rounded-lg p-2 transition hover:bg-gray-200">
//                                                     <Smile className="h-5 w-5 text-gray-600" />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </>
//                     ) : (
//                         <div className="flex h-full flex-col items-center justify-center">
//                             <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
//                                 <MessageSquare className="h-12 w-12 text-gray-400" />
//                             </div>
//                             <h2 className="mb-2 text-2xl font-bold text-gray-900">
//                                 Sélectionnez une conversation
//                             </h2>
//                             <p className="mb-6 text-gray-600">
//                                 Choisissez une conversation dans la liste pour
//                                 commencer à discuter
//                             </p>
//                             {conversations.length === 0 && (
//                                 <button
//                                     onClick={() => router.visit('/connections')}
//                                     className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
//                                 >
//                                     Trouver des connexions
//                                 </button>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </AppLayout>
//     );
// };
// export default Messages;

// // // messages.tsx
// // // Page affichant la liste de toutes les conversations de l'utilisateur

// // // Import des composants et utilitaires
// // import { bgGradient } from '@/components/assets/assets';
// // import AppLayout from '@/layouts/app-layout';
// // import type { Conversation, MessagePageProps } from '@/types/message';
// // import { router, usePage } from '@inertiajs/react';
// // import { Eye, MessageSquare } from 'lucide-react';
// // import moment from 'moment';
// // import { useEffect, useState } from 'react';

// // const Messages = () => {
// //     // Récupération des données depuis Inertia
// //     const {
// //         conversations: initialConversations,
// //         unread_total,
// //         selected_user_id,
// //         auth,
// //     } = usePage<MessagePageProps>().props;

// //     // État local pour les conversations
// //     const [conversations, setConversations] = useState<Conversation[]>(
// //         initialConversations || [],
// //     );

// //     // Utilisateur connecté
// //     const currentUser = auth.user;

// //     // Image par défaut
// //     const defaultProfilePicture =
// //         'http://localhost:8000/storage/images/default-avatar.jpg';

// //     // Fonction pour ouvrir une conversation
// //     const openConversation = (userId: string) => {
// //         // Navigation vers la page de chat avec cet utilisateur
// //         router.get(`/messages/${userId}`);
// //     };

// //     // Fonction pour voir le profil d'un utilisateur
// //     const viewProfile = (userId: string) => {
// //         router.get(`/profile/${userId}`);
// //     };

// //     // Fonction pour rafraîchir la liste des conversations
// //     const refreshConversations = () => {
// //         router.get(
// //             '/messages',
// //             {},
// //             {
// //                 preserveScroll: true,
// //                 preserveState: true,
// //                 only: ['conversations', 'unread_total'],
// //                 onSuccess: (page) => {
// //                     const newData = page.props as unknown as MessagePageProps;
// //                     if (newData.conversations) {
// //                         setConversations(newData.conversations);
// //                     }
// //                 },
// //             },
// //         );
// //     };

// //     // Fonction pour formater le dernier message
// //     const formatLastMessage = (message: Conversation['last_message']) => {
// //         if (!message) return 'pas de message';

// //         if (message.message_type === 'image') {
// //             return message.text ? `📷 ${message.text}` : '📷 Image';
// //         }

// //         return message.text || 'Message';
// //     };

// //     // Ouvrir automatiquement une conversation si selected_user_id est fourni
// //     useEffect(() => {
// //         if (selected_user_id) {
// //             // Trouver la conversation correspondante
// //             const selectedConversation = conversations.find(
// //                 (conv) => conv.user.id === selected_user_id,
// //             );

// //             if (selectedConversation) {
// //                 // Ouvrir automatiquement cette conversation
// //                 openConversation(selected_user_id);
// //             }
// //         }
// //     }, [selected_user_id]);

// //     // Rafraîchir les conversations toutes les 10 secondes
// //     useEffect(() => {
// //         const interval = setInterval(() => {
// //             refreshConversations();
// //         }, 10000); // 10 secondes

// //         return () => clearInterval(interval);
// //     }, []);

// //     return (
// //         <AppLayout>
// //             <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white">
// //                 <div className="mx-auto max-w-6xl p-6">
// //                     {/* Header avec titre et badge de messages non lus */}
// //                     <div className="mb-8 flex items-center justify-between">
// //                         <div>
// //                             <h1 className="mb-2 text-3xl font-bold text-slate-900">
// //                                 Messages
// //                             </h1>
// //                             <p className="text-slate-600">
// //                                 Parler à vos amis et à votre famille
// //                             </p>
// //                         </div>

// //                         {/* Badge nombre total de messages non lus */}
// //                         {unread_total && unread_total > 0 && (
// //                             <div className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-2">
// //                                 <span className="text-sm font-semibold text-red-600">
// //                                     {unread_total} message
// //                                     {unread_total > 1 ? 's' : ''} non lus
// //                                 </span>
// //                             </div>
// //                         )}
// //                     </div>

// //                     {/* Liste des conversations */}
// //                     {conversations.length > 0 ? (
// //                         <div className="flex flex-col gap-3">
// //                             {conversations.map((conversation) => (
// //                                 <div
// //                                     key={conversation.user.id}
// //                                     className={`flex max-w-2xl cursor-pointer gap-5 rounded-xl bg-white p-6 shadow transition hover:shadow-lg ${
// //                                         conversation.unread_count > 0
// //                                             ? 'border-2 border-indigo-200'
// //                                             : ''
// //                                     } ${
// //                                         selected_user_id ===
// //                                         conversation.user.id
// //                                             ? 'ring-2 ring-emerald-500'
// //                                             : ''
// //                                     }`}
// //                                     onClick={() =>
// //                                         openConversation(conversation.user.id)
// //                                     }
// //                                 >
// //                                     {/* Photo de profil avec badge de statut */}
// //                                     <div className="relative">
// //                                         <img
// //                                             src={
// //                                                 conversation.user
// //                                                     .profile_picture ||
// //                                                 defaultProfilePicture
// //                                             }
// //                                             alt={conversation.user.full_name}
// //                                             className="size-14 rounded-full object-cover"
// //                                             onError={(e) => {
// //                                                 e.currentTarget.src =
// //                                                     defaultProfilePicture;
// //                                             }}
// //                                         />

// //                                         {/* Badge de messages non lus */}
// //                                         {conversation.unread_count > 0 && (
// //                                             <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow">
// //                                                 {conversation.unread_count > 9
// //                                                     ? '9+'
// //                                                     : conversation.unread_count}
// //                                             </div>
// //                                         )}
// //                                     </div>

// //                                     {/* Informations de la conversation */}
// //                                     <div className="flex-1 overflow-hidden">
// //                                         {/* Nom et username */}
// //                                         <div className="mb-1 flex items-center justify-between">
// //                                             <p className="font-semibold text-slate-800">
// //                                                 {conversation.user.full_name}
// //                                             </p>

// //                                             {/* Date du dernier message */}
// //                                             {conversation.last_message && (
// //                                                 <span className="text-xs text-gray-500">
// //                                                     {moment(
// //                                                         conversation
// //                                                             .last_message
// //                                                             .created_at,
// //                                                     ).fromNow()}
// //                                                 </span>
// //                                             )}
// //                                         </div>

// //                                         <p className="mb-2 text-sm text-slate-500">
// //                                             @{conversation.user.username}
// //                                         </p>

// //                                         {/* Dernier message */}
// //                                         <p
// //                                             className={`truncate text-sm ${
// //                                                 conversation.unread_count > 0
// //                                                     ? 'font-semibold text-slate-700'
// //                                                     : 'text-gray-600'
// //                                             }`}
// //                                         >
// //                                             {formatLastMessage(
// //                                                 conversation.last_message,
// //                                             )}
// //                                         </p>
// //                                     </div>

// //                                     {/* Boutons d'action */}
// //                                     <div className="flex flex-col gap-2">
// //                                         {/* Bouton message */}
// //                                         <button
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 openConversation(
// //                                                     conversation.user.id,
// //                                                 );
// //                                             }}
// //                                             className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200 active:scale-95"
// //                                             title="Ouvrir le chat"
// //                                         >
// //                                             <MessageSquare className="h-5 w-5" />
// //                                         </button>

// //                                         {/* Bouton voir profil */}
// //                                         <button
// //                                             onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 viewProfile(
// //                                                     conversation.user.id,
// //                                                 );
// //                                             }}
// //                                             className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95"
// //                                             title="Voir le profil"
// //                                         >
// //                                             <Eye className="h-5 w-5" />
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : (
// //                         /* État vide - Pas de conversations */
// //                         <div className="mt-20 text-center">
// //                             <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
// //                                 <MessageSquare className="h-12 w-12 text-emerald-600" />
// //                             </div>
// //                             <h3 className="mb-2 text-xl font-bold text-gray-900">
// //                                 Pas encore de conversations
// //                             </h3>
// //                             <p className="mb-6 text-gray-600">
// //                                 Commencez à discuter avec vos connexions !
// //                             </p>
// //                             <button
// //                                 onClick={() => router.visit('/connections')}
// //                                 className={`inline-flex items-center gap-2 rounded-lg ${bgGradient} px-6 py-3 text-sm font-medium text-white shadow-lg transition`}
// //                             >
// //                                 Trouver des connexions
// //                             </button>
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>
// //         </AppLayout>
// //     );
// // };

// // export default Messages;

import echo from '@/echo';
import AppLayout from '@/layouts/app-layout';
import type { Conversation, MessagePageProps } from '@/types/message';
import { Message } from '@/types/message';
import { router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Image as ImageIcon,
    MessageSquare,
    MoreVertical,
    Paperclip,
    PenSquare,
    Search,
    SendHorizontal,
    Smile,
    Star,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

// ─── Types locaux ────────────────────────────────────────────────────────────

/** Contact renvoyé par /api/messages/contacts/search */
interface Contact {
    id: string;
    full_name: string;
    username: string;
    profile_picture: string | null;
}

// ─── Composant principal ─────────────────────────────────────────────────────

const Messages = () => {
    const {
        conversations: initialConversations,
        unread_total,
        auth,
    } = usePage<MessagePageProps>().props;

    // ── État global ───────────────────────────────────────────────────────────
    const [conversations, setConversations] = useState<Conversation[]>(
        initialConversations || [],
    );
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [filterTab, setFilterTab] = useState('Prioritaire');
    const [loadingMessages, setLoadingMessages] = useState(false);

    // ── État — modal "Nouveau message" ────────────────────────────────────────
    const [showNewConvModal, setShowNewConvModal] = useState(false);
    const [contactQuery, setContactQuery] = useState('');
    const [contactResults, setContactResults] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contactInputRef = useRef<HTMLInputElement>(null);

    const searchParams = new URLSearchParams(window.location.search);
    const selectedUserId = searchParams.get('selectedUserId');

    const currentUser = auth.user;
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // ── Écoute temps réel (WebSocket) ─────────────────────────────────────────
    useEffect(() => {
        if (!currentUser || !selectedConversation) return;

        const channel = echo.private(`user.${currentUser.id}`);

        channel.listen('.message.sent', (data: any) => {
            if (data.message.from_user_id === selectedConversation.user.id) {
                const newMessage: Message = {
                    id: data.message.id,
                    from_user_id: data.message.from_user_id,
                    to_user_id: data.message.to_user_id,
                    text: data.message.text,
                    message_type: data.message.message_type,
                    media_url: data.message.media_url,
                    seen: false,
                    created_at: data.message.created_at,
                    updated_at: data.message.created_at,
                    sender: data.sender,
                    receiver: currentUser,
                };

                setMessages((prev) => [...prev, newMessage]);

                // Marquer comme lu après 1 seconde
                setTimeout(() => {
                    fetch(`/api/messages/${newMessage.id}/mark-as-read`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '',
                        },
                    });
                }, 1000);
            }
        });

        return () => {
            channel.stopListening('.message.sent');
        };
    }, [currentUser, selectedConversation]);

    // ── Ouvrir automatiquement une conversation via URL param ─────────────────
    useEffect(() => {
        if (selectedUserId && conversations.length > 0) {
            const conversation = conversations.find(
                (conv) => conv.user.id === selectedUserId,
            );
            if (conversation) {
                loadConversationMessages(conversation);
            }
        }
    }, [selectedUserId, conversations]);

    // ── Preview image sélectionnée ────────────────────────────────────────────
    useEffect(() => {
        if (image) {
            const objectUrl = URL.createObjectURL(image);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setImagePreview(null);
        }
    }, [image]);

    // ── Auto-scroll vers le bas ───────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Focus automatique sur le champ de recherche du modal ─────────────────
    useEffect(() => {
        if (showNewConvModal) {
            // Petit délai pour laisser le modal se monter dans le DOM
            setTimeout(() => contactInputRef.current?.focus(), 50);
        } else {
            setContactQuery('');
            setContactResults([]);
        }
    }, [showNewConvModal]);

    // ── Recherche de contacts (debounced) ─────────────────────────────────────
    useEffect(() => {
        if (!showNewConvModal) return;

        const timer = setTimeout(() => {
            fetchContacts(contactQuery);
        }, 300); // 300 ms de debounce pour éviter les requêtes inutiles

        return () => clearTimeout(timer);
    }, [contactQuery, showNewConvModal]);

    // ─── Fonctions utilitaires ────────────────────────────────────────────────

    /**
     * Charge les messages d'une conversation existante ou nouvelle.
     */
    const loadConversationMessages = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setLoadingMessages(true);
        setMessages([]);

        try {
            const response = await fetch(
                `/api/messages/${conversation.user.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) throw new Error('Erreur de chargement');

            const data = await response.json();
            if (data.messages) setMessages(data.messages);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Erreur lors du chargement des messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    /**
     * Envoie un message à l'utilisateur sélectionné.
     * Fonctionne pour les conversations existantes ET les nouvelles.
     */
    const sendMessage = () => {
        if (!text.trim() && !image) {
            toast.error('Veuillez entrer un message ou sélectionner une image');
            return;
        }
        if (!selectedConversation || sending) return;

        setSending(true);

        const formData = new FormData();
        formData.append('to_user_id', selectedConversation.user.id);
        if (text.trim()) formData.append('text', text.trim());
        if (image) formData.append('media', image);

        router.post('/messages', formData, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                setText('');
                setImage(null);
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';

                // Recharger les messages + la liste des conversations
                // (la nouvelle conversation apparaîtra dans la sidebar)
                setTimeout(() => {
                    loadConversationMessages(selectedConversation);
                    refreshConversationList();
                }, 300);
            },
            onError: (errors) => {
                console.error('Send message errors:', errors);
                const errorMessage = Object.values(errors)[0] as string;
                toast.error(errorMessage || "Échec de l'envoi du message");
            },
            onFinish: () => setSending(false),
        });
    };

    /**
     * Supprime un message envoyé par l'utilisateur courant.
     */
    const deleteMessage = (messageId: string) => {
        if (!confirm('Supprimer ce message ?')) return;

        router.delete(`/messages/${messageId}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Message supprimé !');
                if (selectedConversation) {
                    loadConversationMessages(selectedConversation);
                }
            },
            onError: () => toast.error('Échec de la suppression du message'),
        });
    };

    /**
     * Rafraîchit la liste des conversations dans la sidebar sans recharger la page.
     */
    const refreshConversationList = () => {
        router.reload({
            only: ['conversations', 'unread_total'],
            preserveScroll: true,
            preserveState: true,
        });
    };

    /**
     * Formate le dernier message pour l'affichage dans la liste.
     */
    const formatLastMessage = (message: Conversation['last_message']) => {
        if (!message) return 'Aucun message';
        if (message.message_type === 'image') {
            return message.text ? `📷 ${message.text}` : '📷 Image';
        }
        return message.text || 'Message';
    };

    // ─── Logique "Nouveau message" ────────────────────────────────────────────

    /**
     * Appelle l'API /api/messages/contacts/search avec la query donnée.
     */
    const fetchContacts = async (query: string) => {
        setLoadingContacts(true);
        try {
            const params = new URLSearchParams({ query });
            const response = await fetch(
                `/api/messages/contacts/search?${params}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) throw new Error('Erreur recherche contacts');

            const data = await response.json();
            setContactResults(data.contacts || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Impossible de charger les contacts');
        } finally {
            setLoadingContacts(false);
        }
    };

    /**
     * Démarre ou ouvre une conversation avec un contact sélectionné dans le modal.
     *
     * - Si une conversation existe déjà avec ce contact → on l'ouvre directement.
     * - Sinon → on crée un objet conversation "virtuel" (sans last_message)
     *   et on ouvre le panneau de chat. La conversation s'enregistre en base
     *   dès le premier message envoyé par `sendMessage()`.
     */
    const startConversationWithContact = (contact: Contact) => {
        setShowNewConvModal(false);

        // Vérifier si une conversation existe déjà avec ce contact
        const existing = conversations.find(
            (conv) => conv.user.id === contact.id,
        );

        if (existing) {
            // Conversation existante → l'ouvrir directement
            loadConversationMessages(existing);
            return;
        }

        // Nouvelle conversation → créer un objet conversation virtuel
        const virtualConversation: Conversation = {
            user: {
                id: contact.id,
                full_name: contact.full_name,
                username: contact.username,
                profile_picture: contact.profile_picture,
                // Valeurs par défaut pour les champs non renvoyés par searchContacts
                is_online: false,
            } as Conversation['user'],
            last_message: null,
            unread_count: 0,
        };

        // Afficher le panneau de chat immédiatement (messages vides)
        setSelectedConversation(virtualConversation);
        setMessages([]);
        setLoadingMessages(false);
    };

    // ─── Filtres conversations ────────────────────────────────────────────────

    const filteredConversations = conversations.filter((conv) => {
        const matchQuery =
            conv.user.full_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            conv.user.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        if (filterTab === 'Non lus') return matchQuery && conv.unread_count > 0;
        return matchQuery;
    });

    // ─── Rendu ────────────────────────────────────────────────────────────────

    return (
        <AppLayout
            showLeftSidebar={false}
            showRecentMessages={false}
            showCreatePostWidget={false}
        >
            <div
                className="flex overflow-hidden rounded-xl bg-gray-50 shadow-lg"
                style={{ height: 'calc(98vh - 100px)' }}
            >
                {/* ============================================================
                    SIDEBAR GAUCHE — Liste des conversations
                ============================================================ */}
                <div
                    className={`${
                        selectedConversation ? 'hidden md:flex' : 'flex'
                    } w-full flex-col border-r border-gray-200 bg-white md:w-96`}
                >
                    {/* ── Header ───────────────────────────────────────────── */}
                    <div className="flex-shrink-0 border-b border-gray-200 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Messagerie
                            </h1>

                            <div className="flex items-center gap-1">
                                <button
                                    className="rounded-lg p-2 transition hover:bg-gray-100"
                                    title="Options"
                                >
                                    <MoreVertical className="h-5 w-5 text-gray-600" />
                                </button>

                                {/* ── Bouton "Nouveau message" ── */}
                                <button
                                    onClick={() => setShowNewConvModal(true)}
                                    className="rounded-lg p-2 transition hover:bg-green-50 hover:text-green-700"
                                    title="Nouveau message"
                                >
                                    <PenSquare className="h-5 w-5 text-gray-600 hover:text-green-700" />
                                </button>
                            </div>
                        </div>

                        {/* Barre de recherche dans les conversations existantes */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher dans les messages"
                                className="w-full rounded-lg border-none bg-blue-50 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ── Filtres ──────────────────────────────────────────── */}
                    <div className="flex flex-shrink-0 gap-2 overflow-x-auto border-b border-gray-200 px-4 py-3">
                        {['Prioritaire', 'Non lus', 'Groupes'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilterTab(tab)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                                    filterTab === tab
                                        ? 'bg-green-700 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* ── Liste des conversations (scrollable) ─────────────── */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conversation) => (
                                <div
                                    key={conversation.user.id}
                                    onClick={() =>
                                        loadConversationMessages(conversation)
                                    }
                                    className={`flex cursor-pointer items-start gap-3 border-l-4 p-4 transition hover:bg-gray-50 ${
                                        selectedConversation?.user.id ===
                                        conversation.user.id
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-transparent'
                                    }`}
                                >
                                    {/* Avatar + indicateur en ligne */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={
                                                conversation.user
                                                    .profile_picture ||
                                                defaultProfilePicture
                                            }
                                            alt={conversation.user.full_name}
                                            className="h-14 w-14 rounded-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    defaultProfilePicture;
                                            }}
                                        />
                                        {conversation.user.is_online && (
                                            <div className="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                                        )}
                                    </div>

                                    {/* Infos */}
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-start justify-between gap-2">
                                            <p
                                                className={`truncate text-sm font-semibold ${
                                                    conversation.unread_count >
                                                    0
                                                        ? 'text-gray-900'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                {conversation.user.full_name}
                                            </p>
                                            {conversation.last_message && (
                                                <span className="flex-shrink-0 text-xs text-gray-500">
                                                    {moment(
                                                        conversation
                                                            .last_message
                                                            .created_at,
                                                    ).format('D MMM')}
                                                </span>
                                            )}
                                        </div>

                                        {conversation.last_message && (
                                            <div className="flex items-center justify-between gap-2">
                                                <p
                                                    className={`truncate text-sm ${
                                                        conversation.unread_count >
                                                        0
                                                            ? 'font-semibold text-gray-900'
                                                            : 'text-gray-600'
                                                    }`}
                                                >
                                                    {formatLastMessage(
                                                        conversation.last_message,
                                                    )}
                                                </p>
                                                {conversation.unread_count >
                                                    0 && (
                                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                                        <span className="text-xs font-bold text-white">
                                                            {conversation.unread_count >
                                                            9
                                                                ? '9+'
                                                                : conversation.unread_count}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            @{conversation.user.username}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-shrink-0 flex-col gap-1">
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="rounded p-1 hover:bg-gray-200"
                                        >
                                            <Star className="h-4 w-4 text-gray-400" />
                                        </button>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="rounded p-1 hover:bg-gray-200"
                                        >
                                            <MoreVertical className="h-4 w-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* ── État vide ─── */
                            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                                <MessageSquare className="mb-4 h-16 w-16 text-gray-300" />
                                <p className="mb-2 font-medium text-gray-600">
                                    Aucune conversation
                                </p>
                                <p className="mb-4 text-sm text-gray-500">
                                    Commencez à discuter avec vos connexions
                                </p>
                                <button
                                    onClick={() => setShowNewConvModal(true)}
                                    className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800"
                                >
                                    <PenSquare className="h-4 w-4" />
                                    Nouveau message
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================================
                    ZONE DE CHAT — Panneau droit
                ============================================================ */}
                <div
                    className={`${
                        !selectedConversation ? 'hidden md:flex' : 'flex'
                    } flex-1 flex-col bg-white`}
                >
                    {selectedConversation ? (
                        <>
                            {/* ── Header conversation ───────────────────────── */}
                            <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Bouton retour (mobile) */}
                                        <button
                                            onClick={() =>
                                                setSelectedConversation(null)
                                            }
                                            className="rounded-lg p-2 hover:bg-gray-200 md:hidden"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>

                                        <img
                                            src={
                                                selectedConversation.user
                                                    .profile_picture ||
                                                defaultProfilePicture
                                            }
                                            alt={
                                                selectedConversation.user
                                                    .full_name
                                            }
                                            className="h-12 w-12 rounded-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    defaultProfilePicture;
                                            }}
                                        />

                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {
                                                    selectedConversation.user
                                                        .full_name
                                                }
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {selectedConversation.user
                                                    .is_online
                                                    ? 'En ligne'
                                                    : selectedConversation.last_message
                                                      ? `Vu ${moment(
                                                            selectedConversation
                                                                .last_message
                                                                ?.created_at,
                                                        ).fromNow()}`
                                                      : 'Nouveau contact'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                router.visit(
                                                    `/profile/${selectedConversation.user.id}`,
                                                )
                                            }
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                                        >
                                            Voir le profil
                                        </button>
                                        <button className="rounded-lg p-2 hover:bg-gray-200">
                                            <MoreVertical className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ── Zone messages (scrollable) ───────────────── */}
                            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                {loadingMessages ? (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                                    </div>
                                ) : messages.length > 0 ? (
                                    messages
                                        .sort(
                                            (a, b) =>
                                                new Date(
                                                    a.created_at,
                                                ).getTime() -
                                                new Date(
                                                    b.created_at,
                                                ).getTime(),
                                        )
                                        .map((message, index) => {
                                            const isSentByMe =
                                                message.from_user_id ===
                                                currentUser.id;
                                            const showDate =
                                                index === 0 ||
                                                !moment(
                                                    message.created_at,
                                                ).isSame(
                                                    messages[index - 1]
                                                        .created_at,
                                                    'day',
                                                );

                                            return (
                                                <div key={message.id}>
                                                    {showDate && (
                                                        <div className="my-4 flex items-center justify-center">
                                                            <div className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                                                                {moment(
                                                                    message.created_at,
                                                                ).format(
                                                                    'D MMMM YYYY',
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`flex items-start gap-3 ${
                                                            isSentByMe
                                                                ? 'flex-row-reverse'
                                                                : ''
                                                        }`}
                                                    >
                                                        {!isSentByMe && (
                                                            <img
                                                                src={
                                                                    selectedConversation
                                                                        .user
                                                                        .profile_picture ||
                                                                    defaultProfilePicture
                                                                }
                                                                alt=""
                                                                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                                            />
                                                        )}

                                                        <div
                                                            className={`group relative max-w-xl ${
                                                                isSentByMe
                                                                    ? 'items-end'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div
                                                                className={`rounded-2xl px-4 py-2 ${
                                                                    isSentByMe
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-100 text-gray-900'
                                                                }`}
                                                            >
                                                                {message.message_type ===
                                                                    'image' &&
                                                                    message.media_url && (
                                                                        <img
                                                                            src={
                                                                                message.media_url
                                                                            }
                                                                            alt="Attachment"
                                                                            className="mb-2 max-w-sm rounded-lg"
                                                                        />
                                                                    )}
                                                                {message.text && (
                                                                    <p className="text-sm break-words">
                                                                        {
                                                                            message.text
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div
                                                                className={`mt-1 flex items-center gap-2 text-xs text-gray-500 ${
                                                                    isSentByMe
                                                                        ? 'justify-end'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <span>
                                                                    {moment(
                                                                        message.created_at,
                                                                    ).format(
                                                                        'HH:mm',
                                                                    )}
                                                                </span>
                                                                {isSentByMe && (
                                                                    <span>
                                                                        {message.seen
                                                                            ? '✓✓'
                                                                            : '✓'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {isSentByMe && (
                                                                <button
                                                                    onClick={() =>
                                                                        deleteMessage(
                                                                            message.id,
                                                                        )
                                                                    }
                                                                    className="absolute top-1/2 -right-6 -translate-y-1/2 rounded-full bg-red-100 p-1.5 text-red-600 opacity-0 transition group-hover:opacity-100 hover:bg-red-200"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                ) : (
                                    /* ── État vide — premier message ── */
                                    <div className="flex h-full flex-col items-center justify-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                            <MessageSquare className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <p className="mb-1 font-medium text-gray-900">
                                            Commencez la conversation
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Envoyez votre premier message à{' '}
                                            <span className="font-semibold text-gray-800">
                                                {
                                                    selectedConversation.user
                                                        .full_name
                                                }
                                            </span>
                                        </p>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* ── Zone de saisie (fixée en bas) ────────────── */}
                            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
                                {/* Prévisualisation image */}
                                {imagePreview && (
                                    <div className="mb-3 flex items-center">
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-20 rounded-lg"
                                            />
                                            <button
                                                onClick={() => {
                                                    setImage(null);
                                                    setImagePreview(null);
                                                    if (fileInputRef.current)
                                                        fileInputRef.current.value =
                                                            '';
                                                }}
                                                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Formulaire d'envoi */}
                                <div className="flex items-end gap-2">
                                    <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                                        <textarea
                                            placeholder="Rédigez un message..."
                                            className="w-full resize-none bg-transparent text-sm outline-none"
                                            rows={1}
                                            value={text}
                                            onChange={(e) =>
                                                setText(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' &&
                                                    !e.shiftKey &&
                                                    !sending
                                                ) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            disabled={sending}
                                        />

                                        <div className="mt-2 flex items-center gap-1">
                                            <label
                                                htmlFor="image-upload"
                                                className="cursor-pointer rounded-lg p-2 transition hover:bg-gray-200"
                                            >
                                                <ImageIcon className="h-5 w-5 text-gray-600" />
                                                <input
                                                    ref={fileInputRef}
                                                    id="image-upload"
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    disabled={sending}
                                                    onChange={(e) => {
                                                        const files =
                                                            e.target.files;
                                                        if (files && files[0]) {
                                                            setImage(files[0]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <button className="rounded-lg p-2 transition hover:bg-gray-200">
                                                <Paperclip className="h-5 w-5 text-gray-600" />
                                            </button>
                                            <button className="rounded-lg p-2 transition hover:bg-gray-200">
                                                <Smile className="h-5 w-5 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bouton Envoyer */}
                                    <button
                                        onClick={sendMessage}
                                        disabled={
                                            sending || (!text.trim() && !image)
                                        }
                                        className="rounded-full bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {sending ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                            <SendHorizontal className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Aucune conversation sélectionnée ── */
                        <div className="flex h-full flex-col items-center justify-center">
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                                <MessageSquare className="h-12 w-12 text-gray-400" />
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-gray-900">
                                Sélectionnez une conversation
                            </h2>
                            <p className="mb-6 text-gray-600">
                                Choisissez une conversation dans la liste ou
                                démarrez-en une nouvelle
                            </p>
                            <button
                                onClick={() => setShowNewConvModal(true)}
                                className="flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 font-medium text-white transition hover:bg-green-800"
                            >
                                <PenSquare className="h-5 w-5" />
                                Nouveau message
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ================================================================
                MODAL — Nouveau message
                Recherche parmi connexions, abonnés et abonnements
            ================================================================ */}
            {showNewConvModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={(e) => {
                        // Fermer en cliquant sur l'overlay (hors du modal)
                        if (e.target === e.currentTarget)
                            setShowNewConvModal(false);
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* ── Header du modal ── */}
                        <div className="flex items-center justify-between border-b border-gray-200 p-4">
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-green-700" />
                                <h2 className="text-lg font-bold text-gray-900">
                                    Nouveau message
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowNewConvModal(false)}
                                className="rounded-lg p-2 transition hover:bg-gray-100"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* ── Champ de recherche ── */}
                        <div className="border-b border-gray-200 px-4 py-3">
                            <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2">
                                <span className="text-sm font-medium text-gray-500">
                                    À :
                                </span>
                                <div className="relative flex-1">
                                    <input
                                        ref={contactInputRef}
                                        type="text"
                                        placeholder="Rechercher un abonné, une connexion…"
                                        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                        value={contactQuery}
                                        onChange={(e) =>
                                            setContactQuery(e.target.value)
                                        }
                                    />
                                    {contactQuery && (
                                        <button
                                            onClick={() => setContactQuery('')}
                                            className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Liste des contacts ── */}
                        <div className="max-h-80 overflow-y-auto">
                            {loadingContacts ? (
                                /* Skeleton loader */
                                <div className="space-y-1 p-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex animate-pulse items-center gap-3 rounded-xl p-3"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-3 w-32 rounded bg-gray-200" />
                                                <div className="h-2.5 w-24 rounded bg-gray-100" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : contactResults.length > 0 ? (
                                /* Résultats */
                                <div className="p-2">
                                    {contactResults.map((contact) => {
                                        const alreadyInConversations =
                                            conversations.some(
                                                (c) => c.user.id === contact.id,
                                            );
                                        return (
                                            <button
                                                key={contact.id}
                                                onClick={() =>
                                                    startConversationWithContact(
                                                        contact,
                                                    )
                                                }
                                                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-gray-50"
                                            >
                                                <img
                                                    src={
                                                        contact.profile_picture ||
                                                        defaultProfilePicture
                                                    }
                                                    alt={contact.full_name}
                                                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            defaultProfilePicture;
                                                    }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {contact.full_name}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500">
                                                        @{contact.username}
                                                    </p>
                                                </div>
                                                {alreadyInConversations && (
                                                    <span className="flex-shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                                                        En cours
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : contactQuery.length > 0 ? (
                                /* Aucun résultat */
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <Search className="mb-3 h-10 w-10 text-gray-200" />
                                    <p className="text-sm font-medium text-gray-600">
                                        Aucun contact trouvé
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Essayez un autre nom ou username
                                    </p>
                                </div>
                            ) : (
                                /* État initial — invite à taper */
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <UserPlus className="mb-3 h-10 w-10 text-gray-200" />
                                    <p className="text-sm font-medium text-gray-600">
                                        Cherchez parmi vos connexions
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        abonnés · abonnements · connexions
                                        acceptées
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Footer du modal ── */}
                        <div className="border-t border-gray-100 px-4 py-3">
                            <p className="text-center text-xs text-gray-400">
                                Seuls vos connexions, abonnés et abonnements
                                sont disponibles
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Messages;