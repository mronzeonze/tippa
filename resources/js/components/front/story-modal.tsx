// // story-modal.tsx
// // Modal pour créer une nouvelle story (texte, image ou vidéo)

// import { router } from '@inertiajs/react';
// import { ArrowLeft, Sparkle, Type, Upload, X } from 'lucide-react';
// import { ChangeEvent, useState } from 'react';
// import toast from 'react-hot-toast';

// // ========================================
// // INTERFACES
// // ========================================
// interface StoryModalProps {
//     setShowModal: (show: boolean) => void;
//     onStoryCreated?: () => void;
// }

// // ========================================
// // COULEURS DE FOND DISPONIBLES
// // ========================================
// const BG_COLORS = [
//     '#4f46e5', // Indigo
//     '#7c3aed', // Purple
//     '#db2777', // Pink
//     '#e11d48', // Rose
//     '#ea580c', // Orange
//     '#ca8a04', // Yellow
//     '#0d9488', // Teal
//     '#059669', // Green
//     '#2563eb', // Blue
//     // '#7c2d12', // Brown
// ];

// // ========================================
// // COMPOSANT PRINCIPAL
// // ========================================
// function StoryModal({ setShowModal, onStoryCreated }: StoryModalProps) {
//     // États du formulaire
//     const [mode, setMode] = useState<'text' | 'media'>('text');
//     const [background, setBackground] = useState(BG_COLORS[0]);
//     const [text, setText] = useState('');
//     const [media, setMedia] = useState<File | null>(null);
//     const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);

//     /**
//      * Gérer l'upload de média (image ou vidéo)
//      * Crée une preview URL pour l'affichage
//      */
//     const handleMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             // Vérifier la taille du fichier (max 10MB)
//             if (file.size > 10 * 1024 * 1024) {
//                 toast.error(
//                     'La taille du fichier doit être inférieure à 10 Mo.',
//                 );
//                 return;
//             }

//             setMedia(file);
//             setPreviewUrl(URL.createObjectURL(file));
//         }
//     };

//     /**
//      * Retirer le média sélectionné
//      */
//     const removeMedia = () => {
//         if (previewUrl) {
//             URL.revokeObjectURL(previewUrl);
//         }
//         setMedia(null);
//         setPreviewUrl(null);
//     };

//     /**
//      * Créer la story et l'envoyer au serveur
//      * Gère les stories texte et média
//      */
//     const handleCreateStory = async () => {
//         // Validation selon le mode
//         if (mode === 'text' && !text.trim()) {
//             toast.error('Veuillez entrer du texte pour la story.');
//             return;
//         }

//         if (mode === 'media' && !media) {
//             toast.error('Veuillez sélectionner une photo ou une vidéo.');
//             return;
//         }

//         setLoading(true);

//         // Créer FormData pour envoyer les données
//         const formData = new FormData();
//         formData.append(
//             'media_type',
//             mode === 'text'
//                 ? 'text'
//                 : media?.type.startsWith('video')
//                   ? 'video'
//                   : 'image',
//         );

//         if (mode === 'text') {
//             formData.append('content', text.trim());
//             formData.append('background_color', background);
//         } else if (media) {
//             formData.append('media', media);
//             // Optionnel : ajouter du texte à une story média
//             if (text.trim()) {
//                 formData.append('content', text.trim());
//             }
//         }

//         // Envoyer avec Inertia
//         router.post('/stories', formData, {
//             forceFormData: true,
//             preserveScroll: true,
//             preserveState: true,
//             onSuccess: () => {
//                 toast.success('Story créée avec succès !');
//                 setShowModal(false);
//                 if (onStoryCreated) onStoryCreated();
//             },
//             onError: (errors) => {
//                 console.error('Story creation errors:', errors);
//                 const errorMessage = Object.values(errors)[0] as string;
//                 toast.error(errorMessage || 'Échec de la création de la story');
//             },
//             onFinish: () => {
//                 setLoading(false);
//             },
//         });
//     };

//     /**
//      * Fermer le modal
//      * Nettoie les preview URLs pour éviter les fuites mémoire
//      */
//     const handleClose = () => {
//         if (loading) return;
//         if (previewUrl) {
//             URL.revokeObjectURL(previewUrl);
//         }
//         setShowModal(false);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 text-white backdrop-blur-sm">
//             <div className="min-h-10 w-full max-w-md rounded-xl bg-zinc-900 p-2 shadow-2xl">
//                 {/* Header */}
//                 <div className="mb-4 flex items-center justify-between">
//                     <button
//                         onClick={handleClose}
//                         disabled={loading}
//                         className="rounded-lg p-2 text-white transition hover:bg-white/10 disabled:opacity-50"
//                     >
//                         <ArrowLeft className="h-6 w-6" />
//                     </button>
//                     <h2 className="text-lg font-semibold">Créer une story</h2>
//                     <button
//                         onClick={handleClose}
//                         disabled={loading}
//                         className="rounded-lg p-2 text-white transition hover:bg-white/10 disabled:opacity-50"
//                     >
//                         <X className="h-6 w-6" />
//                     </button>
//                 </div>

//                 {/* Preview de la story */}
//                 <div
//                     className="relative flex h-96 items-center justify-center overflow-hidden rounded-xl shadow-2xl"
//                     style={{
//                         backgroundColor: mode === 'text' ? background : '#000',
//                     }}
//                 >
//                     {/* Mode texte */}
//                     {mode === 'text' && (
//                         <textarea
//                             className="h-full w-full resize-none bg-transparent p-6 text-center text-lg font-medium text-white placeholder-white/60 outline-none"
//                             placeholder="Partagez vos connaissances..."
//                             onChange={(e) => setText(e.target.value)}
//                             value={text}
//                             disabled={loading}
//                             maxLength={500}
//                         />
//                     )}

//                     {/* Mode média avec preview */}
//                     {mode === 'media' && previewUrl && (
//                         <>
//                             {media?.type.startsWith('image') ? (
//                                 <img
//                                     src={previewUrl}
//                                     alt="Preview"
//                                     className="max-h-full max-w-full object-contain"
//                                 />
//                             ) : (
//                                 <video
//                                     src={previewUrl}
//                                     className="max-h-full max-w-full object-contain"
//                                     controls
//                                 />
//                             )}

//                             {/* Bouton pour retirer le média */}
//                             <button
//                                 onClick={removeMedia}
//                                 disabled={loading}
//                                 className="absolute top-4 right-4 rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:bg-red-600 disabled:opacity-50"
//                             >
//                                 <X className="h-5 w-5" />
//                             </button>
//                         </>
//                     )}

//                     {/* Placeholder si mode média mais pas de fichier */}
//                     {mode === 'media' && !previewUrl && (
//                         <div className="text-center">
//                             <Upload className="mx-auto mb-4 h-16 w-16 text-white/40" />
//                             <p className="text-white/60">
//                                 Sélectionnez une photo ou une vidéo à partager
//                             </p>
//                         </div>
//                     )}
//                 </div>

//                 {/* Compteur de caractères pour le mode texte */}
//                 {mode === 'text' && (
//                     <div className="mt-2 text-right text-xs text-white/60">
//                         {text.length}/500 caractères
//                     </div>
//                 )}

//                 {/* Sélecteur de couleurs de fond (mode texte uniquement) */}
//                 {mode === 'text' && (
//                     <div className="mt-4">
//                         <p className="mb-2 text-sm text-white/80">
//                             Couleur de fond :
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                             {BG_COLORS.map((color) => (
//                                 <button
//                                     key={color}
//                                     className={`h-10 w-10 cursor-pointer rounded-full transition hover:scale-110 ${
//                                         background === color
//                                             ? 'ring-4 ring-white ring-offset-2 ring-offset-black'
//                                             : ''
//                                     }`}
//                                     style={{ backgroundColor: color }}
//                                     onClick={() => setBackground(color)}
//                                     disabled={loading}
//                                     title={color}
//                                 />
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 {/* Boutons pour choisir le type de story */}
//                 <div className="mt-4 flex gap-2">
//                     {/* Bouton Mode Texte */}
//                     <button
//                         onClick={() => {
//                             setMode('text');
//                             removeMedia();
//                         }}
//                         disabled={loading}
//                         className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg p-3 font-medium transition ${
//                             mode === 'text'
//                                 ? 'bg-white text-black shadow-lg'
//                                 : 'bg-zinc-800 hover:bg-zinc-700'
//                         } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
//                     >
//                         <Type size={18} />
//                         Texte
//                     </button>

//                     {/* Bouton Mode Photo/Vidéo */}
//                     <label
//                         className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg p-3 font-medium transition ${
//                             mode === 'media'
//                                 ? 'bg-white text-black shadow-lg'
//                                 : 'bg-zinc-800 hover:bg-zinc-700'
//                         } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
//                     >
//                         <input
//                             onChange={(e) => {
//                                 handleMediaUpload(e);
//                                 setMode('media');
//                             }}
//                             type="file"
//                             accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/mov,video/avi"
//                             className="hidden"
//                             disabled={loading}
//                         />
//                         <Upload size={18} />
//                         Photo/Video
//                     </label>
//                 </div>

//                 {/* Bouton pour créer la story */}
//                 <button
//                     onClick={handleCreateStory}
//                     disabled={
//                         loading ||
//                         (mode === 'text' && !text.trim()) ||
//                         (mode === 'media' && !media)
//                     }
//                     className={`mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 active:scale-95 ${
//                         loading ||
//                         (mode === 'text' && !text.trim()) ||
//                         (mode === 'media' && !media)
//                             ? 'cursor-not-allowed opacity-50'
//                             : ''
//                     }`}
//                 >
//                     {loading ? (
//                         <>
//                             <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
//                             Création de la story...
//                         </>
//                     ) : (
//                         <>
//                             <Sparkle size={18} />
//                             Partager la story
//                         </>
//                     )}
//                 </button>

//                 {/* Informations sur les limites */}

//                 {/* <div className="mt-4 rounded-lg bg-white/10 p-3 text-xs text-white/70">
//                     <ul className="space-y-1">
//                         <li>• Les stories disparaissent après 24 heures</li>
//                         <li>• Taille maximale du fichier : 10 Mo</li>
//                         <li>
//                             • Formats pris en charge : JPG, PNG, GIF, MP4, MOV, AVI
//                         </li>
//                         {mode === 'text' && (
//                             <li>• Longueur maximale du texte : 500 caractères</li>
//                         )}
//                     </ul>
//                 </div> */}
//             </div>
//         </div>
//     );
// }

// export default StoryModal;

// story-modal.tsx
// Modal pour créer une nouvelle story (texte, image ou vidéo)
// Améliorations : drag & drop, texte sur média, progression upload,
//                 navigation clavier, gestion mémoire robuste, UX fluide.

import axios from 'axios';
import { ArrowLeft, ImageIcon, Sparkle, Type, Upload, X } from 'lucide-react';
import {
    ChangeEvent,
    DragEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import toast from 'react-hot-toast';

// ============================================================
// INTERFACES
// ============================================================
interface StoryModalProps {
    setShowModal: (show: boolean) => void;
    onStoryCreated?: () => void;
}

type StoryMode = 'text' | 'media';

// ============================================================
// COULEURS DE FOND
// ============================================================
const BG_COLORS = [
    { hex: '#4f46e5', label: 'Indigo' },
    { hex: '#7c3aed', label: 'Violet' },
    { hex: '#db2777', label: 'Rose' },
    { hex: '#e11d48', label: 'Carmin' },
    { hex: '#ea580c', label: 'Orange' },
    { hex: '#ca8a04', label: 'Ambre' },
    { hex: '#0d9488', label: 'Sarcelle' },
    { hex: '#059669', label: 'Émeraude' },
    { hex: '#2563eb', label: 'Bleu' },
    { hex: '#1e293b', label: 'Ardoise' },
];

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
function StoryModal({ setShowModal, onStoryCreated }: StoryModalProps) {
    const [mode, setMode] = useState<StoryMode>('text');
    const [background, setBackground] = useState(BG_COLORS[0].hex);
    const [text, setText] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    // Texte superposé sur les stories média
    const [overlayText, setOverlayText] = useState('');
    const [showOverlayInput, setShowOverlayInput] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --------------------------------------------------------
    // Nettoyage des object URLs à la destruction
    // --------------------------------------------------------
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, []); // uniquement au unmount

    // --------------------------------------------------------
    // Fermeture avec Echap
    // --------------------------------------------------------
    useEffect(() => {
        const onKeyDown = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) handleClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [loading]);

    // --------------------------------------------------------
    // Valider et attacher un fichier
    // --------------------------------------------------------
    const attachFile = useCallback(
        (file: File) => {
            const ALLOWED_TYPES = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'video/mp4',
                'video/quicktime',
                'video/avi',
            ];

            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(
                    'Format non supporté. Utilisez JPG, PNG, GIF, MP4, MOV ou AVI.',
                );
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Le fichier dépasse la limite de 10 Mo.');
                return;
            }

            // Révoquer l'ancienne URL si elle existe
            if (previewUrl) URL.revokeObjectURL(previewUrl);

            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMode('media');
        },
        [previewUrl],
    );

    // --------------------------------------------------------
    // Gestion de l'input file classique
    // --------------------------------------------------------
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) attachFile(file);
        // Reset pour permettre de re-sélectionner le même fichier
        e.target.value = '';
    };

    // --------------------------------------------------------
    // Drag & Drop
    // --------------------------------------------------------
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) attachFile(file);
    };

    // --------------------------------------------------------
    // Retirer le média sélectionné
    // --------------------------------------------------------
    const removeMedia = useCallback(() => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setMedia(null);
        setPreviewUrl(null);
        setOverlayText('');
        setShowOverlayInput(false);
    }, [previewUrl]);

    // --------------------------------------------------------
    // Changer de mode
    // --------------------------------------------------------
    const switchMode = (newMode: StoryMode) => {
        if (newMode === 'text') removeMedia();
        setMode(newMode);
    };

    // --------------------------------------------------------
    // Créer la story
    // --------------------------------------------------------
    const handleCreateStory = async () => {
        if (mode === 'text' && !text.trim()) {
            toast.error('Veuillez saisir du texte pour la story.');
            return;
        }
        if (mode === 'media' && !media) {
            toast.error('Veuillez sélectionner une photo ou une vidéo.');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        const formData = new FormData();

        if (mode === 'text') {
            formData.append('media_type', 'text');
            formData.append('content', text.trim());
            formData.append('background_color', background);
        } else if (media) {
            formData.append(
                'media_type',
                media.type.startsWith('video') ? 'video' : 'image',
            );
            formData.append('media', media);
            if (overlayText.trim()) {
                formData.append('content', overlayText.trim());
            }
        }

        try {
            await axios.post('/api/stories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const pct = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        setUploadProgress(pct);
                    }
                },
            });

            toast.success('Story partagée avec succès !');
            setShowModal(false);
            onStoryCreated?.();
        } catch (error: any) {
            const errors = error.response?.data?.errors;
            if (errors) {
                const firstError = Object.values(errors)[0] as string[];
                toast.error(firstError[0] || 'Erreur lors de la création.');
            } else {
                toast.error(
                    error.response?.data?.message ||
                        'Erreur réseau. Réessayez.',
                );
            }
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    // --------------------------------------------------------
    // Fermer le modal (protéger si loading)
    // --------------------------------------------------------
    const handleClose = () => {
        if (loading) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setShowModal(false);
    };

    // --------------------------------------------------------
    // Condition d'activation du bouton submit
    // --------------------------------------------------------
    const canSubmit =
        !loading &&
        ((mode === 'text' && text.trim().length > 0) ||
            (mode === 'media' && media !== null));

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Créer une story"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
                {/* ── En-tête ── */}
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Retour"
                        className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="font-semibold text-white">
                        Créer une story
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Fermer"
                        className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* ── Zone de prévisualisation ── */}
                <div
                    className={`relative mx-4 flex h-96 cursor-pointer items-center justify-center overflow-hidden rounded-xl shadow-inner transition ${
                        isDragging
                            ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-zinc-900'
                            : ''
                    }`}
                    style={{
                        backgroundColor: mode === 'text' ? background : '#111',
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* ── Mode texte ── */}
                    {mode === 'text' && (
                        <textarea
                            className="h-full w-full resize-none bg-transparent p-8 text-center text-xl font-semibold text-white placeholder-white/40 outline-none"
                            placeholder="Partagez vos connaissances..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={loading}
                            maxLength={500}
                            aria-label="Contenu de la story"
                        />
                    )}

                    {/* ── Mode média avec préview ── */}
                    {mode === 'media' && previewUrl && (
                        <>
                            {media?.type.startsWith('image') ? (
                                <img
                                    src={previewUrl}
                                    alt="Aperçu"
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <video
                                    src={previewUrl}
                                    className="max-h-full max-w-full object-contain"
                                    controls
                                />
                            )}

                            {/* Texte superposé sur le média */}
                            {overlayText && (
                                <div className="pointer-events-none absolute right-0 bottom-12 left-0 flex justify-center px-4">
                                    <p className="max-w-full rounded-lg bg-black/50 px-3 py-1 text-center text-base font-semibold text-white backdrop-blur-sm">
                                        {overlayText}
                                    </p>
                                </div>
                            )}

                            {/* Bouton ajouter/modifier le texte */}
                            <button
                                onClick={() =>
                                    setShowOverlayInput(!showOverlayInput)
                                }
                                disabled={loading}
                                className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
                            >
                                <Type className="h-3.5 w-3.5" />
                                {overlayText ? 'Modifier' : 'Ajouter du texte'}
                            </button>

                            {/* Bouton supprimer le média */}
                            <button
                                onClick={removeMedia}
                                disabled={loading}
                                aria-label="Retirer le média"
                                className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-40"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    )}

                    {/* ── Placeholder drag & drop ── */}
                    {mode === 'media' && !previewUrl && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-3 text-white/50 transition hover:text-white/80"
                        >
                            {isDragging ? (
                                <>
                                    <ImageIcon className="h-16 w-16 animate-bounce" />
                                    <p className="text-sm font-medium">
                                        Déposez le fichier ici
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-16 w-16" />
                                    <p className="text-sm font-medium">
                                        Cliquez ou glissez-déposez
                                    </p>
                                    <p className="text-xs">
                                        JPG, PNG, GIF, MP4, MOV · max 10 Mo
                                    </p>
                                </>
                            )}
                        </button>
                    )}

                    {/* ── Overlay de chargement avec progression ── */}
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
                            <div className="h-8 w-8 animate-spin rounded-full border-3 border-white border-t-transparent" />
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <>
                                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/20">
                                        <div
                                            className="h-full rounded-full bg-white transition-all duration-200"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-white/70">
                                        {uploadProgress}%
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Input texte pour superposition sur média ── */}
                {mode === 'media' && showOverlayInput && (
                    <div className="mx-4 mt-2">
                        <input
                            type="text"
                            value={overlayText}
                            onChange={(e) => setOverlayText(e.target.value)}
                            placeholder="Texte à afficher sur la story..."
                            maxLength={150}
                            className="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={loading}
                        />
                    </div>
                )}

                {/* ── Compteur de caractères (mode texte) ── */}
                {mode === 'text' && (
                    <div className="mx-4 mt-1 text-right text-xs text-white/40">
                        {text.length}/500
                    </div>
                )}

                {/* ── Sélecteur de couleurs (mode texte) ── */}
                {mode === 'text' && (
                    <div className="mx-4 mt-3">
                        <p className="mb-2 text-xs font-medium tracking-wider text-white/60 uppercase">
                            Couleur de fond
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {BG_COLORS.map(({ hex, label }) => (
                                <button
                                    key={hex}
                                    onClick={() => setBackground(hex)}
                                    disabled={loading}
                                    aria-label={label}
                                    title={label}
                                    className={`h-9 w-9 rounded-full transition hover:scale-110 active:scale-95 ${
                                        background === hex
                                            ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                                            : ''
                                    }`}
                                    style={{ backgroundColor: hex }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Boutons de mode ── */}
                <div className="mx-4 mt-4 flex gap-2">
                    <button
                        onClick={() => switchMode('text')}
                        disabled={loading}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                            mode === 'text'
                                ? 'bg-white text-zinc-900 shadow-md'
                                : 'bg-zinc-800 text-white/70 hover:bg-zinc-700 hover:text-white'
                        } disabled:opacity-40`}
                    >
                        <Type className="h-4 w-4" />
                        Texte
                    </button>

                    {/* Input fichier caché */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/quicktime,video/avi"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={loading}
                    />

                    <button
                        onClick={() => {
                            if (mode !== 'media') switchMode('media');
                            fileInputRef.current?.click();
                        }}
                        disabled={loading}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
                            mode === 'media'
                                ? 'bg-white text-zinc-900 shadow-md'
                                : 'bg-zinc-800 text-white/70 hover:bg-zinc-700 hover:text-white'
                        } disabled:opacity-40`}
                    >
                        <Upload className="h-4 w-4" />
                        Photo / Vidéo
                    </button>
                </div>

                {/* ── Bouton principal ── */}
                <div className="mx-4 mt-3 mb-4">
                    <button
                        onClick={handleCreateStory}
                        disabled={!canSubmit}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                {uploadProgress > 0 && uploadProgress < 100
                                    ? `Envoi ${uploadProgress}%…`
                                    : 'Traitement…'}
                            </>
                        ) : (
                            <>
                                <Sparkle className="h-4 w-4" />
                                Partager la story
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StoryModal;
