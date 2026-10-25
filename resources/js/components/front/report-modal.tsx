import { router } from '@inertiajs/react';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    contentType: 'post' | 'comment';
    contentId: string;
    contentAuthor?: string;
}

const REPORT_REASONS = [
    { value: 'spam', label: 'Spam ou publicité', icon: '📢' },
    { value: 'harassment', label: 'Harcèlement', icon: '😠' },
    { value: 'fake_information', label: 'Fausse information', icon: '❌' },
    {
        value: 'inappropriate_content',
        label: 'Contenu inapproprié',
        icon: '⚠️',
    },
    { value: 'hate_speech', label: 'Discours haineux', icon: '🚫' },
    { value: 'violence', label: 'Violence', icon: '⚔️' },
    { value: 'sexual_content', label: 'Contenu sexuel', icon: '🔞' },
    { value: 'other', label: 'Autre', icon: '❓' },
];

export default function ReportModal({
    isOpen,
    onClose,
    contentType,
    contentId,
    contentAuthor,
}: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const resetForm = () => {
        setSelectedReason('');
        setDescription('');
        setSubmitting(false);
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
    };

    const handleSubmit = () => {
        if (!selectedReason) {
            toast.error('Veuillez sélectionner une raison');
            return;
        }

        setSubmitting(true);

        const route =
            contentType === 'post'
                ? `/posts/${contentId}/report`
                : `/comments/${contentId}/report`;

        router.post(
            route,
            {
                reason: selectedReason,
                description: description.trim() || null,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Signalement envoyé avec succès', {
                        icon: '✅',
                        duration: 4000,
                    });
                    handleClose();
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors)[0] as string;
                    toast.error(errorMessage || 'Erreur lors du signalement');
                    setSubmitting(false);
                },
            },
        );
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/50 transition-opacity"
                onClick={handleClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
                <div
                    className="my-8 w-full max-w-lg rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between border-b p-6">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-red-100 p-2">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Signaler ce contenu
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Aidez-nous à maintenir une communauté saine
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={submitting}
                            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto p-6">
                        {contentAuthor && (
                            <div className="mb-6 rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-600">
                                    Vous signalez un{' '}
                                    <span className="font-semibold">
                                        {contentType === 'post'
                                            ? 'post'
                                            : 'commentaire'}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-semibold text-gray-900">
                                        {contentAuthor}
                                    </span>
                                </p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="mb-3 block text-sm font-semibold text-gray-700">
                                Raison du signalement *
                            </label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {REPORT_REASONS.map((reason) => (
                                    <button
                                        key={reason.value}
                                        onClick={() =>
                                            setSelectedReason(reason.value)
                                        }
                                        disabled={submitting}
                                        className={`flex items-center space-x-3 rounded-lg border-2 p-3 transition ${
                                            selectedReason === reason.value
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        } ${submitting ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        <span className="text-2xl">
                                            {reason.icon}
                                        </span>
                                        <span className="flex-1 text-left text-sm font-medium">
                                            {reason.label}
                                        </span>
                                        {selectedReason === reason.value && (
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                                                <svg
                                                    className="h-3 w-3 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Détails supplémentaires (optionnel)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ajoutez des informations utiles..."
                                className="w-full rounded-lg border p-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none"
                                rows={4}
                                maxLength={1000}
                                disabled={submitting}
                            />
                            <p className="mt-1 text-right text-xs text-gray-500">
                                {description.length}/1000
                            </p>
                        </div>

                        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold">Important</p>
                                    <p className="mt-1">
                                        Les faux signalements peuvent entraîner
                                        des sanctions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleClose}
                                disabled={submitting}
                                className="flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !selectedReason}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                {submitting ? 'Envoi...' : 'Envoyer'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
