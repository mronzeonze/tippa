import { router } from '@inertiajs/react';
import {
    Check,
    Facebook,
    Linkedin,
    Link as LinkIcon,
    Repeat2,
    Twitter,
    MessageCircle as WhatsApp,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ShareModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
    isReposted: boolean;
    postUrl: string;
    postContent?: string;
}

export default function ShareModal({
    postId,
    isOpen,
    onClose,
    isReposted,
    postUrl,
    postContent,
}: ShareModalProps) {
    const [repostContent, setRepostContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // Republier le post
    const handleRepost = () => {
        setSubmitting(true);

        router.post(
            `/posts/${postId}/repost`,
            { content: repostContent.trim() || null },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setRepostContent('');
                    setSubmitting(false);
                    toast.success(
                        isReposted
                            ? 'Republication annulée'
                            : 'Post republié avec succès',
                    );
                    onClose();
                },
                onError: (errors) => {
                    toast.error('Erreur lors de la republication');
                    console.error(errors);
                    setSubmitting(false);
                },
            },
        );
    };

    // Partager sur les réseaux sociaux
    const handleSocialShare = (
        platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp',
    ) => {
        let shareUrl = '';
        const text = postContent
            ? postContent.substring(0, 200)
            : 'Découvrez cette publication';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`;
                break;
        }

        // Ouvrir dans une nouvelle fenêtre
        window.open(shareUrl, '_blank', 'width=600,height=400');

        // Enregistrer le partage
        router.post(
            `/posts/${postId}/share`,
            { share_type: platform },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );

        onClose();
    };

    // Copier le lien
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(postUrl);
            setLinkCopied(true);

            // Enregistrer le partage
            router.post(
                `/posts/${postId}/share`,
                { share_type: 'copy_link' },
                {
                    preserveScroll: true,
                    preserveState: true,
                },
            );

            toast.success('Lien copié dans le presse-papiers');

            setTimeout(() => {
                setLinkCopied(false);
                onClose();
            }, 1500);
        } catch (error) {
            toast.error('Erreur lors de la copie du lien');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="bg-opacity-50 fixed inset-0 z-40 bg-white/40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-opacity-10 pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 transition-opacity">
                <div
                    className="pointer-events-auto flex w-full max-w-md flex-col rounded-lg border-2 bg-white shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* En-tête */}
                    <div className="flex items-center justify-between border-b p-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Partager la publication
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Contenu */}
                    <div className="space-y-4 p-4">
                        {/* Section Republication */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700">
                                Republier sur votre profil
                            </h3>

                            <textarea
                                value={repostContent}
                                onChange={(e) =>
                                    setRepostContent(e.target.value)
                                }
                                placeholder="Ajouter un commentaire (optionnel)..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                rows={3}
                                disabled={submitting}
                            />

                            <button
                                onClick={handleRepost}
                                disabled={submitting}
                                className={`flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                                    isReposted
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                } disabled:opacity-50`}
                            >
                                <Repeat2 className="h-4 w-4" />
                                <span>
                                    {submitting
                                        ? 'Chargement...'
                                        : isReposted
                                          ? 'Annuler la republication'
                                          : 'Republier'}
                                </span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">
                                    ou partager via
                                </span>
                            </div>
                        </div>

                        {/* Section Réseaux Sociaux */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Facebook */}
                            <button
                                onClick={() => handleSocialShare('facebook')}
                                className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 transition hover:border-blue-300 hover:bg-blue-50"
                            >
                                <Facebook className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    Facebook
                                </span>
                            </button>

                            {/* Twitter */}
                            <button
                                onClick={() => handleSocialShare('twitter')}
                                className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 transition hover:border-sky-300 hover:bg-sky-50"
                            >
                                <Twitter className="h-5 w-5 text-sky-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    Twitter
                                </span>
                            </button>

                            {/* LinkedIn */}
                            <button
                                onClick={() => handleSocialShare('linkedin')}
                                className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 transition hover:border-blue-300 hover:bg-blue-50"
                            >
                                <Linkedin className="h-5 w-5 text-blue-700" />
                                <span className="text-sm font-medium text-gray-700">
                                    LinkedIn
                                </span>
                            </button>

                            {/* WhatsApp */}
                            <button
                                onClick={() => handleSocialShare('whatsapp')}
                                className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3 transition hover:border-green-300 hover:bg-green-50"
                            >
                                <WhatsApp className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    WhatsApp
                                </span>
                            </button>
                        </div>

                        {/* Copier le lien */}
                        <button
                            onClick={handleCopyLink}
                            disabled={linkCopied}
                            className="flex w-full items-center justify-center space-x-2 rounded-lg border-2 border-dashed border-gray-300 p-3 transition hover:border-indigo-500 hover:bg-indigo-50"
                        >
                            {linkCopied ? (
                                <>
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-600">
                                        Lien copié !
                                    </span>
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="h-5 w-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Copier le lien
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
