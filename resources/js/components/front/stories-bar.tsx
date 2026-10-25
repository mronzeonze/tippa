// // stories-bar.tsx
// // Barre de stories affichant toutes les stories actives des connexions

// import { PageProps, UserWithStories } from '@/types/story';
// import { usePage } from '@inertiajs/react';
// import axios from 'axios';
// import { PlusIcon } from 'lucide-react';
// import moment from 'moment';
// import { useEffect, useState } from 'react';
// import { bgGradient } from '../assets/assets';
// import StoryModal from './story-modal';
// import StoryViewer from './story-viewer';

// // ========================================
// // COMPOSANT PRINCIPAL
// // ========================================
// const StoriesBar = () => {
//     // États locaux
//     const [stories, setStories] = useState<UserWithStories[]>([]);
//     const [showModal, setShowModal] = useState(false);
//     const [viewStory, setViewStory] = useState<UserWithStories | null>(null);
//     const [loading, setLoading] = useState(true);

//     // Récupérer l'utilisateur connecté
//     const { auth } = usePage<PageProps>().props;
//     const currentUser = auth.user;

//     // Image par défaut
//     const defaultProfilePicture = (name: string) =>
//         'http://localhost:8000/storage/images/default-avatar.jpg';

//     /**
//      * Fonction pour récupérer toutes les stories actives
//      * Appelée au montage du composant et après création d'une story
//      */
//     const fetchStories = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get('/api/stories');
//             setStories(response.data.stories || []);
//         } catch (error) {
//             console.error('Error fetching stories:', error);
//             setStories([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     /**
//      * Callback appelé après la création d'une story
//      * Rafraîchit la liste des stories
//      */
//     const handleStoryCreated = () => {
//         fetchStories();
//         setShowModal(false);
//     };

//     // Charger les stories au montage
//     useEffect(() => {
//         fetchStories();

//         // Rafraîchir toutes les 30 secondes
//         const interval = setInterval(() => {
//             fetchStories();
//         }, 30000);

//         return () => clearInterval(interval);
//     }, []);

//     /**
//      * Fonction pour obtenir le premier media/contenu de preview
//      */
//     const getStoryPreview = (userStories: UserWithStories) => {
//         const firstStory = userStories.stories[0];
//         if (!firstStory) return null;

//         return {
//             content: firstStory.content,
//             media_type: firstStory.media_type,
//             media_url: firstStory.media_url,
//             background_color: firstStory.background_color,
//         };
//     };

//     return (
//         <div className="no-scrollbar w-full overflow-x-auto px-4 lg:max-w-2xl">
//             <div className="flex gap-4 pb-5">
//                 {/* Carte pour créer une story */}
//                 <div
//                     onClick={() => setShowModal(true)}
//                     className={`relative aspect-[3/4] max-h-40 max-w-[7.5rem] min-w-[7.5rem] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-emerald-600 bg-gradient-to-b from-indigo-50 to-white shadow-sm transition hover:border-green-600 hover:shadow-md active:scale-95`}
//                 >
//                     <div className="flex h-full flex-col items-center justify-center p-4">
//                         <div
//                             className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${bgGradient} shadow-lg`}
//                         >
//                             <PlusIcon className="h-6 w-6 text-white" />
//                         </div>
//                         <p className="text-center text-xs font-semibold text-slate-700">
//                             Créer Story
//                         </p>
//                     </div>
//                 </div>

//                 {/* Affichage des stories */}
//                 {loading ? (
//                     // Skeleton loader
//                     [...Array(5)].map((_, i) => (
//                         <div
//                             key={i}
//                             className="aspect-[3/4] max-h-40 max-w-[7.5rem] min-w-[7.5rem] animate-pulse rounded-xl bg-gray-300"
//                         />
//                     ))
//                 ) : stories.length > 0 ? (
//                     stories.map((userStories) => {
//                         const preview = getStoryPreview(userStories);

//                         return (
//                             <div
//                                 key={userStories.user.id}
//                                 onClick={() => setViewStory(userStories)}
//                                 className="relative aspect-[3/4] max-h-40 max-w-[7.5rem] min-w-[7.5rem] cursor-pointer overflow-hidden rounded-xl shadow-md transition duration-200 hover:shadow-xl active:scale-95"
//                                 style={{
//                                     backgroundColor:
//                                         preview?.background_color || '#6366f1',
//                                 }}
//                             >
//                                 {/* Photo de profil de l'utilisateur */}
//                                 <img
//                                     className="absolute top-3 left-3 z-10 h-10 w-10 rounded-full border-2 border-white object-cover shadow-lg"
//                                     src={
//                                         userStories.user.profile_picture ||
//                                         defaultProfilePicture(
//                                             userStories.user.full_name,
//                                         )
//                                     }
//                                     alt={userStories.user.full_name}
//                                     onError={(e) => {
//                                         e.currentTarget.src =
//                                             defaultProfilePicture(
//                                                 userStories.user.full_name,
//                                             );
//                                     }}
//                                 />

//                                 {/* Badge nombre de stories */}
//                                 {userStories.stories_count > 1 && (
//                                     <div className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-lg">
//                                         {userStories.stories_count}
//                                     </div>
//                                 )}

//                                 {/* Preview du contenu */}
//                                 {preview?.media_type === 'text' &&
//                                     preview.content && (
//                                         <div className="absolute inset-0 flex items-center justify-center p-4">
//                                             <p className="line-clamp-4 text-center text-sm font-medium text-white">
//                                                 {preview.content}
//                                             </p>
//                                         </div>
//                                     )}

//                                 {preview?.media_type === 'image' &&
//                                     preview.media_url && (
//                                         <div className="absolute inset-0 bg-black">
//                                             <img
//                                                 src={preview.media_url}
//                                                 alt="Story"
//                                                 className="h-full w-full object-cover opacity-80 transition duration-300 hover:scale-110 hover:opacity-90"
//                                             />
//                                         </div>
//                                     )}

//                                 {preview?.media_type === 'video' &&
//                                     preview.media_url && (
//                                         <div className="absolute inset-0 bg-black">
//                                             <video
//                                                 src={preview.media_url}
//                                                 className="h-full w-full object-cover opacity-80"
//                                                 muted
//                                             />
//                                         </div>
//                                     )}

//                                 {/* Timestamp */}
//                                 <p className="absolute right-2 bottom-2 z-10 text-xs font-medium text-white drop-shadow-lg">
//                                     {moment(
//                                         userStories.last_story_at,
//                                     ).fromNow()}
//                                 </p>

//                                 {/* Nom de l'utilisateur */}
//                                 <p className="absolute bottom-2 left-3 z-10 max-w-[80%] truncate text-xs font-semibold text-white drop-shadow-lg">
//                                     {userStories.user.full_name}
//                                 </p>
//                             </div>
//                         );
//                     })
//                 ) : (
//                     // État vide
//                     <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100 px-8">
//                         <p className="text-center text-sm text-gray-500">
//                             Aucun story disponible. Soyez le premier à partager
//                             !
//                         </p>
//                     </div>
//                 )}
//             </div>

//             {/* Modal pour créer une story */}
//             {showModal && (
//                 <StoryModal
//                     setShowModal={setShowModal}
//                     onStoryCreated={handleStoryCreated}
//                 />
//             )}

//             {/* Viewer pour voir les stories */}
//             {viewStory && (
//                 <StoryViewer
//                     userStories={viewStory}
//                     setViewStory={setViewStory}
//                     onStoryDeleted={fetchStories}
//                 />
//             )}
//         </div>
//     );
// };

// export default StoriesBar;

// stories-bar.tsx
// Barre de stories affichant toutes les stories actives des connexions

import { PageProps, UserWithStories } from '@/types/story';
import { usePage } from '@inertiajs/react';
import axios, { CancelTokenSource } from 'axios';
import { PlusIcon } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { bgGradient } from '../assets/assets';
import StoryModal from './story-modal';
import StoryViewer from './story-viewer';

const REFRESH_INTERVAL = 30_000;
const DEFAULT_AVATAR = '/storage/images/default-avatar.jpg';

// ========================================
// SOUS-COMPOSANT : Bouton créer une story
// ========================================
const CreateStoryCard = ({ onClick }: { onClick: () => void }) => (
    <div
        onClick={onClick}
        role="button"
        aria-label="Créer une story"
        className="relative aspect-[3/4] max-h-40 max-w-[7.5rem] min-w-[7.5rem] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-emerald-600 bg-gradient-to-b from-indigo-50 to-white shadow-sm transition hover:border-green-600 hover:shadow-md active:scale-95"
    >
        <div className="flex h-full flex-col items-center justify-center p-4">
            <div
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${bgGradient} shadow-lg`}
            >
                <PlusIcon className="h-6 w-6 text-white" />
            </div>
            <p className="text-center text-xs font-semibold text-slate-700">
                Créer Story
            </p>
        </div>
    </div>
);

// ========================================
// SOUS-COMPOSANT : Skeleton loader
// ========================================
const SkeletonCard = () => (
    <div className="aspect-[3/4] max-h-40 max-w-[7.5rem] min-w-[7.5rem] animate-pulse rounded-xl bg-gray-200" />
);

// ========================================
// SOUS-COMPOSANT : Carte d'une story
// ========================================
interface StoryCardProps {
    userStories: UserWithStories;
    onClick: () => void;
}

const StoryCard = ({ userStories, onClick }: StoryCardProps) => {
    const firstStory = userStories.stories[0];

    const preview = firstStory
        ? {
              content: firstStory.content,
              media_type: firstStory.media_type,
              media_url: firstStory.media_url,
              background_color: firstStory.background_color,
          }
        : null;

    return (
        <div
            onClick={onClick}
            role="button"
            aria-label={`Story de ${userStories.user.full_name}`}
            className="relative aspect-[3/4] max-h-40 max-w-[7.5rem] min-w-[7.5rem] cursor-pointer overflow-hidden rounded-xl shadow-md transition duration-200 hover:shadow-xl active:scale-95"
            style={{ backgroundColor: preview?.background_color || '#6366f1' }}
        >
            {/* Avatar */}
            <img
                className="absolute top-3 left-3 z-10 h-10 w-10 rounded-full border-2 border-white object-cover shadow-lg"
                src={userStories.user.profile_picture || DEFAULT_AVATAR}
                alt={userStories.user.full_name}
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                }}
            />

            {/* Badge nombre de stories */}
            {userStories.stories_count > 1 && (
                <div className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-lg">
                    {userStories.stories_count}
                </div>
            )}

            {/* Contenu preview */}
            {preview?.media_type === 'text' && preview.content && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="line-clamp-4 text-center text-sm font-medium text-white">
                        {preview.content}
                    </p>
                </div>
            )}

            {preview?.media_type === 'image' && preview.media_url && (
                <div className="absolute inset-0 bg-black">
                    <img
                        src={preview.media_url}
                        alt="Aperçu story"
                        loading="lazy"
                        className="h-full w-full object-cover opacity-80 transition duration-300 hover:scale-110 hover:opacity-90"
                    />
                </div>
            )}

            {preview?.media_type === 'video' && preview.media_url && (
                <div className="absolute inset-0 bg-black">
                    <video
                        src={preview.media_url}
                        className="h-full w-full object-cover opacity-80"
                        muted
                        playsInline
                        preload="none"
                    />
                </div>
            )}

            {/* Dégradé bas pour lisibilité */}
            <div className="absolute inset-x-0 bottom-0 z-[5] h-12 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Timestamp */}
            <p className="absolute right-2 bottom-1 z-10 text-xs font-medium text-white drop-shadow-lg">
                {moment(userStories.last_story_at).fromNow()}
            </p>

            {/* Nom */}
            <p className="absolute bottom-6 left-3 z-10 max-w-[80%] truncate text-xs font-semibold text-white drop-shadow-lg">
                {userStories.user.full_name}
            </p>
        </div>
    );
};

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
const StoriesBar = () => {
    const [stories, setStories] = useState<UserWithStories[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [viewStory, setViewStory] = useState<UserWithStories | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Annulation de requêtes en vol (évite les race conditions)
    const cancelTokenRef = useRef<CancelTokenSource | null>(null);
    // Référence de l'intervalle de polling
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { auth } = usePage<PageProps>().props;

    /**
     * Récupère les stories actives.
     * - Annule la requête précédente si encore en vol.
     * - Ne recharge pas si l'onglet est en arrière-plan.
     */
    const fetchStories = useCallback(async (showLoader = false) => {
        if (document.visibilityState === 'hidden') return;

        cancelTokenRef.current?.cancel('Nouvelle requête lancée');
        cancelTokenRef.current = axios.CancelToken.source();

        if (showLoader) setLoading(true);
        setError(false);

        try {
            const response = await axios.get('/api/stories', {
                cancelToken: cancelTokenRef.current.token,
            });
            setStories(response.data.stories || []);
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error('Error fetching stories:', err);
                setError(true);
            }
        } finally {
            if (showLoader) setLoading(false);
        }
    }, []);

    /**
     * Démarre le polling toutes les 30s.
     * Réagit aussi aux changements de visibilité de l'onglet.
     */
    const startPolling = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(
            () => fetchStories(false),
            REFRESH_INTERVAL,
        );
    }, [fetchStories]);

    useEffect(() => {
        fetchStories(true);
        startPolling();

        // Pause si l'onglet est caché, reprise + refresh au retour
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchStories(false);
                startPolling();
            } else {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            cancelTokenRef.current?.cancel('Démontage du composant');
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, [fetchStories, startPolling]);

    const handleStoryCreated = useCallback(() => {
        fetchStories(false);
        setShowModal(false);
    }, [fetchStories]);

    return (
        <div className="no-scrollbar w-full overflow-x-auto px-4 lg:max-w-2xl">
            <div className="flex gap-4 pb-5">
                <CreateStoryCard onClick={() => setShowModal(true)} />

                {loading ? (
                    [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                ) : error ? (
                    <div className="flex h-40 items-center justify-center rounded-xl bg-red-50 px-8">
                        <p className="text-center text-sm text-red-500">
                            Impossible de charger les stories.{' '}
                            <button
                                onClick={() => fetchStories(true)}
                                className="font-medium underline"
                            >
                                Réessayer
                            </button>
                        </p>
                    </div>
                ) : stories.length > 0 ? (
                    stories.map((userStories) => (
                        <StoryCard
                            key={userStories.user.id}
                            userStories={userStories}
                            onClick={() => setViewStory(userStories)}
                        />
                    ))
                ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100 px-8">
                        <p className="text-center text-sm text-gray-500">
                            Aucune story disponible. Soyez le premier à partager
                            !
                        </p>
                    </div>
                )}
            </div>

            {showModal && (
                <StoryModal
                    setShowModal={setShowModal}
                    onStoryCreated={handleStoryCreated}
                />
            )}

            {viewStory && (
                <StoryViewer
                    userStories={viewStory}
                    setViewStory={setViewStory}
                    onStoryDeleted={() => fetchStories(false)}
                />
            )}
        </div>
    );
};

export default StoriesBar;
