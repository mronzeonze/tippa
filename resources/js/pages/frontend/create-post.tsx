// // create-post.tsx
// // Page permettant de créer un nouveau post avec texte et/ou images

// // Import du layout principal
// import AppLayout from '@/layouts/app-layout';
// // Import du router Inertia et du hook usePage
// import { router, usePage } from '@inertiajs/react';
// // Import des icônes Lucide
// import { Image, X } from 'lucide-react';
// // Import des hooks React
// import { useState } from 'react';
// // Import de react-hot-toast pour les notifications
// import toast from 'react-hot-toast';

// import type { PageProps } from '@/types/post'; // Types TypeScript

// // Composant principal CreatePost
// const CreatePost = () => {
//     // État pour le contenu textuel du post
//     const [content, setContent] = useState('');

//     // État pour stocker les fichiers images sélectionnés
//     const [images, setImages] = useState<File[]>([]);

//     // État pour gérer le chargement pendant la soumission
//     const [loading, setLoading] = useState(false);

//     // Récupération de l'utilisateur connecté via Inertia
//     const { auth } = usePage<PageProps>().props;
//     const currentUser = auth.user;

//     // Fonction pour soumettre le post au serveur
//     const handleSubmit = async () => {
//         // Validation côté client : au moins du contenu OU des images
//         if (!content.trim() && images.length === 0) {
//             throw new Error(
//                 'Veuillez ajouter du contenu ou des images pour créer une publication',
//             );
//         }

//         // Activer l'état de chargement
//         setLoading(true);

//         // Créer un objet FormData pour envoyer fichiers + données
//         const formData = new FormData();

//         // Ajouter le contenu textuel (même vide pour posts image-only)
//         formData.append('content', content.trim());

//         // Ajouter toutes les images au FormData
//         images.forEach((image, index) => {
//             // Laravel attend images[0], images[1], etc.
//             formData.append(`images[${index}]`, image);
//         });

//         // Retourner une Promise pour l'intégration avec toast.promise
//         return new Promise((resolve, reject) => {
//             // Requête POST vers Laravel avec Inertia
//             router.post('/posts', formData, {
//                 preserveScroll: true, // Ne pas scroller après soumission
//                 onSuccess: () => {
//                     // Réinitialiser le formulaire après succès
//                     setContent('');
//                     setImages([]);
//                     setLoading(false);
//                     resolve(true); // Résoudre la promise pour toast.success
//                 },
//                 onError: (errors) => {
//                     // Désactiver le loading
//                     setLoading(false);
//                     console.error(errors);
//                     // Extraire le premier message d'erreur
//                     const errorMessage = Object.values(errors)[0] as string;
//                     // Rejeter la promise pour toast.error
//                     reject(
//                         new Error(
//                             errorMessage ||
//                                 'Échec de la création de la publication',
//                         ),
//                     );
//                 },
//                 onFinish: () => {
//                     // Toujours désactiver le loading à la fin
//                     setLoading(false);
//                 },
//             });
//         });
//     };

//     // Fonction pour calculer et afficher le type de post en temps réel
//     const getPostType = () => {
//         const hasContent = content.trim().length > 0; // A du texte ?
//         const hasImages = images.length > 0; // A des images ?

//         // Retourner le type correspondant
//         if (hasImages && hasContent) return 'Text + Images';
//         if (hasImages && !hasContent) return 'Images only';
//         if (hasContent && !hasImages) return 'Text only';
//         return 'Empty'; // Aucun contenu
//     };

//     // Vérifier si le post est valide pour activer/désactiver le bouton
//     const isPostValid = content.trim().length > 0 || images.length > 0;

//     // Image par défaut si pas de photo de profil
//     const defaultProfilePicture =
//         'http://localhost:8000/storage/images/default-avatar.jpg';

//     // Rendu du composant
//     return (
//         <AppLayout>
//             {/* Container principal avec gradient de fond */}
//             <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//                 <div className="mx-auto max-w-6xl p-6">
//                     {/* Section titre de la page */}
//                     <div className="mb-8">
//                         <h1 className="mb-2 text-3xl font-bold text-slate-900">
//                             Créer une publication
//                         </h1>
//                         <p className="text-slate-600">
//                             Partagez vos pensées avec le monde !
//                         </p>
//                     </div>

//                     {/* Formulaire de création */}
//                     <div className="max-w-xl space-y-4 rounded-xl bg-white p-4 shadow-md sm:p-8 sm:pb-3">
//                         {/* Header - Informations de l'utilisateur connecté */}
//                         <div className="flex items-center gap-3">
//                             {/* Photo de profil */}
//                             <img
//                                 src={
//                                     currentUser.profile_picture ||
//                                     defaultProfilePicture
//                                 }
//                                 alt={currentUser.full_name}
//                                 className="h-12 w-12 rounded-full object-cover shadow"
//                                 onError={(e) => {
//                                     // Fallback si l'image ne charge pas
//                                     e.currentTarget.src = defaultProfilePicture;
//                                 }}
//                             />
//                             {/* Nom et username */}
//                             <div>
//                                 <h2 className="font-semibold text-slate-900">
//                                     {currentUser.full_name}
//                                 </h2>
//                                 <p className="text-sm text-gray-500">
//                                     @{currentUser.username}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Zone de texte pour le contenu */}
//                         <textarea
//                             className="mt-4 max-h-32 w-full resize-none text-sm placeholder-gray-400 outline-none"
//                             placeholder="Qu'est-ce qui vous préoccupe ?" // Placeholder
//                             onChange={(e) => setContent(e.target.value)} // Mise à jour de l'état
//                             value={content} // Valeur contrôlée
//                             rows={4} // Hauteur initiale
//                             disabled={loading} // Désactivé pendant l'envoi
//                         />

//                         {/* Prévisualisation des images sélectionnées */}
//                         {images.length > 0 && (
//                             <div className="mt-4 flex flex-wrap gap-2">
//                                 {/* Boucle sur toutes les images */}
//                                 {images.map((image, i) => (
//                                     <div key={i} className="group relative">
//                                         {/* Miniature de l'image */}
//                                         <img
//                                             // createObjectURL pour afficher l'image avant upload
//                                             src={URL.createObjectURL(image)}
//                                             alt={`Preview ${i + 1}`}
//                                             className="h-20 w-20 rounded-md object-cover"
//                                         />
//                                         {/* Overlay avec bouton de suppression (visible au hover) */}
//                                         <div
//                                             onClick={() =>
//                                                 // Retirer l'image du tableau
//                                                 setImages(
//                                                     images.filter(
//                                                         (_, index) =>
//                                                             index !== i,
//                                                     ),
//                                                 )
//                                             }
//                                             className="absolute top-0 right-0 bottom-0 left-0 hidden cursor-pointer items-center justify-center rounded-md bg-black/40 transition group-hover:flex"
//                                         >
//                                             {/* Icône X pour supprimer */}
//                                             <X className="h-6 w-6 text-white" />
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}

//                         {/* Indicateur du type de post */}
//                         {/* <div className="flex items-center justify-between text-xs text-gray-500">
//                             <span>
//                                 Type de publication :{' '}
//                                 <span className="font-medium">
//                                     {getPostType()}{' '}
                                    
//                                 </span>
//                             </span>
                            
//                             {images.length > 0 && (
//                                 <span>
//                                     {images.length} image
//                                     {images.length > 1 ? 's' : ''}
//                                 </span>
//                             )}
//                         </div> */}

//                         {/* Barre d'actions en bas */}
//                         <div className="flex items-center justify-between border-t border-gray-300 pt-3">
//                             {/* Label pour le bouton d'upload d'images */}
//                             <label
//                                 htmlFor="images"
//                                 className={`flex items-center gap-2 text-sm text-gray-500 transition ${
//                                     loading
//                                         ? 'cursor-not-allowed opacity-50'
//                                         : 'cursor-pointer hover:text-gray-700'
//                                 }`}
//                             >
//                                 {/* Icône image */}
//                                 <Image className="size-6" />
//                                 {/* Texte caché sur mobile */}
//                                 <span className="hidden sm:inline">
//                                     Ajouter des images
//                                 </span>
//                             </label>

//                             {/* Input file caché (déclenché par le label) */}
//                             <input
//                                 type="file"
//                                 id="images"
//                                 accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" // Types acceptés
//                                 hidden // Caché visuellement
//                                 multiple // Sélection multiple
//                                 disabled={loading} // Désactivé pendant l'envoi
//                                 onChange={(e) => {
//                                     if (e.target.files) {
//                                         // Convertir FileList en Array
//                                         const newImages = Array.from(
//                                             e.target.files,
//                                         );
//                                         // Ajouter les nouvelles images aux existantes
//                                         setImages([...images, ...newImages]);
//                                         // Reset l'input pour permettre de re-sélectionner le même fichier
//                                         e.target.value = '';
//                                     }
//                                 }}
//                             />

//                             {/* Bouton de publication */}
//                             <button
//                                 disabled={loading || !isPostValid} // Désactivé si loading ou invalide
//                                 onClick={() => {
//                                     // Validation avant soumission
//                                     if (!isPostValid) {
//                                         toast.error(
//                                             'Veuillez ajouter du contenu ou des images',
//                                         );
//                                         return;
//                                     }
//                                     // toast.promise pour afficher les états de la requête
//                                     toast.promise(handleSubmit(), {
//                                         loading: 'Publication en cours...', // Pendant la requête
//                                         success: 'Publication réussie !', // En cas de succès
//                                         error: (
//                                             err, // En cas d'erreur
//                                         ) =>
//                                             err.message ||
//                                             'Échec de la publication',
//                                     });
//                                 }}
//                                 className={`rounded-md px-8 py-2 text-sm font-medium text-white transition active:scale-95 ${
//                                     loading || !isPostValid
//                                         ? 'cursor-not-allowed bg-gray-400' // Style désactivé
//                                         : 'cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700' // Style actif
//                                 }`}
//                             >
//                                 {/* Texte du bouton change selon l'état */}
//                                 {loading
//                                     ? 'Publication en cours...'
//                                     : 'Publier la publication'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// };

// // Export par défaut du composant
// export default CreatePost;

// create-post.tsx
// Page de création d'un post — avec validation dynamique depuis les paramètres plateforme


// import AppLayout from '@/layouts/app-layout';
// import { usePostValidation, useSettings } from '@/hooks/useSettings';
// import { router, usePage } from '@inertiajs/react';
// import { AlertTriangle, Image, Info, Loader2, Send, X } from 'lucide-react';
// import { useCallback, useMemo, useRef, useState } from 'react';
// import toast from 'react-hot-toast';

// import type { PageProps } from '@/types/post';

// // ─────────────────────────────────────────────────────────
// // COMPOSANT PRINCIPAL
// // ─────────────────────────────────────────────────────────

// const CreatePost = () => {
//     const { auth } = usePage<PageProps>().props;
//     const currentUser = auth.user;

//     // ✅ Paramètres plateforme via le hook
//     const { maxPostLength, maxImagesPerPost, maxImageSizeKb, isModerationEnabled } = useSettings();
//     const { validateContent, validateImages } = usePostValidation();

//     const [content, setContent]         = useState('');
//     const [images, setImages]           = useState<File[]>([]);
//     const [previews, setPreviews]       = useState<string[]>([]);
//     const [loading, setLoading]         = useState(false);
//     const [contentError, setContentError] = useState<string | null>(null);
//     const [imageError, setImageError]   = useState<string | null>(null);

//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // ── Compteur de caractères ────────────────────────────────────────────────

//     const charCount         = content.length;
//     const charRemaining     = maxPostLength - charCount;
//     const isNearLimit       = charRemaining < maxPostLength * 0.1; // 90% utilisé
//     const isOverLimit       = charRemaining < 0;

//     const charColor = useMemo(() => {
//         if (isOverLimit)  return 'text-red-600 font-bold';
//         if (isNearLimit)  return 'text-amber-500 font-medium';
//         return 'text-slate-400';
//     }, [isOverLimit, isNearLimit]);

//     // ── Gestion du contenu ───────────────────────────────────────────────────

//     const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//         const val = e.target.value;
//         setContent(val);
//         // ✅ Validation temps réel
//         setContentError(val.length > 0 ? validateContent(val) : null);
//     };

//     // ── Gestion des images ───────────────────────────────────────────────────

//     const handleImageSelect = useCallback((files: FileList | null) => {
//         if (!files) return;

//         const newFiles  = Array.from(files);
//         const merged    = [...images, ...newFiles];

//         // ✅ Validation avec les limites plateforme
//         const err = validateImages(merged);
//         if (err) {
//             setImageError(err);
//             return;
//         }

//         setImageError(null);
//         setImages(merged);

//         // Générer les previews
//         newFiles.forEach((file) => {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setPreviews((prev) => [...prev, reader.result as string]);
//             };
//             reader.readAsDataURL(file);
//         });
//     }, [images, validateImages]);

//     const removeImage = (index: number) => {
//         setImages((prev) => prev.filter((_, i) => i !== index));
//         setPreviews((prev) => prev.filter((_, i) => i !== index));
//         setImageError(null);
//     };

//     // ── Soumission ───────────────────────────────────────────────────────────

//     const canSubmit = !loading && !isOverLimit && (content.trim().length > 0 || images.length > 0);

//     const handleSubmit = () => {
//         // Revalidation finale
//         const cErr = content.length > 0 ? validateContent(content) : null;
//         const iErr = images.length > 0   ? validateImages(images)   : null;

//         if (cErr) { setContentError(cErr); return; }
//         if (iErr) { setImageError(iErr);   return; }

//         if (!content.trim() && images.length === 0) {
//             toast.error('Veuillez ajouter du contenu ou des images.');
//             return;
//         }

//         setLoading(true);

//         const formData = new FormData();
//         formData.append('content', content.trim());
//         images.forEach((img, i) => formData.append(`images[${i}]`, img));

//         return toast.promise(
//             new Promise<void>((resolve, reject) => {
//                 router.post('/posts', formData, {
//                     preserveScroll: true,
//                     onSuccess: () => resolve(),
//                     onError:   (errors) => reject(new Error(Object.values(errors).join(', '))),
//                     onFinish:  () => setLoading(false),
//                 });
//             }),
//             {
//                 loading: 'Publication en cours…',
//                 success: isModerationEnabled
//                     ? '📋 Publication soumise ! Elle sera vérifiée avant d\'apparaître.'
//                     : '✅ Publication créée !',
//                 error: (err) => err?.message ?? 'Une erreur est survenue.',
//             },
//         );
//     };

//     // ─────────────────────────────────────────────────────────
//     // RENDER
//     // ─────────────────────────────────────────────────────────

//     return (
//         <AppLayout>
//             <div className="max-w-2xl mx-auto px-4 py-8">

//                 {/* ── Alerte modération ── */}
//                 {isModerationEnabled && (
//                     <div className="mb-4 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
//                         <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//                         <span>
//                             La modération est activée. Votre publication sera visible après validation par notre équipe.
//                         </span>
//                     </div>
//                 )}

//                 {/* ── Formulaire ── */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

//                     {/* En-tête */}
//                     <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
//                         <img
//                             src={currentUser?.profile_picture || '/images/default-avatar.jpg'}
//                             alt={currentUser?.full_name}
//                             className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
//                         />
//                         <div>
//                             <div className="font-semibold text-slate-800 text-sm">{currentUser?.full_name}</div>
//                             <div className="text-xs text-slate-400">@{currentUser?.username}</div>
//                         </div>
//                     </div>

//                     {/* Zone de texte */}
//                     <div className="px-5 py-4">
//                         <textarea
//                             value={content}
//                             onChange={handleContentChange}
//                             placeholder="Partagez un remède, une plante, une technique traditionnelle…"
//                             rows={5}
//                             className={`w-full resize-none text-slate-800 placeholder-slate-400 text-sm leading-relaxed
//                                 focus:outline-none bg-transparent
//                                 ${contentError ? 'text-red-500' : ''}`}
//                             disabled={loading}
//                         />

//                         {/* Compteur de caractères */}
//                         <div className="flex items-center justify-between mt-2">
//                             <div>
//                                 {contentError && (
//                                     <p className="text-xs text-red-600">{contentError}</p>
//                                 )}
//                             </div>
//                             <div className={`text-xs tabular-nums ${charColor}`}>
//                                 {charCount.toLocaleString('fr-FR')} / {maxPostLength.toLocaleString('fr-FR')}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Préviews images */}
//                     {previews.length > 0 && (
//                         <div className="px-5 pb-4">
//                             <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
//                                 {previews.map((src, i) => (
//                                     <div key={i} className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square">
//                                         <img
//                                             src={src}
//                                             alt={`Image ${i + 1}`}
//                                             className="w-full h-full object-cover"
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => removeImage(i)}
//                                             className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80
//                                                        text-white rounded-full p-1 transition-colors"
//                                         >
//                                             <X className="w-3.5 h-3.5" />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                             {imageError && (
//                                 <p className="text-xs text-red-600 mt-2">{imageError}</p>
//                             )}
//                         </div>
//                     )}

//                     {/* Barre d'actions */}
//                     <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
//                         <div className="flex items-center gap-2">

//                             {/* ✅ Bouton image avec limite dynamique */}
//                             <button
//                                 type="button"
//                                 onClick={() => fileInputRef.current?.click()}
//                                 disabled={images.length >= maxImagesPerPost || loading}
//                                 title={`Ajouter des images (max ${maxImagesPerPost})`}
//                                 className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500
//                                            hover:bg-slate-200 hover:text-emerald-600 transition-colors text-sm
//                                            disabled:opacity-40 disabled:cursor-not-allowed"
//                             >
//                                 <Image className="w-4 h-4" />
//                                 <span className="hidden sm:inline">
//                                     Photo {images.length > 0 && `(${images.length}/${maxImagesPerPost})`}
//                                 </span>
//                             </button>

//                             {/* Info limite image */}
//                             <div className="flex items-center gap-1 text-xs text-slate-400">
//                                 <Info className="w-3 h-3" />
//                                 <span className="hidden sm:inline">Max {maxImageSizeKb} Ko / image</span>
//                             </div>
//                         </div>

//                         {/* Bouton publier */}
//                         <button
//                             type="button"
//                             onClick={handleSubmit}
//                             disabled={!canSubmit}
//                             className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600
//                                        text-white text-sm font-semibold hover:bg-emerald-700
//                                        disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
//                         >
//                             {loading
//                                 ? <Loader2 className="w-4 h-4 animate-spin" />
//                                 : <Send className="w-4 h-4" />
//                             }
//                             {loading ? 'Publication…' : 'Publier'}
//                         </button>
//                     </div>

//                     {/* Input file caché */}
//                     <input
//                         ref={fileInputRef}
//                         type="file"
//                         accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                         multiple
//                         className="hidden"
//                         onChange={(e) => handleImageSelect(e.target.files)}
//                     />
//                 </div>
//             </div>
//         </AppLayout>
//     );
// };

// export default CreatePost;

import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Image, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { PageProps } from '@/types/post';

// ─── Type des limites transmises par PostController::create ───────────────────
interface PostLimits {
    max_length:        number;
    max_images:        number;
    max_image_size_kb: number;
}

// ─── Props de la page ─────────────────────────────────────────────────────────
interface CreatePostPageProps extends PageProps {
    post_limits?: PostLimits;
}

// ─── Limites par défaut si le controller ne les envoie pas ───────────────────
const DEFAULT_LIMITS: PostLimits = {
    max_length:        5000,
    max_images:        10,
    max_image_size_kb: 5120,
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────────────────────────────────────

const CreatePost = () => {
    const { auth, post_limits } = usePage<CreatePostPageProps>().props;
    const currentUser = auth.user;

    // ✅ Utiliser les limites reçues depuis Laravel, avec fallback sur les défauts
    const limits: PostLimits = post_limits ?? DEFAULT_LIMITS;

    const [content, setContent]     = useState('');
    const [images, setImages]       = useState<File[]>([]);
    const [loading, setLoading]     = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const defaultProfilePicture = 'http://localhost:8000/storage/images/default-avatar.jpg';

    // ─── Validation ──────────────────────────────────────────────────────────

    const isContentValid  = content.trim().length > 0;
    const isImagesPresent = images.length > 0;
    const isPostValid     = isContentValid || isImagesPresent;

    // Compteur de caractères
    const charCount     = content.length;
    const charRemaining = limits.max_length - charCount;
    const isOverLimit   = charRemaining < 0;
    const isNearLimit   = charRemaining >= 0 && charRemaining < limits.max_length * 0.1;

    // ─── Gestion de l'ajout d'images ─────────────────────────────────────────

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles  = Array.from(e.target.files);
        const merged    = [...images, ...newFiles];

        // ✅ FIX 1 : Vérifier le nombre d'images AVANT d'ajouter
        if (merged.length > limits.max_images) {
            setImageError(
                `Limite de ${limits.max_images} image${limits.max_images > 1 ? 's' : ''} atteinte. `
                + `Vous avez sélectionné ${merged.length} images au total.`
            );
            e.target.value = '';
            return;
        }

        // ✅ FIX 2 : Vérifier la taille de chaque nouvelle image
        const oversized = newFiles.find(f => f.size > limits.max_image_size_kb * 1024);
        if (oversized) {
            setImageError(
                `"${oversized.name}" dépasse la taille maximale autorisée (${limits.max_image_size_kb} Ko).`
            );
            e.target.value = '';
            return;
        }

        setImageError(null);
        setImages(merged);
        e.target.value = ''; // Reset pour permettre de resélectionner
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageError(null);
    };

    // ─── Soumission ──────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!isPostValid) {
            throw new Error('Veuillez ajouter du contenu ou des images.');
        }

        // ✅ FIX 3 : Revalider côté client avant envoi (sécurité)
        if (images.length > limits.max_images) {
            throw new Error(
                `Vous avez ${images.length} images. La limite est ${limits.max_images}.`
            );
        }
        if (isOverLimit) {
            throw new Error(
                `Le contenu dépasse la limite de ${limits.max_length} caractères.`
            );
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('content', content.trim());
        images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        return new Promise((resolve, reject) => {
            router.post('/posts', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setContent('');
                    setImages([]);
                    setImageError(null);
                    setLoading(false);
                    resolve(true);
                },
                onError: (errors) => {
                    setLoading(false);
                    const errorMessage = Object.values(errors)[0] as string;
                    reject(new Error(errorMessage || 'Échec de la publication'));
                },
                onFinish: () => setLoading(false),
            });
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <div className="mx-auto max-w-6xl p-6">
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-bold text-slate-900">
                            Créer une publication
                        </h1>
                        <p className="text-slate-600">Partagez vos pensées avec le monde !</p>
                    </div>

                    <div className="max-w-xl space-y-4 rounded-xl bg-white p-4 shadow-md sm:p-8 sm:pb-3">

                        {/* En-tête utilisateur */}
                        <div className="flex items-center gap-3">
                            <img
                                src={currentUser.profile_picture || defaultProfilePicture}
                                alt={currentUser.full_name}
                                className="h-12 w-12 rounded-full object-cover shadow"
                                onError={(e) => { e.currentTarget.src = defaultProfilePicture; }}
                            />
                            <div>
                                <h2 className="font-semibold text-slate-900">{currentUser.full_name}</h2>
                                <p className="text-sm text-gray-500">@{currentUser.username}</p>
                            </div>
                        </div>

                        {/* Zone de texte */}
                        <textarea
                            className="mt-4 max-h-32 w-full resize-none text-sm placeholder-gray-400 outline-none"
                            placeholder="Partagez un remède, une plante, une technique traditionnelle…"
                            onChange={(e) => setContent(e.target.value)}
                            value={content}
                            rows={4}
                            disabled={loading}
                        />

                        {/* ✅ Compteur de caractères dynamique */}
                        <div className="flex justify-end">
                            <span className={`text-xs tabular-nums ${
                                isOverLimit  ? 'text-red-600 font-bold' :
                                isNearLimit  ? 'text-amber-500 font-medium' :
                                'text-gray-400'
                            }`}>
                                {charCount.toLocaleString('fr-FR')} / {limits.max_length.toLocaleString('fr-FR')}
                            </span>
                        </div>

                        {/* Prévisualisation des images */}
                        {images.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {images.map((image, i) => (
                                    <div key={i} className="group relative">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Preview ${i + 1}`}
                                            className="h-20 w-20 rounded-md object-cover"
                                        />
                                        <div
                                            onClick={() => removeImage(i)}
                                            className="absolute top-0 right-0 bottom-0 left-0 hidden cursor-pointer items-center justify-center rounded-md bg-black/40 transition group-hover:flex"
                                        >
                                            <X className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ✅ Message d'erreur image */}
                        {imageError && (
                            <p className="text-xs text-red-600 mt-1">{imageError}</p>
                        )}

                        {/* Barre d'actions */}
                        <div className="flex items-center justify-between border-t border-gray-300 pt-3">

                            {/* Bouton image avec compteur et limite */}
                            <label
                                htmlFor="images"
                                className={`flex items-center gap-2 text-sm transition ${
                                    loading || images.length >= limits.max_images
                                        ? 'cursor-not-allowed text-gray-300 opacity-50'  // ✅ Désactivé si limite atteinte
                                        : 'cursor-pointer text-gray-500 hover:text-gray-700'
                                }`}
                                title={
                                    images.length >= limits.max_images
                                        ? `Limite de ${limits.max_images} images atteinte`
                                        : `Ajouter des images (max ${limits.max_images})`
                                }
                            >
                                <Image className="size-6" />
                                <span className="hidden sm:inline">
                                    {/* ✅ Affiche le compteur dynamique */}
                                    {images.length > 0
                                        ? `${images.length} / ${limits.max_images} image${images.length > 1 ? 's' : ''}`
                                        : 'Ajouter des images'
                                    }
                                </span>
                            </label>

                            {/* Input file — désactivé quand limite atteinte */}
                            <input
                                type="file"
                                id="images"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                hidden
                                multiple
                                // ✅ FIX : désactiver quand la limite est déjà atteinte
                                disabled={loading || images.length >= limits.max_images}
                                onChange={handleImageChange}
                            />

                            {/* Bouton publier */}
                            <button
                                disabled={loading || !isPostValid || isOverLimit}
                                onClick={() => {
                                    if (!isPostValid) {
                                        toast.error('Veuillez ajouter du contenu ou des images');
                                        return;
                                    }
                                    toast.promise(handleSubmit(), {
                                        loading: 'Publication en cours...',
                                        success: 'Publication réussie !',
                                        error: (err) => err.message || 'Échec de la publication',
                                    });
                                }}
                                className={`rounded-md px-8 py-2 text-sm font-medium text-white transition active:scale-95 ${
                                    loading || !isPostValid || isOverLimit
                                        ? 'cursor-not-allowed bg-gray-400'
                                        : 'cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                                }`}
                            >
                                {loading ? 'Publication en cours...' : 'Publier la publication'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default CreatePost;