import echo from '@/echo';
import AppLayout from '@/layouts/app-layout';
import { ChatBoxPageProps } from '@/types/chat-box';
import { Message } from '@/types/message';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ImageIcon, SendHorizonal, Trash2, X } from 'lucide-react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const ChatBox = () => {
    const {
        messages: initialMessages,
        conversation_with,
        auth,
    } = usePage<ChatBoxPageProps>().props;

    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = auth.user;
    const otherUser = conversation_with;

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // ========================================
    // ÉCOUTE EN TEMPS RÉEL DES NOUVEAUX MESSAGES
    // ========================================
    useEffect(() => {
        if (!currentUser || !otherUser) return;

        // Écouter les messages envoyés par l'autre utilisateur
        const channel = echo.private(`user.${currentUser.id}`);

        channel.listen('.message.sent', (data: any) => {
            // Ne traiter que les messages de cette conversation
            if (data.message.from_user_id === otherUser.id) {
                console.log('📩 New message in conversation:', data);

                // Ajouter le message à la liste
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

                // Marquer automatiquement comme lu
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
                    }).catch((err) =>
                        console.error('Error marking as read:', err),
                    );
                }, 1000);
            }
        });

        return () => {
            channel.stopListening('.message.sent');
        };
    }, [currentUser, otherUser]);

    // Fonction pour envoyer un message
    const sendMessage = async () => {
        if (!text.trim() && !image) {
            toast.error('Veuillez entrer un message ou sélectionner une image');
            return;
        }

        if (sending) return;

        setSending(true);

        const formData = new FormData();
        formData.append('to_user_id', otherUser.id);

        if (text.trim()) {
            formData.append('text', text.trim());
        }

        if (image) {
            formData.append('media', image);
        }

        const currentText = text;
        const currentImage = image;

        router.post('/messages', formData, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                setText('');
                setImage(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                setTimeout(() => {
                    refreshMessages();
                }, 500);
            },
            onError: (errors) => {
                console.error('Send message errors:', errors);
                setText(currentText);
                setImage(currentImage);
                const errorMessage = Object.values(errors)[0] as string;
                toast.error(errorMessage || "Échec de l'envoi du message");
            },
            onFinish: () => {
                setSending(false);
            },
        });
    };

    const refreshMessages = () => {
        if (!otherUser) return;

        router.get(
            `/messages/${otherUser.id}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['messages'],
                onSuccess: (page) => {
                    const newData = page.props as any as ChatBoxPageProps;
                    if (newData.messages) {
                        setMessages(newData.messages);
                    }
                },
                onError: (errors) => {
                    console.error('Refresh messages error:', errors);
                },
            },
        );
    };

    const deleteMessage = (messageId: string) => {
        if (!confirm('Supprimer ce message ?')) return;

        router.delete(`/messages/${messageId}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Message supprimé !');
                refreshMessages();
            },
            onError: () => {
                toast.error('Échec de la suppression du message');
            },
        });
    };

    // Auto-scroll vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mise à jour des messages quand les props changent
    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    // Gestion de la prévisualisation de l'image
    useEffect(() => {
        if (image) {
            const objectUrl = URL.createObjectURL(image);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setImagePreview(null);
        }
    }, [image]);

    if (!otherUser) {
        return (
            <AppLayout>
                <div className="flex h-screen items-center justify-center">
                    <p className="text-gray-500">Utilisateur non trouvé</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex h-screen flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-300 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 md:px-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.get('/messages')}
                            className="rounded-full p-2 transition hover:bg-white/50"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </button>

                        <img
                            src={
                                otherUser.profile_picture ||
                                defaultProfilePicture
                            }
                            alt={otherUser.full_name}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                            onError={(e) => {
                                e.currentTarget.src = defaultProfilePicture;
                            }}
                        />
                        <div>
                            <p className="font-semibold text-slate-800">
                                {otherUser.full_name}
                            </p>
                            <p className="text-xs text-slate-600">
                                @{otherUser.username}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.get(`/profile/${otherUser.id}`)}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                    >
                        Voir le profil
                    </button>
                </div>

                {/* Zone des messages */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-5 md:px-10">
                    <div className="mx-auto max-w-4xl space-y-4">
                        {messages.length > 0 ? (
                            messages
                                .sort(
                                    (a, b) =>
                                        new Date(a.created_at).getTime() -
                                        new Date(b.created_at).getTime(),
                                )
                                .map((message) => {
                                    const isSentByMe =
                                        message.from_user_id === currentUser.id;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex flex-col ${
                                                isSentByMe
                                                    ? 'items-end'
                                                    : 'items-start'
                                            }`}
                                        >
                                            <div className="group relative">
                                                <div
                                                    className={`max-w-sm rounded-2xl p-3 shadow-sm ${
                                                        isSentByMe
                                                            ? 'rounded-br-none bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                                            : 'rounded-bl-none bg-white text-slate-800'
                                                    }`}
                                                >
                                                    {message.message_type ===
                                                        'image' &&
                                                        message.media_url && (
                                                            <img
                                                                src={
                                                                    message.media_url
                                                                }
                                                                alt="Message attachment"
                                                                className="mb-2 max-w-xs rounded-lg"
                                                            />
                                                        )}

                                                    {message.text && (
                                                        <p className="text-sm break-words">
                                                            {message.text}
                                                        </p>
                                                    )}

                                                    <div
                                                        className={`mt-1 flex items-center gap-2 text-xs ${
                                                            isSentByMe
                                                                ? 'text-white/70'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        <span>
                                                            {moment(
                                                                message.created_at,
                                                            ).format('HH:mm')}
                                                        </span>
                                                        {isSentByMe && (
                                                            <span>
                                                                {message.seen
                                                                    ? '✓✓'
                                                                    : '✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {isSentByMe && (
                                                    <button
                                                        onClick={() =>
                                                            deleteMessage(
                                                                message.id,
                                                            )
                                                        }
                                                        className="absolute top-1/2 -right-10 -translate-y-1/2 rounded-full bg-red-100 p-1.5 text-red-600 opacity-0 transition group-hover:opacity-100 hover:bg-red-200"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="flex h-full items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                                        <SendHorizonal className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                        Pas de messages pour le moment
                                    </h3>
                                    <p className="text-gray-600">
                                        Commencez la conversation avec{' '}
                                        {otherUser.full_name}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Zone de saisie */}
                <div className="border-t border-gray-200 bg-white px-4 py-3">
                    {imagePreview && (
                        <div className="mb-3 flex items-center justify-center">
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-32 rounded-lg shadow"
                                />
                                <button
                                    onClick={() => {
                                        setImage(null);
                                        setImagePreview(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-full border border-gray-200 bg-white p-2 pl-5 shadow-sm">
                        <input
                            type="text"
                            className="flex-1 text-sm text-slate-700 outline-none placeholder:text-gray-400"
                            placeholder="Type a message..."
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
                            onChange={(e) => setText(e.target.value)}
                            value={text}
                            disabled={sending}
                        />

                        <label
                            htmlFor="image"
                            className={`cursor-pointer rounded-lg p-2 transition ${
                                sending
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:bg-gray-100'
                            } ${image ? 'bg-indigo-100' : ''}`}
                        >
                            {image ? (
                                <div className="relative">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt="Selected"
                                        className="h-8 w-8 rounded object-cover"
                                    />
                                </div>
                            ) : (
                                <ImageIcon className="h-5 w-5 text-gray-600" />
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                id="image"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                hidden
                                disabled={sending}
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files[0]) {
                                        setImage(files[0]);
                                    }
                                }}
                            />
                        </label>

                        <button
                            onClick={sendMessage}
                            disabled={sending || (!text.trim() && !image)}
                            className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 text-white transition hover:from-indigo-600 hover:to-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {sending ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <SendHorizonal size={20} />
                            )}
                        </button>
                    </div>

                    {text.length > 0 && !sending && (
                        <div className="mt-2 text-center text-xs text-gray-500">
                            Appuyer sur Entrée pour envoyer
                        </div>
                    )}

                    {sending && (
                        <div className="mt-2 text-center text-xs text-indigo-600">
                            Envoi du message...
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default ChatBox;
