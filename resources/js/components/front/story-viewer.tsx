// // story-viewer.tsx
// // Viewer pour naviguer entre les stories d'un utilisateur

// import { PageProps, StoryViewerProps } from '@/types/story';
// import { router, usePage } from '@inertiajs/react';
// import { ArrowLeft, ArrowRight, Pause, Play, Trash2, X } from 'lucide-react';
// import moment from 'moment';
// import { useEffect, useRef, useState } from 'react';
// import toast from 'react-hot-toast';



// // ========================================
// // COMPOSANT PRINCIPAL
// // ========================================
// const StoryViewer = ({
//     userStories,
//     setViewStory,
//     onStoryDeleted,
// }: StoryViewerProps) => {
//     // États
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [progress, setProgress] = useState(0);
//     const [isPaused, setIsPaused] = useState(false);
//     const [isDeleting, setIsDeleting] = useState(false);

//     // Refs
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const progressInterval = useRef<NodeJS.Timeout | null>(null);

//     // Récupérer l'utilisateur connecté
//     const { auth } = usePage<PageProps>().props;
//     const currentUser = auth.user;

//     // Story actuelle
//     const currentStory = userStories.stories[currentIndex];
//     const isOwnStory = currentStory && currentUser.id === userStories.user.id;

//     // Durée d'affichage par défaut (5 secondes)
//     const STORY_DURATION = 5000;

//     // Image par défaut
//     const defaultProfilePicture = (name: string) =>
//         'http://localhost:8000/storage/images/default-avatar.jpg';

//     /**
//      * Gérer la progression automatique de la story
//      */
//     useEffect(() => {
//         if (isPaused || !currentStory) return;

//         // Réinitialiser la progression
//         setProgress(0);

//         // Créer un intervalle pour la barre de progression
//         progressInterval.current = setInterval(() => {
//             setProgress((prev) => {
//                 if (prev >= 100) {
//                     goToNext();
//                     return 0;
//                 }
//                 return prev + (100 / STORY_DURATION) * 100;
//             });
//         }, 100);

//         return () => {
//             if (progressInterval.current) {
//                 clearInterval(progressInterval.current);
//             }
//         };
//     }, [currentIndex, isPaused, currentStory]);

//     /**
//      * Aller à la story suivante
//      */
//     const goToNext = () => {
//         if (currentIndex < userStories.stories.length - 1) {
//             setCurrentIndex(currentIndex + 1);
//             setProgress(0);
//         } else {
//             // Fin des stories
//             setViewStory(null);
//         }
//     };

//     /**
//      * Aller à la story précédente
//      */
//     const goToPrevious = () => {
//         if (currentIndex > 0) {
//             setCurrentIndex(currentIndex - 1);
//             setProgress(0);
//         }
//     };

//     /**
//      * Basculer pause/lecture
//      */
//     const togglePause = () => {
//         setIsPaused(!isPaused);
//         if (videoRef.current) {
//             if (isPaused) {
//                 videoRef.current.play();
//             } else {
//                 videoRef.current.pause();
//             }
//         }
//     };

//     /**
//      * Supprimer la story actuelle
//      */
//     const deleteStory = () => {
//         if (!confirm('Supprimer cette story ?')) return;

//         setIsDeleting(true);

//         router.delete(`/stories/${currentStory.id}`, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 toast.success('Story supprimée avec succès');

//                 // Si c'était la dernière story, fermer le viewer
//                 if (userStories.stories.length === 1) {
//                     setViewStory(null);
//                 } else {
//                     // Sinon, passer à la suivante ou fermer
//                     if (currentIndex < userStories.stories.length - 1) {
//                         goToNext();
//                     } else if (currentIndex > 0) {
//                         goToPrevious();
//                     } else {
//                         setViewStory(null);
//                     }
//                 }

//                 if (onStoryDeleted) onStoryDeleted();
//             },
//             onError: () => {
//                 toast.error('Echec de la suppression de la story');
//             },
//             onFinish: () => {
//                 setIsDeleting(false);
//             },
//         });
//     };

//     /**
//      * Fermer le viewer
//      */
//     const handleClose = () => {
//         setViewStory(null);
//     };

//     /**
//      * Gérer les clics sur les zones gauche/droite
//      */
//     const handleAreaClick = (side: 'left' | 'right') => {
//         if (side === 'left') {
//             goToPrevious();
//         } else {
//             goToNext();
//         }
//     };

//     if (!currentStory) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
//             {/* Barres de progression en haut */}
//             <div className="absolute top-0 left-0 z-20 flex w-full gap-1 p-2">
//                 {userStories.stories.map((_, index) => (
//                     <div
//                         key={index}
//                         className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
//                     >
//                         <div
//                             className="h-full bg-white transition-all duration-100"
//                             style={{
//                                 width:
//                                     index < currentIndex
//                                         ? '100%'
//                                         : index === currentIndex
//                                           ? `${progress}%`
//                                           : '0%',
//                             }}
//                         />
//                     </div>
//                 ))}
//             </div>

//             {/* Header avec infos utilisateur */}
//             <div className="absolute top-0 left-0 z-20 flex w-full items-center justify-between p-4 pt-6">
//                 <div className="flex items-center gap-3">
//                     <img
//                         src={
//                             userStories.user.profile_picture ||
//                             defaultProfilePicture(userStories.user.full_name)
//                         }
//                         alt={userStories.user.full_name}
//                         className="h-10 w-10 rounded-full border-2 border-white object-cover"
//                         onError={(e) => {
//                             e.currentTarget.src = defaultProfilePicture(
//                                 userStories.user.full_name,
//                             );
//                         }}
//                     />
//                     <div>
//                         <p className="font-semibold text-white">
//                             {userStories.user.full_name}
//                         </p>
//                         <p className="text-xs text-white/80">
//                             {moment(currentStory.created_at).fromNow()}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                     {/* Bouton pause/play */}
//                     <button
//                         onClick={togglePause}
//                         className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
//                     >
//                         {isPaused ? (
//                             <Play className="h-5 w-5" />
//                         ) : (
//                             <Pause className="h-5 w-5" />
//                         )}
//                     </button>

//                     {/* Bouton supprimer (seulement pour ses propres stories) */}
//                     {isOwnStory && (
//                         <button
//                             onClick={deleteStory}
//                             disabled={isDeleting}
//                             className="rounded-full bg-red-500/80 p-2 text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-50"
//                         >
//                             <Trash2 className="h-5 w-5" />
//                         </button>
//                     )}

//                     {/* Bouton fermer */}
//                     <button
//                         onClick={handleClose}
//                         className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
//                     >
//                         <X className="h-5 w-5" />
//                     </button>
//                 </div>
//             </div>

//             {/* Contenu de la story */}
//             <div className="relative h-full w-full max-w-lg">
//                 {/* Zone cliquable gauche */}
//                 <div
//                     className="absolute top-0 left-0 z-10 h-full w-1/2 cursor-pointer"
//                     onClick={() => handleAreaClick('left')}
//                 />

//                 {/* Zone cliquable droite */}
//                 <div
//                     className="absolute top-0 right-0 z-10 h-full w-1/2 cursor-pointer"
//                     onClick={() => handleAreaClick('right')}
//                 />

//                 {/* Story type: text */}
//                 {currentStory.media_type === 'text' && (
//                     <div
//                         className="flex h-full items-center justify-center p-8"
//                         style={{
//                             backgroundColor: currentStory.background_color,
//                         }}
//                     >
//                         <p className="text-center text-2xl font-bold text-white">
//                             {currentStory.content}
//                         </p>
//                     </div>
//                 )}

//                 {/* Story type: image */}
//                 {currentStory.media_type === 'image' &&
//                     currentStory.media_url && (
//                         <div className="flex h-full items-center justify-center bg-black">
//                             <img
//                                 src={currentStory.media_url}
//                                 alt="Story"
//                                 className="max-h-full max-w-full object-contain"
//                             />
//                         </div>
//                     )}

//                 {/* Story type: video */}
//                 {currentStory.media_type === 'video' &&
//                     currentStory.media_url && (
//                         <div className="flex h-full items-center justify-center bg-black">
//                             <video
//                                 ref={videoRef}
//                                 src={currentStory.media_url}
//                                 className="max-h-full max-w-full object-contain"
//                                 autoPlay
//                                 onEnded={goToNext}
//                             />
//                         </div>
//                     )}
//             </div>

//             {/* Boutons de navigation (optionnels, visibles au hover) */}
//             {currentIndex > 0 && (
//                 <button
//                     onClick={goToPrevious}
//                     className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-sm transition hover:bg-white/30 hover:opacity-100"
//                 >
//                     <ArrowLeft className="h-6 w-6" />
//                 </button>
//             )}

//             {currentIndex < userStories.stories.length - 1 && (
//                 <button
//                     onClick={goToNext}
//                     className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-sm transition hover:bg-white/30 hover:opacity-100"
//                 >
//                     <ArrowRight className="h-6 w-6" />
//                 </button>
//             )}
//         </div>
//     );
// };

// export default StoryViewer;

// story-viewer.tsx
// Viewer pour naviguer entre les stories d'un utilisateur
// Améliorations : stale closure corrigé, navigation clavier, swipe tactile,
//                 sync vidéo/barre de progression, tracking des vues, UX fluide.

// import { PageProps, StoryViewerProps } from '@/types/story';
// import axios from 'axios';
// import { router, usePage } from '@inertiajs/react';
// import { ArrowLeft, ArrowRight, Pause, Play, Trash2, X } from 'lucide-react';
// import moment from 'moment';
// import { useCallback, useEffect, useRef, useState } from 'react';
// import toast from 'react-hot-toast';

// // ============================================================
// // CONSTANTES
// // ============================================================
// const TEXT_STORY_DURATION = 5000;   // 5 secondes pour les stories texte/image
// const PROGRESS_TICK_MS    = 100;    // fréquence de mise à jour en ms

// // ============================================================
// // COMPOSANT PRINCIPAL
// // ============================================================
// const StoryViewer = ({ userStories, setViewStory, onStoryDeleted }: StoryViewerProps) => {
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [progress, setProgress]         = useState(0);
//     const [isPaused, setIsPaused]         = useState(false);
//     const [isDeleting, setIsDeleting]     = useState(false);

//     const videoRef         = useRef<HTMLVideoElement>(null);
//     const videoDuration    = useRef<number>(TEXT_STORY_DURATION); // en ms
//     const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
//     const viewTracked      = useRef<Set<string>>(new Set()); // stories déjà tracées

//     // Drag/swipe
//     const touchStartX = useRef<number>(0);
//     const touchEndX   = useRef<number>(0);

//     const { auth } = usePage<PageProps>().props;
//     const currentUser = auth.user;

//     const currentStory = userStories.stories[currentIndex];
//     const isOwnStory   = currentUser.id === userStories.user.id;

//     // --------------------------------------------------------
//     // Helpers
//     // --------------------------------------------------------
//     const defaultAvatar = useCallback((name: string) => {
//         // Initiales via UI Avatar (pas de localhost hardcodé)
//         const initials = name
//             .split(' ')
//             .map((n) => n[0])
//             .slice(0, 2)
//             .join('')
//             .toUpperCase();
//         return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4f46e5&color=fff`;
//     }, []);

//     // --------------------------------------------------------
//     // Tracker la vue côté API (une fois par story)
//     // --------------------------------------------------------
//     const trackView = useCallback((storyId: string) => {
//         if (viewTracked.current.has(storyId) || isOwnStory) return;
//         viewTracked.current.add(storyId);
//         axios.post(`/api/stories/${storyId}/view`).catch(() => {/* silencieux */});
//     }, [isOwnStory]);

//     // --------------------------------------------------------
//     // Aller à la story suivante (mémorisé pour éviter stale closure)
//     // --------------------------------------------------------
//     const goToNext = useCallback(() => {
//         setCurrentIndex((prev) => {
//             if (prev < userStories.stories.length - 1) {
//                 setProgress(0);
//                 return prev + 1;
//             }
//             // Fin des stories → fermer
//             setViewStory(null);
//             return prev;
//         });
//     }, [userStories.stories.length, setViewStory]);

//     // --------------------------------------------------------
//     // Aller à la story précédente
//     // --------------------------------------------------------
//     const goToPrevious = useCallback(() => {
//         setCurrentIndex((prev) => {
//             if (prev > 0) {
//                 setProgress(0);
//                 return prev - 1;
//             }
//             return prev;
//         });
//     }, []);

//     // --------------------------------------------------------
//     // Navigation clavier
//     // --------------------------------------------------------
//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             switch (e.key) {
//                 case 'ArrowRight': goToNext();     break;
//                 case 'ArrowLeft':  goToPrevious(); break;
//                 case 'Escape':     setViewStory(null); break;
//                 case ' ':
//                     e.preventDefault();
//                     togglePause();
//                     break;
//             }
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [goToNext, goToPrevious]);

//     // --------------------------------------------------------
//     // Swipe tactile
//     // --------------------------------------------------------
//     const handleTouchStart = (e: React.TouchEvent) => {
//         touchStartX.current = e.touches[0].clientX;
//     };

//     const handleTouchEnd = (e: React.TouchEvent) => {
//         touchEndX.current = e.changedTouches[0].clientX;
//         const diff = touchStartX.current - touchEndX.current;
//         if (Math.abs(diff) > 50) {
//             diff > 0 ? goToNext() : goToPrevious();
//         }
//     };

//     // --------------------------------------------------------
//     // Progression automatique
//     // --------------------------------------------------------
//     useEffect(() => {
//         if (!currentStory) return;

//         // Tracker la vue de la story courante
//         trackView(currentStory.id);

//         // Pour les vidéos, on attend d'avoir la durée réelle
//         const isVideo = currentStory.media_type === 'video';

//         // Réinitialiser
//         setProgress(0);

//         // Pour les vidéos, le timer est géré par les événements du lecteur
//         if (isVideo) return;

//         if (isPaused) return;

//         const duration = TEXT_STORY_DURATION;
//         const increment = (100 / duration) * PROGRESS_TICK_MS;

//         progressInterval.current = setInterval(() => {
//             setProgress((prev) => {
//                 const next = prev + increment;
//                 if (next >= 100) {
//                     clearInterval(progressInterval.current!);
//                     goToNext();
//                     return 100;
//                 }
//                 return next;
//             });
//         }, PROGRESS_TICK_MS);

//         return () => {
//             if (progressInterval.current) clearInterval(progressInterval.current);
//         };
//     }, [currentIndex, isPaused, currentStory, goToNext, trackView]);

//     // --------------------------------------------------------
//     // Sync vidéo : mettre à jour la progression depuis la durée réelle
//     // --------------------------------------------------------
//     const handleVideoLoadedMetadata = () => {
//         const video = videoRef.current;
//         if (!video || !video.duration) return;
//         videoDuration.current = video.duration * 1000; // → ms
//     };

//     const handleVideoTimeUpdate = () => {
//         const video = videoRef.current;
//         if (!video || isPaused) return;
//         const pct = (video.currentTime / video.duration) * 100;
//         setProgress(pct);
//     };

//     // --------------------------------------------------------
//     // Pause / lecture
//     // --------------------------------------------------------
//     const togglePause = useCallback(() => {
//         setIsPaused((prev) => {
//             const nextPaused = !prev;
//             if (videoRef.current) {
//                 nextPaused ? videoRef.current.pause() : videoRef.current.play();
//             }
//             return nextPaused;
//         });
//     }, []);

//     // --------------------------------------------------------
//     // Supprimer la story courante
//     // --------------------------------------------------------
//     const deleteStory = () => {
//         if (!confirm('Supprimer cette story ?')) return;

//         setIsDeleting(true);

//         router.delete(`/api/stories/${currentStory.id}`, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 toast.success('Story supprimée.');
//                 onStoryDeleted?.();

//                 if (userStories.stories.length === 1) {
//                     setViewStory(null);
//                 } else {
//                     currentIndex < userStories.stories.length - 1
//                         ? goToNext()
//                         : goToPrevious();
//                 }
//             },
//             onError: () => toast.error('Impossible de supprimer la story.'),
//             onFinish: () => setIsDeleting(false),
//         });
//     };

//     if (!currentStory) return null;

//     return (
//         <div
//             role="dialog"
//             aria-modal="true"
//             aria-label="Visionneuse de stories"
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black"
//             onTouchStart={handleTouchStart}
//             onTouchEnd={handleTouchEnd}
//         >
//             {/* ── Barres de progression ── */}
//             <div className="absolute top-0 left-0 z-20 flex w-full gap-1 px-2 pt-2">
//                 {userStories.stories.map((_, idx) => (
//                     <div
//                         key={idx}
//                         className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
//                     >
//                         <div
//                             className="h-full bg-white transition-all duration-100 ease-linear"
//                             style={{
//                                 width:
//                                     idx < currentIndex
//                                         ? '100%'
//                                         : idx === currentIndex
//                                         ? `${progress}%`
//                                         : '0%',
//                             }}
//                         />
//                     </div>
//                 ))}
//             </div>

//             {/* ── En-tête ── */}
//             <div className="absolute top-2 left-0 z-20 flex w-full items-center justify-between px-3 pt-4">
//                 <div className="flex items-center gap-2">
//                     <img
//                         src={userStories.user.profile_picture || defaultAvatar(userStories.user.full_name)}
//                         alt={userStories.user.full_name}
//                         className="h-9 w-9 rounded-full border-2 border-white object-cover"
//                         onError={(e) => {
//                             e.currentTarget.src = defaultAvatar(userStories.user.full_name);
//                         }}
//                     />
//                     <div>
//                         <p className="text-sm font-semibold text-white leading-tight">
//                             {userStories.user.full_name}
//                         </p>
//                         <p className="text-xs text-white/70">
//                             {moment(currentStory.created_at).fromNow()}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-1.5">
//                     {/* Pause / Lecture */}
//                     <button
//                         onClick={togglePause}
//                         aria-label={isPaused ? 'Reprendre' : 'Mettre en pause'}
//                         className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
//                     >
//                         {isPaused
//                             ? <Play className="h-4 w-4" />
//                             : <Pause className="h-4 w-4" />
//                         }
//                     </button>

//                     {/* Supprimer (uniquement ses propres stories) */}
//                     {isOwnStory && (
//                         <button
//                             onClick={deleteStory}
//                             disabled={isDeleting}
//                             aria-label="Supprimer cette story"
//                             className="rounded-full bg-red-500/70 p-2 text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-40"
//                         >
//                             <Trash2 className="h-4 w-4" />
//                         </button>
//                     )}

//                     {/* Fermer */}
//                     <button
//                         onClick={() => setViewStory(null)}
//                         aria-label="Fermer"
//                         className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
//                     >
//                         <X className="h-4 w-4" />
//                     </button>
//                 </div>
//             </div>

//             {/* ── Contenu principal ── */}
//             <div className="relative h-full w-full max-w-lg">

//                 {/* Zone de clic gauche (précédent) */}
//                 <div
//                     className="absolute top-0 left-0 z-10 h-full w-1/3 cursor-pointer"
//                     onClick={goToPrevious}
//                     aria-label="Story précédente"
//                 />

//                 {/* Zone de clic droite (suivant) */}
//                 <div
//                     className="absolute top-0 right-0 z-10 h-full w-1/3 cursor-pointer"
//                     onClick={goToNext}
//                     aria-label="Story suivante"
//                 />

//                 {/* Story : texte */}
//                 {currentStory.media_type === 'text' && (
//                     <div
//                         className="flex h-full items-center justify-center p-10"
//                         style={{ backgroundColor: currentStory.background_color }}
//                     >
//                         <p className="text-center text-2xl font-bold leading-relaxed text-white drop-shadow">
//                             {currentStory.content}
//                         </p>
//                     </div>
//                 )}

//                 {/* Story : image */}
//                 {currentStory.media_type === 'image' && currentStory.media_url && (
//                     <div className="relative flex h-full items-center justify-center bg-black">
//                         <img
//                             src={currentStory.media_url}
//                             alt="Story"
//                             className="max-h-full max-w-full object-contain"
//                         />
//                         {/* Texte superposé */}
//                         {currentStory.content && (
//                             <p className="absolute bottom-16 left-0 right-0 text-center px-6 text-lg font-semibold text-white drop-shadow-lg">
//                                 {currentStory.content}
//                             </p>
//                         )}
//                     </div>
//                 )}

//                 {/* Story : vidéo */}
//                 {currentStory.media_type === 'video' && currentStory.media_url && (
//                     <div className="relative flex h-full items-center justify-center bg-black">
//                         <video
//                             ref={videoRef}
//                             src={currentStory.media_url}
//                             className="max-h-full max-w-full object-contain"
//                             autoPlay
//                             playsInline
//                             onEnded={goToNext}
//                             onLoadedMetadata={handleVideoLoadedMetadata}
//                             onTimeUpdate={handleVideoTimeUpdate}
//                         />
//                         {/* Texte superposé */}
//                         {currentStory.content && (
//                             <p className="absolute bottom-16 left-0 right-0 text-center px-6 text-lg font-semibold text-white drop-shadow-lg">
//                                 {currentStory.content}
//                             </p>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* ── Boutons de navigation visibles au hover ── */}
//             {currentIndex > 0 && (
//                 <button
//                     onClick={goToPrevious}
//                     aria-label="Story précédente"
//                     className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-sm transition hover:bg-white/40 hover:opacity-100 focus:opacity-100"
//                 >
//                     <ArrowLeft className="h-5 w-5" />
//                 </button>
//             )}

//             {currentIndex < userStories.stories.length - 1 && (
//                 <button
//                     onClick={goToNext}
//                     aria-label="Story suivante"
//                     className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-sm transition hover:bg-white/40 hover:opacity-100 focus:opacity-100"
//                 >
//                     <ArrowRight className="h-5 w-5" />
//                 </button>
//             )}

//             {/* ── Indicateur de position ── */}
//             <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
//                 <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
//                     {currentIndex + 1} / {userStories.stories.length}
//                 </span>
//             </div>
//         </div>
//     );
// };

// export default StoryViewer;

// story-viewer.tsx
// Viewer pour naviguer entre les stories d'un utilisateur.
//
// Fonctionnalités :
//  ✅ Tri chronologique  : oldest → newest (géré côté backend)
//  ✅ Démarrage intelligent : ouverture sur la 1ère story non vue
//  ✅ Tracking local     : chaque story vue est enregistrée dans localStorage
//  ✅ Indicateur visuel  : badge "Déjà vu" + barres de progression atténuées

import { PageProps, StoryViewerProps } from '@/types/story';
import axios from 'axios';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCheck, Pause, Play, Trash2, X } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

// ============================================================
// CONSTANTES
// ============================================================
const TEXT_STORY_DURATION = 5000;   // ms pour les stories texte/image
const PROGRESS_TICK_MS    = 100;    // fréquence de mise à jour de la barre
const LS_KEY              = 'viewed_story_ids'; // clé localStorage

// ============================================================
// HELPERS — Suivi des stories vues dans localStorage
// ============================================================

/** Retourne le Set de tous les IDs de stories déjà vus */
const getViewedIds = (): Set<string> => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
        return new Set();
    }
};

/**
 * Enregistre un ID comme "vu".
 * On garde au maximum 500 entrées pour éviter de saturer localStorage.
 */
const markIdAsViewed = (storyId: string): void => {
    try {
        const ids = getViewedIds();
        if (ids.has(storyId)) return;
        ids.add(storyId);
        localStorage.setItem(LS_KEY, JSON.stringify(Array.from(ids).slice(-500)));
    } catch { /* silencieux si localStorage indisponible */ }
};

/**
 * Calcule l'index de départ intelligent :
 *  → 1ère story non vue dans la liste (oldest→newest)
 *  → 0 si toutes ont déjà été vues (on repart du début)
 */
const computeStartIndex = (storyIds: string[]): number => {
    const viewed = getViewedIds();
    const firstUnseen = storyIds.findIndex((id) => !viewed.has(id));
    return firstUnseen === -1 ? 0 : firstUnseen;
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const StoryViewer = ({ userStories, setViewStory, onStoryDeleted }: StoryViewerProps) => {
    // Les stories arrivent DÉJÀ triées oldest→newest depuis le backend
    const sortedStories = userStories.stories;

    // ── Index de départ intelligent ──────────────────────────
    const [currentIndex, setCurrentIndex] = useState(() =>
        computeStartIndex(sortedStories.map((s) => s.id))
    );
    const [progress,   setProgress]   = useState(0);
    const [isPaused,   setIsPaused]   = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // IDs vus (sessions précédentes + session courante) pour l'indicateur visuel
    const [viewedInSession, setViewedInSession] = useState<Set<string>>(
        () => getViewedIds()
    );

    const videoRef         = useRef<HTMLVideoElement>(null);
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const apiViewTracked   = useRef<Set<string>>(new Set());

    // Swipe tactile
    const touchStartX = useRef<number>(0);
    const touchEndX   = useRef<number>(0);

    const { auth }    = usePage<PageProps>().props;
    const currentUser = auth.user;

    const currentStory = sortedStories[currentIndex];
    const isOwnStory   = currentUser.id === userStories.user.id;

    // ── Avatar fallback ────────────────────────────────────
    const defaultAvatar = useCallback((name: string) => {
        const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4f46e5&color=fff`;
    }, []);

    // ── Tracker la vue (localStorage + API) ───────────────
    const trackView = useCallback((storyId: string) => {
        // 1. Persister localement pour le démarrage intelligent au prochain ouverture
        markIdAsViewed(storyId);
        setViewedInSession((prev) => new Set(prev).add(storyId));

        // 2. Notifier le backend une seule fois (pas ses propres stories)
        if (isOwnStory || apiViewTracked.current.has(storyId)) return;
        apiViewTracked.current.add(storyId);
        axios.post(`/api/stories/${storyId}/view`).catch(() => {/* silencieux */});
    }, [isOwnStory]);

    // ── Navigation : suivante ──────────────────────────────
    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => {
            if (prev < sortedStories.length - 1) {
                setProgress(0);
                return prev + 1;
            }
            setViewStory(null);
            return prev;
        });
    }, [sortedStories.length, setViewStory]);

    // ── Navigation : précédente ────────────────────────────
    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => {
            if (prev > 0) {
                setProgress(0);
                return prev - 1;
            }
            return prev;
        });
    }, []);

    // ── Pause / lecture ────────────────────────────────────
    const togglePause = useCallback(() => {
        setIsPaused((prev) => {
            const next = !prev;
            if (videoRef.current) {
                next ? videoRef.current.pause() : videoRef.current.play();
            }
            return next;
        });
    }, []);

    // ── Clavier ────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight': goToNext();         break;
                case 'ArrowLeft':  goToPrevious();     break;
                case 'Escape':     setViewStory(null); break;
                case ' ':
                    e.preventDefault();
                    togglePause();
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goToNext, goToPrevious, togglePause, setViewStory]);

    // ── Swipe tactile ──────────────────────────────────────
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) diff > 0 ? goToNext() : goToPrevious();
    };

    // ── Progression automatique + tracking ────────────────
    useEffect(() => {
        if (!currentStory) return;

        // Marquer comme vu dès l'affichage
        trackView(currentStory.id);

        setProgress(0);

        // Les vidéos gèrent leur progression via onTimeUpdate
        if (currentStory.media_type === 'video' || isPaused) return;

        const increment = (100 / TEXT_STORY_DURATION) * PROGRESS_TICK_MS;

        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(progressInterval.current!);
                    goToNext();
                    return 100;
                }
                return next;
            });
        }, PROGRESS_TICK_MS);

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [currentIndex, isPaused, currentStory, goToNext, trackView]);

    // ── Sync progression vidéo ─────────────────────────────
    const handleVideoTimeUpdate = () => {
        const video = videoRef.current;
        if (!video || isPaused) return;
        setProgress((video.currentTime / video.duration) * 100);
    };

    // ── Suppression ────────────────────────────────────────
    const deleteStory = () => {
        if (!confirm('Supprimer cette story ?')) return;
        setIsDeleting(true);

        router.delete(`/stories/${currentStory.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Story supprimée.');
                onStoryDeleted?.();
                if (sortedStories.length === 1) {
                    setViewStory(null);
                } else {
                    currentIndex < sortedStories.length - 1 ? goToNext() : goToPrevious();
                }
            },
            onError:  () => toast.error('Impossible de supprimer la story.'),
            onFinish: () => setIsDeleting(false),
        });
    };

    if (!currentStory) return null;

    // ── Render ─────────────────────────────────────────────
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Visionneuse de stories"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* ── Barres de progression ──────────────────── */}
            <div className="absolute top-0 left-0 z-20 flex w-full gap-1 px-2 pt-2">
                {sortedStories.map((story, idx) => {
                    const alreadySeen = viewedInSession.has(story.id) && idx !== currentIndex;
                    return (
                        <div
                            key={story.id}
                            title={alreadySeen ? 'Déjà vu' : undefined}
                            className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
                        >
                            <div
                                className={`h-full transition-all duration-100 ease-linear ${
                                    // Barre atténuée pour les stories déjà vues
                                    idx < currentIndex ? 'bg-white/60' : 'bg-white'
                                }`}
                                style={{
                                    width:
                                        idx < currentIndex
                                            ? '100%'
                                            : idx === currentIndex
                                            ? `${progress}%`
                                            : '0%',
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* ── En-tête ────────────────────────────────── */}
            <div className="absolute top-2 left-0 z-20 flex w-full items-center justify-between px-3 pt-4">
                <div className="flex items-center gap-2">
                    <img
                        src={userStories.user.profile_picture || defaultAvatar(userStories.user.full_name)}
                        alt={userStories.user.full_name}
                        className="h-9 w-9 rounded-full border-2 border-white object-cover"
                        onError={(e) => { e.currentTarget.src = defaultAvatar(userStories.user.full_name); }}
                    />
                    <div>
                        <p className="text-sm font-semibold text-white leading-tight">
                            {userStories.user.full_name}
                        </p>
                        <p className="text-xs text-white/70">
                            {moment(currentStory.created_at).fromNow()}
                        </p>
                    </div>

                    {/* Badge "Déjà vu" si la story avait été vue lors d'une session précédente */}
                    {viewedInSession.has(currentStory.id) && (
                        <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
                            <CheckCheck className="h-3 w-3" />
                            Déjà vu
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={togglePause}
                        aria-label={isPaused ? 'Reprendre' : 'Mettre en pause'}
                        className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
                    >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>

                    {isOwnStory && (
                        <button
                            onClick={deleteStory}
                            disabled={isDeleting}
                            aria-label="Supprimer cette story"
                            className="rounded-full bg-red-500/70 p-2 text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-40"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}

                    <button
                        onClick={() => setViewStory(null)}
                        aria-label="Fermer"
                        className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── Contenu principal ──────────────────────── */}
            <div className="relative h-full w-full max-w-lg">
                {/* Zones de navigation par clic */}
                <div
                    className="absolute top-0 left-0 z-10 h-full w-1/3 cursor-pointer"
                    onClick={goToPrevious}
                    aria-label="Story précédente"
                />
                <div
                    className="absolute top-0 right-0 z-10 h-full w-1/3 cursor-pointer"
                    onClick={goToNext}
                    aria-label="Story suivante"
                />

                {/* Texte */}
                {currentStory.media_type === 'text' && (
                    <div
                        className="flex h-full items-center justify-center p-10"
                        style={{ backgroundColor: currentStory.background_color }}
                    >
                        <p className="text-center text-2xl font-bold leading-relaxed text-white drop-shadow">
                            {currentStory.content}
                        </p>
                    </div>
                )}

                {/* Image */}
                {currentStory.media_type === 'image' && currentStory.media_url && (
                    <div className="relative flex h-full items-center justify-center bg-black">
                        <img
                            src={currentStory.media_url}
                            alt="Story"
                            className="max-h-full max-w-full object-contain"
                        />
                        {currentStory.content && (
                            <p className="absolute bottom-16 left-0 right-0 px-6 text-center text-lg font-semibold text-white drop-shadow-lg">
                                {currentStory.content}
                            </p>
                        )}
                    </div>
                )}

                {/* Vidéo */}
                {currentStory.media_type === 'video' && currentStory.media_url && (
                    <div className="relative flex h-full items-center justify-center bg-black">
                        <video
                            ref={videoRef}
                            src={currentStory.media_url}
                            className="max-h-full max-w-full object-contain"
                            autoPlay
                            playsInline
                            onEnded={goToNext}
                            onTimeUpdate={handleVideoTimeUpdate}
                        />
                        {currentStory.content && (
                            <p className="absolute bottom-16 left-0 right-0 px-6 text-center text-lg font-semibold text-white drop-shadow-lg">
                                {currentStory.content}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Flèches desktop (hover) ─────────────────── */}
            {currentIndex > 0 && (
                <button
                    onClick={goToPrevious}
                    aria-label="Story précédente"
                    className="absolute top-1/2 left-3 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-sm transition hover:bg-white/40 hover:opacity-100 focus:opacity-100"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
            )}

            {currentIndex < sortedStories.length - 1 && (
                <button
                    onClick={goToNext}
                    aria-label="Story suivante"
                    className="absolute top-1/2 right-3 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white opacity-0 backdrop-blur-sm transition hover:bg-white/40 hover:opacity-100 focus:opacity-100"
                >
                    <ArrowRight className="h-5 w-5" />
                </button>
            )}

            {/* ── Indicateur de position ─────────────────── */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
                <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
                    {currentIndex + 1} / {sortedStories.length}
                </span>
            </div>
        </div>
    );
};

export default StoryViewer;