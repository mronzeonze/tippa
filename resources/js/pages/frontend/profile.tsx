// import PostCard from '@/components/front/post-card';
// import ProfileModal from '@/components/front/profile-modal';
// import UserProfileInfo from '@/components/front/user-profile-info';
// import Loading from '@/components/loading';
// import AppLayout from '@/layouts/app-layout';
// import { Post } from '@/types/post';
// import { ProfilePageProps } from '@/types/profile';
// import { Link, router, usePage } from '@inertiajs/react';
// import {
//     Award,
//     Briefcase,
//     CheckCircle,
//     Globe,
//     MapPin,
//     MessageCircle,
//     Phone,
//     Star,
// } from 'lucide-react';
// import moment from 'moment';
// import { useEffect, useState } from 'react';

// const Profile = () => {
//     const {
//         profile_user,
//         posts: initialPosts,
//         media_posts,
//         shares: initialShares,
//         liked_posts,
//         stats,
//         relationship,
//         auth,
//     } = usePage<ProfilePageProps & Record<string, any>>().props;

//     const [posts, setPosts] = useState<Post[]>(initialPosts?.data || []);
//     const [shares, setShares] = useState<Post[]>(initialShares?.data || []);
//     const [activeTab, setActiveTab] = useState('publications');
//     const [shareFilter, setShareFilter] = useState<
//         'all' | 'reposts' | 'quotes'
//     >('all');
//     const [showEdit, setShowEdit] = useState(false);

//     const currentUser = auth.user;
//     const defaultProfilePicture =
//         'http://localhost:8000/storage/images/default-avatar.jpg';

//     // Vérifier si c'est un tradipraticien
//     const isPractitioner = ['practitioner', 'expert'].includes(
//         profile_user?.account_type,
//     );

//     const refreshPosts = () => {
//         router.get(
//             `/profile/${profile_user.id}`,
//             {},
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 only: [
//                     'posts',
//                     'shares',
//                     'media_posts',
//                     'liked_posts',
//                     'stats',
//                 ],
//             },
//         );
//     };

//     useEffect(() => {
//         if (initialPosts?.data) setPosts(initialPosts.data);
//     }, [initialPosts]);

//     useEffect(() => {
//         if (initialShares?.data) setShares(initialShares.data);
//     }, [initialShares]);

//     useEffect(() => {
//         if (activeTab === 'partages') {
//             setShareFilter('all');
//         }
//     }, [activeTab]);

//     return profile_user ? (
//         <AppLayout showLeftSidebar={false}>
//             <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
//                 <div className="mx-auto max-w-6xl">
//                     {/* Profile Card */}
//                     <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
//                         {/* Cover photo */}
//                         <div className="relative h-40 bg-gradient-to-r from-emerald-200 via-emerald-200 to-emerald-200 md:h-56">
//                             {profile_user.cover_photo ? (
//                                 <img
//                                     src={profile_user.cover_photo}
//                                     alt="Cover"
//                                     className="h-full w-full object-cover"
//                                 />
//                             ) : (
//                                 <div className="flex h-full items-center justify-center">
//                                     <div className="text-center text-white opacity-50">
//                                         <p className="text-lg font-semibold">
//                                             {profile_user.full_name}
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Badges de vérification */}
//                             <div className="absolute top-4 right-4 flex gap-2">
//                                 {profile_user.is_verified && (
//                                     <div className="rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
//                                         <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
//                                             <CheckCircle className="h-4 w-4" />
//                                             Vérifié
//                                         </span>
//                                     </div>
//                                 )}
//                                 {profile_user.is_expert && (
//                                     <div className="rounded-full bg-amber-500/90 px-3 py-1 backdrop-blur-sm">
//                                         <span className="flex items-center gap-1 text-xs font-medium text-white">
//                                             <Award className="h-4 w-4" />
//                                             Expert
//                                         </span>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* User Info */}
//                         <UserProfileInfo
//                             user={profile_user}
//                             stats={stats}
//                             relationship={relationship}
//                             setShowEdit={setShowEdit}
//                             onUpdate={refreshPosts}
//                         />

//                         {/* Informations complémentaires pour tradipraticiens */}
//                         {isPractitioner && (
//                             <div className="border-t border-gray-200 px-6 py-4">
//                                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                                     {/* Expérience */}
//                                     {profile_user.years_of_experience && (
//                                         <div className="flex items-center gap-3">
//                                             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
//                                                 <Briefcase className="h-5 w-5 text-emerald-600" />
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">
//                                                     Expérience
//                                                 </p>
//                                                 <p className="font-medium text-gray-900">
//                                                     {
//                                                         profile_user.years_of_experience
//                                                     }{' '}
//                                                     ans
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Spécialités */}
//                                     {profile_user.specialties && (
//                                         <div className="flex items-center gap-3">
//                                             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
//                                                 <Award className="h-5 w-5 text-purple-600" />
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">
//                                                     Spécialités
//                                                 </p>
//                                                 <p className="line-clamp-1 font-medium text-gray-900">
//                                                     {profile_user.specialties}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Tarifs */}
//                                     {profile_user.consultation_price_min && (
//                                         <div className="flex items-center gap-3">
//                                             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
//                                                 <span className="text-lg">
//                                                     💰
//                                                 </span>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">
//                                                     Tarifs
//                                                 </p>
//                                                 <p className="font-medium text-gray-900">
//                                                     {
//                                                         profile_user.consultation_price_min
//                                                     }{' '}
//                                                     -{' '}
//                                                     {
//                                                         profile_user.consultation_price_max
//                                                     }{' '}
//                                                     {profile_user.currency ||
//                                                         'FCFA'}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Note moyenne */}
//                                     {profile_user.rating != null &&
//                                         profile_user.rating > 0 && (
//                                             <div className="flex items-center gap-3">
//                                                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
//                                                     <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-xs text-gray-500">
//                                                         Note
//                                                     </p>
//                                                     <p className="font-medium text-gray-900">
//                                                         {profile_user.rating.toFixed(
//                                                             1,
//                                                         )}
//                                                         /5 (
//                                                         {
//                                                             profile_user.total_ratings
//                                                         }{' '}
//                                                         avis)
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         )}

//                                     {/* Langues */}
//                                     {profile_user.languages &&
//                                         profile_user.languages.length > 0 && (
//                                             <div className="flex items-center gap-3">
//                                                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
//                                                     <Globe className="h-5 w-5 text-indigo-600" />
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-xs text-gray-500">
//                                                         Langues
//                                                     </p>
//                                                     <p className="font-medium text-gray-900">
//                                                         {profile_user.languages.join(
//                                                             ', ',
//                                                         )}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         )}

//                                     {/* Rayon d'intervention */}
//                                     {profile_user.intervention_radius_km && (
//                                         <div className="flex items-center gap-3">
//                                             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
//                                                 <MapPin className="h-5 w-5 text-green-600" />
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">
//                                                     Rayon d'intervention
//                                                 </p>
//                                                 <p className="font-medium text-gray-900">
//                                                     {
//                                                         profile_user.intervention_radius_km
//                                                     }{' '}
//                                                     km
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Contact rapide (pour non-propriétaires) */}
//                                 {!relationship.is_own_profile && (
//                                     <div className="mt-4 flex gap-3">
//                                         {profile_user.phone && (
//                                             <a
//                                                 href={`tel:${profile_user.phone}`}
//                                                 className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
//                                             >
//                                                 <Phone className="h-4 w-4" />
//                                                 Appeler
//                                             </a>
//                                         )}
//                                         {profile_user.whatsapp && (
//                                             <a
//                                                 href={`https://wa.me/${profile_user.whatsapp}`}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
//                                             >
//                                                 <MessageCircle className="h-4 w-4" />
//                                                 WhatsApp
//                                             </a>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* Tabs Navigation */}
//                     <div className="mt-6">
//                         <div className="mx-auto flex max-w-4xl rounded-xl bg-white p-1 shadow">
//                             {['publications', 'partages', 'media', 'likes'].map(
//                                 (tab) => (
//                                     <button
//                                         onClick={() => setActiveTab(tab)}
//                                         key={tab}
//                                         className={`flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
//                                             activeTab === tab
//                                                 ? 'bg-emerald-600 text-white shadow-sm'
//                                                 : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                                         }`}
//                                     >
//                                         <span className="flex items-center justify-center gap-2">
//                                             {tab === 'publications' && (
//                                                 <svg
//                                                     className="h-4 w-4"
//                                                     fill="none"
//                                                     stroke="currentColor"
//                                                     viewBox="0 0 24 24"
//                                                 >
//                                                     <path
//                                                         strokeLinecap="round"
//                                                         strokeLinejoin="round"
//                                                         strokeWidth={2}
//                                                         d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
//                                                     />
//                                                 </svg>
//                                             )}
//                                             {tab === 'partages' && (
//                                                 <svg
//                                                     className="h-4 w-4"
//                                                     fill="none"
//                                                     stroke="currentColor"
//                                                     viewBox="0 0 24 24"
//                                                 >
//                                                     <path
//                                                         strokeLinecap="round"
//                                                         strokeLinejoin="round"
//                                                         strokeWidth={2}
//                                                         d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
//                                                     />
//                                                 </svg>
//                                             )}
//                                             {tab === 'media' && (
//                                                 <svg
//                                                     className="h-4 w-4"
//                                                     fill="none"
//                                                     stroke="currentColor"
//                                                     viewBox="0 0 24 24"
//                                                 >
//                                                     <path
//                                                         strokeLinecap="round"
//                                                         strokeLinejoin="round"
//                                                         strokeWidth={2}
//                                                         d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                                                     />
//                                                 </svg>
//                                             )}
//                                             {tab === 'likes' && (
//                                                 <svg
//                                                     className="h-4 w-4"
//                                                     fill="none"
//                                                     stroke="currentColor"
//                                                     viewBox="0 0 24 24"
//                                                 >
//                                                     <path
//                                                         strokeLinecap="round"
//                                                         strokeLinejoin="round"
//                                                         strokeWidth={2}
//                                                         d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
//                                                     />
//                                                 </svg>
//                                             )}
//                                             <span>
//                                                 {tab.charAt(0).toUpperCase() +
//                                                     tab.slice(1)}
//                                             </span>
//                                             {tab === 'publications' && (
//                                                 <span className="ml-1 text-xs opacity-75">
//                                                     ({stats.posts_count})
//                                                 </span>
//                                             )}
//                                             {tab === 'media' && (
//                                                 <span className="ml-1 text-xs opacity-75">
//                                                     ({media_posts?.length || 0})
//                                                 </span>
//                                             )}
//                                             {tab === 'partages' && (
//                                                 <span className="ml-1 text-xs opacity-75">
//                                                     ({stats.shares_count || 0})
//                                                 </span>
//                                             )}
//                                             {tab === 'likes' &&
//                                                 relationship.is_own_profile && (
//                                                     <span className="ml-1 text-xs opacity-75">
//                                                         (
//                                                         {stats.likes_count || 0}
//                                                         )
//                                                     </span>
//                                                 )}
//                                         </span>
//                                     </button>
//                                 ),
//                             )}
//                         </div>

//                         {/* Tab Content - Publications */}
//                         {activeTab === 'publications' && (
//                             <div className="mt-6 flex flex-col items-center gap-6">
//                                 {posts.length > 0 ? (
//                                     posts.map((post) => (
//                                         <PostCard
//                                             key={post.id}
//                                             post={post}
//                                             onUpdate={refreshPosts}
//                                         />
//                                     ))
//                                 ) : (
//                                     <div className="w-full rounded-xl bg-white p-12 text-center shadow">
//                                         <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
//                                             <svg
//                                                 className="h-8 w-8 text-emerald-600"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 viewBox="0 0 24 24"
//                                             >
//                                                 <path
//                                                     strokeLinecap="round"
//                                                     strokeLinejoin="round"
//                                                     strokeWidth={2}
//                                                     d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
//                                                 />
//                                             </svg>
//                                         </div>
//                                         <p className="text-lg font-medium text-gray-900">
//                                             Aucune publication
//                                         </p>
//                                         <p className="mt-1 text-sm text-gray-600">
//                                             {relationship.is_own_profile
//                                                 ? "Vous n'avez encore rien posté"
//                                                 : `${profile_user.full_name} n'a encore rien posté`}
//                                         </p>
//                                         {relationship.is_own_profile && (
//                                             <button
//                                                 onClick={() =>
//                                                     router.visit('/create-post')
//                                                 }
//                                                 className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
//                                             >
//                                                 Créer votre première publication
//                                             </button>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {/* Tab Content - Partages */}
//                         {activeTab === 'partages' && (
//                             <div className="mt-6 flex flex-col items-center gap-6">
//                                 {shares.length > 0 ? (
//                                     <>
//                                         <div className="w-full max-w-xl">
//                                             <div className="flex gap-2 rounded-lg bg-white p-1 shadow-sm">
//                                                 <button
//                                                     onClick={() =>
//                                                         setShareFilter('all')
//                                                     }
//                                                     className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${shareFilter === 'all' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
//                                                 >
//                                                     Tous (
//                                                     {stats.shares_count || 0})
//                                                 </button>
//                                                 <button
//                                                     onClick={() =>
//                                                         setShareFilter(
//                                                             'reposts',
//                                                         )
//                                                     }
//                                                     className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${shareFilter === 'reposts' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
//                                                 >
//                                                     Republication (
//                                                     {stats.reposts_count || 0})
//                                                 </button>
//                                                 <button
//                                                     onClick={() =>
//                                                         setShareFilter('quotes')
//                                                     }
//                                                     className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${shareFilter === 'quotes' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
//                                                 >
//                                                     Citations (
//                                                     {stats.quotes_count || 0})
//                                                 </button>
//                                             </div>
//                                         </div>
//                                         {shares
//                                             .filter((share) => {
//                                                 if (shareFilter === 'reposts')
//                                                     return (
//                                                         share.item_type ===
//                                                         'repost'
//                                                     );
//                                                 if (shareFilter === 'quotes')
//                                                     return (
//                                                         share.item_type ===
//                                                         'quote'
//                                                     );
//                                                 return true;
//                                             })
//                                             .map((share) => (
//                                                 <PostCard
//                                                     key={`${share.item_type}-${share.share_id || share.id}`}
//                                                     post={share}
//                                                     onUpdate={refreshPosts}
//                                                 />
//                                             ))}
//                                     </>
//                                 ) : (
//                                     <div className="w-full rounded-xl bg-white p-12 text-center shadow">
//                                         <p className="text-lg font-medium text-gray-900">
//                                             Aucun partage
//                                         </p>
//                                         <p className="mt-1 text-sm text-gray-600">
//                                             {relationship.is_own_profile
//                                                 ? "Vous n'avez encore rien partagé"
//                                                 : `${profile_user.full_name} n'a encore rien partagé`}
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {/* Tab Content - Media */}
//                         {activeTab === 'media' && (
//                             <div className="mt-6">
//                                 {media_posts && media_posts.length > 0 ? (
//                                     <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
//                                         {media_posts.map((post) =>
//                                             post.images.map((image) => (
//                                                 <Link
//                                                     key={image.id}
//                                                     href={image.image_url}
//                                                     target="_blank"
//                                                     className="group relative aspect-square overflow-hidden rounded-lg shadow-sm transition hover:shadow-md"
//                                                 >
//                                                     <img
//                                                         src={image.image_url}
//                                                         alt="Media"
//                                                         className="h-full w-full object-cover transition group-hover:scale-110"
//                                                     />
//                                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
//                                                         <div className="absolute right-0 bottom-0 left-0 p-3">
//                                                             <p className="text-xs font-medium text-white">
//                                                                 {moment(
//                                                                     post.created_at,
//                                                                 ).fromNow()}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 </Link>
//                                             )),
//                                         )}
//                                     </div>
//                                 ) : (
//                                     <div className="w-full rounded-xl bg-white p-12 text-center shadow">
//                                         <p className="text-lg font-medium text-gray-900">
//                                             Aucun média
//                                         </p>
//                                         <p className="mt-1 text-sm text-gray-600">
//                                             {relationship.is_own_profile
//                                                 ? "Vous n'avez encore posté aucun média"
//                                                 : `${profile_user.full_name} n'a encore posté aucun média`}
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {/* Tab Content - Likes */}
//                         {activeTab === 'likes' && (
//                             <div className="mt-6 flex flex-col items-center gap-6">
//                                 {relationship.is_own_profile ? (
//                                     liked_posts?.data &&
//                                     liked_posts.data.length > 0 ? (
//                                         liked_posts.data.map((post) => (
//                                             <PostCard
//                                                 key={post.id}
//                                                 post={post}
//                                                 onUpdate={refreshPosts}
//                                             />
//                                         ))
//                                     ) : (
//                                         <div className="w-full rounded-xl bg-white p-12 text-center shadow">
//                                             <p className="text-lg font-medium text-gray-900">
//                                                 Aucune publication aimée
//                                             </p>
//                                             <p className="mt-1 text-sm text-gray-600">
//                                                 Vous n'avez encore aimé aucune
//                                                 publication
//                                             </p>
//                                         </div>
//                                     )
//                                 ) : (
//                                     <div className="w-full rounded-xl bg-white p-12 text-center shadow">
//                                         <p className="text-lg font-medium text-gray-900">
//                                             Contenu privé
//                                         </p>
//                                         <p className="mt-1 text-sm text-gray-600">
//                                             Les publications aimées sont privées
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Edit Profile Modal */}
//                 {showEdit && relationship.is_own_profile && (
//                     <ProfileModal
//                         user={profile_user}
//                         setShowEdit={setShowEdit}
//                         onUpdate={refreshPosts}
//                     />
//                 )}
//             </div>
//         </AppLayout>
//     ) : (
//         <Loading />
//     );
// };

// export default Profile;

import PostCard from '@/components/front/post-card';
import PostModal from '@/components/front/post-modal';
import ProfileModal from '@/components/front/profile-modal';
import UserProfileInfo from '@/components/front/user-profile-info';
import Loading from '@/components/loading';
import AppLayout from '@/layouts/app-layout';
import { Post } from '@/types/post';
import { ProfilePageProps } from '@/types/profile';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    Briefcase,
    CheckCircle,
    Globe,
    Lock,
    MapPin,
    MessageCircle,
    Phone,
    Star,
    UserPlus,
} from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

// ============================================================================
// PrivateProfileLock
// ============================================================================
// Affiché à la place des onglets quand un visiteur non abonné tente d'accéder
// au profil d'un utilisateur ayant activé le mode "compte privé".
// ============================================================================

interface PrivateProfileLockProps {
    userName: string;
    isFollowing: boolean;
    onFollowClick: () => void;
}

const PrivateProfileLock = ({
    userName,
    isFollowing,
    onFollowClick,
}: PrivateProfileLockProps) => (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
        {/* Icône cadenas */}
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Lock className="h-9 w-9 text-gray-400" />
        </div>

        {/* Titre */}
        <h3 className="mb-2 text-xl font-bold text-gray-900">
            Ce compte est privé
        </h3>

        {/* Sous-titre */}
        <p className="mb-1 text-sm text-gray-500">
            Abonnez-vous à{' '}
            <span className="font-semibold text-gray-700">{userName}</span> pour
            voir ses publications, partages et médias.
        </p>
        <p className="mb-8 text-xs text-gray-400">
            Vous devrez attendre que votre demande soit acceptée.
        </p>

        {/* Bouton S'abonner / En attente */}
        {isFollowing ? (
            <div className="flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-600">
                <UserPlus className="h-4 w-4" />
                Demande envoyée
            </div>
        ) : (
            <button
                onClick={onFollowClick}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
                <UserPlus className="h-4 w-4" />
                S'abonner
            </button>
        )}
    </div>
);

// ============================================================================
// Composant principal Profile
// ============================================================================

const Profile = () => {
    const {
        profile_user,
        posts: initialPosts,
        media_posts,
        shares: initialShares,
        liked_posts,
        stats,
        relationship,
        auth,
    } = usePage<ProfilePageProps & Record<string, any>>().props;

    const [posts, setPosts] = useState<Post[]>(initialPosts?.data || []);
    const [shares, setShares] = useState<Post[]>(initialShares?.data || []);
    const [activeTab, setActiveTab] = useState('publications');
    const [shareFilter, setShareFilter] = useState<
        'all' | 'reposts' | 'quotes'
    >('all');
    const [showEdit, setShowEdit] = useState(false);

    // ── State du modal ──
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const currentUser = auth.user;
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // true = compte privé ET visiteur non abonné → afficher l'écran de verrouillage
    const isPrivateLocked = relationship?.is_private_locked === true;

    // Vérifier si c'est un tradipraticien
    const isPractitioner = ['practitioner', 'expert'].includes(
        profile_user?.account_type,
    );

    const refreshPosts = () => {
        router.get(
            `/profile/${profile_user.id}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: [
                    'posts',
                    'shares',
                    'media_posts',
                    'liked_posts',
                    'stats',
                ],
            },
        );
    };

    /**
     * Gérer le clic sur "S'abonner" depuis l'écran de verrouillage.
     * Redirige vers la route de follow (à adapter selon votre implémentation).
     */
    const handleFollowFromLock = () => {
        router.post(
            `/users/${profile_user.id}/follow`,
            {},
            { preserveState: true, onSuccess: refreshPosts },
        );
    };

    useEffect(() => {
        if (initialPosts?.data) setPosts(initialPosts.data);
    }, [initialPosts]);

    useEffect(() => {
        if (initialShares?.data) setShares(initialShares.data);
    }, [initialShares]);

    useEffect(() => {
        if (activeTab === 'partages') setShareFilter('all');
    }, [activeTab]);

    return profile_user ? (
        <AppLayout showLeftSidebar={false}>
            <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
                <div className="mx-auto max-w-6xl">
                    {/* ====================================================
                        Carte de profil (toujours visible, même si privé)
                    ==================================================== */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                        {/* Cover photo */}
                        <div className="relative h-40 bg-gradient-to-r from-emerald-200 via-emerald-200 to-emerald-200 md:h-56">
                            {profile_user.cover_photo ? (
                                <img
                                    src={profile_user.cover_photo}
                                    alt="Cover"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center text-white opacity-50">
                                        <p className="text-lg font-semibold">
                                            {profile_user.full_name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Badges de vérification */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                {profile_user.is_verified && (
                                    <div className="rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
                                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                            <CheckCircle className="h-4 w-4" />
                                            Vérifié
                                        </span>
                                    </div>
                                )}
                                {profile_user.is_expert && (
                                    <div className="rounded-full bg-amber-500/90 px-3 py-1 backdrop-blur-sm">
                                        <span className="flex items-center gap-1 text-xs font-medium text-white">
                                            <Award className="h-4 w-4" />
                                            Expert
                                        </span>
                                    </div>
                                )}
                                {/* Badge "Compte privé" visible par tous */}
                                {profile_user.is_private && (
                                    <div className="rounded-full bg-gray-800/80 px-3 py-1 backdrop-blur-sm">
                                        <span className="flex items-center gap-1 text-xs font-medium text-white">
                                            <Lock className="h-3.5 w-3.5" />
                                            Privé
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <UserProfileInfo
                            user={profile_user}
                            stats={stats}
                            relationship={relationship}
                            setShowEdit={setShowEdit}
                            onUpdate={refreshPosts}
                        />

                        {/* Informations complémentaires pour tradipraticiens
                            Visibles même si le compte est privé (informations publiques) */}
                        {isPractitioner && (
                            <div className="border-t border-gray-200 px-6 py-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {profile_user.years_of_experience && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                                <Briefcase className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Expérience
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {
                                                        profile_user.years_of_experience
                                                    }{' '}
                                                    ans
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {profile_user.specialties && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                                <Award className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Spécialités
                                                </p>
                                                <p className="line-clamp-1 font-medium text-gray-900">
                                                    {profile_user.specialties}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {profile_user.consultation_price_min && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <span className="text-lg">
                                                    💰
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Tarifs
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {
                                                        profile_user.consultation_price_min
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        profile_user.consultation_price_max
                                                    }{' '}
                                                    {profile_user.currency ||
                                                        'FCFA'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {profile_user.rating != null &&
                                        profile_user.rating > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Note
                                                    </p>
                                                    <p className="font-medium text-gray-900">
                                                        {profile_user.rating.toFixed(
                                                            1,
                                                        )}
                                                        /5 (
                                                        {
                                                            profile_user.total_ratings
                                                        }{' '}
                                                        avis)
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {profile_user.languages &&
                                        profile_user.languages.length > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                                                    <Globe className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Langues
                                                    </p>
                                                    <p className="font-medium text-gray-900">
                                                        {profile_user.languages.join(
                                                            ', ',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                    {profile_user.intervention_radius_km && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                                <MapPin className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Rayon d'intervention
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {
                                                        profile_user.intervention_radius_km
                                                    }{' '}
                                                    km
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Contact rapide (pour non-propriétaires) */}
                                {!relationship.is_own_profile && (
                                    <div className="mt-4 flex gap-3">
                                        {profile_user.phone && (
                                            <a
                                                href={`tel:${profile_user.phone}`}
                                                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                            >
                                                <Phone className="h-4 w-4" />
                                                Appeler
                                            </a>
                                        )}
                                        {profile_user.whatsapp && (
                                            <a
                                                href={`https://wa.me/${profile_user.whatsapp}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                WhatsApp
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ================================================
                            ZONE DE CONTENU : Onglets OU Écran de verrouillage
                        ================================================ */}

                        {isPrivateLocked ? (
                            /* ---- Compte privé : visiteur non abonné ---- */
                            <div className="px-6 pb-8">
                                <PrivateProfileLock
                                    userName={profile_user.full_name}
                                    isFollowing={relationship.is_following}
                                    onFollowClick={handleFollowFromLock}
                                />
                            </div>
                        ) : (
                            /* ---- Compte accessible : onglets normaux ---- */
                            <div className="mt-6">
                                {/* Navigation par onglets */}
                                <div className="mx-auto flex max-w-4xl rounded-xl bg-white p-1 shadow">
                                    {[
                                        'publications',
                                        'partages',
                                        'media',
                                        'likes',
                                    ].map((tab) => (
                                        <button
                                            onClick={() => setActiveTab(tab)}
                                            key={tab}
                                            className={`flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                                                activeTab === tab
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {tab === 'publications' && (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                                        />
                                                    </svg>
                                                )}
                                                {tab === 'partages' && (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                                        />
                                                    </svg>
                                                )}
                                                {tab === 'media' && (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                )}
                                                {tab === 'likes' && (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                        />
                                                    </svg>
                                                )}
                                                <span>
                                                    {tab
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        tab.slice(1)}
                                                </span>
                                                {tab === 'publications' && (
                                                    <span className="ml-1 text-xs opacity-75">
                                                        ({stats.posts_count})
                                                    </span>
                                                )}
                                                {tab === 'media' && (
                                                    <span className="ml-1 text-xs opacity-75">
                                                        (
                                                        {media_posts?.length ||
                                                            0}
                                                        )
                                                    </span>
                                                )}
                                                {tab === 'partages' && (
                                                    <span className="ml-1 text-xs opacity-75">
                                                        (
                                                        {stats.shares_count ||
                                                            0}
                                                        )
                                                    </span>
                                                )}
                                                {tab === 'likes' &&
                                                    relationship.is_own_profile && (
                                                        <span className="ml-1 text-xs opacity-75">
                                                            (
                                                            {stats.likes_count ||
                                                                0}
                                                            )
                                                        </span>
                                                    )}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* ---- Onglet Publications ---- */}
                                {activeTab === 'publications' && (
                                    <div className="mt-6 flex flex-col items-center gap-6">
                                        {posts.length > 0 ? (
                                            posts.map((post) => (
                                                <div
                                                    key={post.id}
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        // Éviter d'ouvrir le modal si on clique sur un bouton d'action
                                                        const target =
                                                            e.target as HTMLElement;
                                                        if (
                                                            target.closest(
                                                                'button',
                                                            ) ||
                                                            target.closest(
                                                                'a',
                                                            ) ||
                                                            target.closest(
                                                                '[data-no-modal]',
                                                            )
                                                        )
                                                            return;
                                                        setSelectedPostId(
                                                            post.id,
                                                        );
                                                    }}
                                                >
                                                    <PostCard
                                                        key={post.id}
                                                        post={post}
                                                        onUpdate={refreshPosts}
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-full rounded-xl bg-white p-12 text-center shadow">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                                    <svg
                                                        className="h-8 w-8 text-emerald-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-lg font-medium text-gray-900">
                                                    Aucune publication
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {relationship.is_own_profile
                                                        ? "Vous n'avez encore rien posté"
                                                        : `${profile_user.full_name} n'a encore rien posté`}
                                                </p>
                                                {relationship.is_own_profile && (
                                                    <button
                                                        onClick={() =>
                                                            router.visit(
                                                                '/create-post',
                                                            )
                                                        }
                                                        className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                                                    >
                                                        Créer votre première
                                                        publication
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ---- Onglet Partages ---- */}
                                {activeTab === 'partages' && (
                                    <div className="mt-6 flex flex-col items-center gap-6">
                                        {shares.length > 0 ? (
                                            <>
                                                <div className="w-full max-w-xl">
                                                    <div className="flex gap-2 rounded-lg bg-white p-1 shadow-sm">
                                                        <button
                                                            onClick={() =>
                                                                setShareFilter(
                                                                    'all',
                                                                )
                                                            }
                                                            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${shareFilter === 'all' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            Tous (
                                                            {stats.shares_count ||
                                                                0}
                                                            )
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setShareFilter(
                                                                    'reposts',
                                                                )
                                                            }
                                                            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${shareFilter === 'reposts' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            Republication (
                                                            {stats.reposts_count ||
                                                                0}
                                                            )
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setShareFilter(
                                                                    'quotes',
                                                                )
                                                            }
                                                            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${shareFilter === 'quotes' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            Citations (
                                                            {stats.quotes_count ||
                                                                0}
                                                            )
                                                        </button>
                                                    </div>
                                                </div>
                                                {shares
                                                    .filter((share) => {
                                                        if (
                                                            shareFilter ===
                                                            'reposts'
                                                        )
                                                            return (
                                                                share.item_type ===
                                                                'repost'
                                                            );
                                                        if (
                                                            shareFilter ===
                                                            'quotes'
                                                        )
                                                            return (
                                                                share.item_type ===
                                                                'quote'
                                                            );
                                                        return true;
                                                    })
                                                    .map((share) => (
                                                        <PostCard
                                                            key={`${share.item_type}-${share.share_id || share.id}`}
                                                            post={share}
                                                            onUpdate={
                                                                refreshPosts
                                                            }
                                                        />
                                                    ))}
                                            </>
                                        ) : (
                                            <div className="w-full rounded-xl bg-white p-12 text-center shadow">
                                                <p className="text-lg font-medium text-gray-900">
                                                    Aucun partage
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {relationship.is_own_profile
                                                        ? "Vous n'avez encore rien partagé"
                                                        : `${profile_user.full_name} n'a encore rien partagé`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ---- Onglet Médias ---- */}
                                {activeTab === 'media' && (
                                    <div className="mt-6">
                                        {media_posts &&
                                        media_posts.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                                {media_posts.map((post) =>
                                                    post.images.map((image) => (
                                                        <Link
                                                            key={image.id}
                                                            href={
                                                                image.image_url
                                                            }
                                                            target="_blank"
                                                            className="group relative aspect-square overflow-hidden rounded-lg shadow-sm transition hover:shadow-md"
                                                        >
                                                            <img
                                                                src={
                                                                    image.image_url
                                                                }
                                                                alt="Media"
                                                                className="h-full w-full object-cover transition group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
                                                                <div className="absolute right-0 bottom-0 left-0 p-3">
                                                                    <p className="text-xs font-medium text-white">
                                                                        {moment(
                                                                            post.created_at,
                                                                        ).fromNow()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full rounded-xl bg-white p-12 text-center shadow">
                                                <p className="text-lg font-medium text-gray-900">
                                                    Aucun média
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {relationship.is_own_profile
                                                        ? "Vous n'avez encore posté aucun média"
                                                        : `${profile_user.full_name} n'a encore posté aucun média`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ---- Onglet Likes (propriétaire uniquement) ---- */}
                                {activeTab === 'likes' && (
                                    <div className="mt-6 flex flex-col items-center gap-6">
                                        {relationship.is_own_profile ? (
                                            liked_posts?.data &&
                                            liked_posts.data.length > 0 ? (
                                                liked_posts.data.map((post) => (
                                                    <PostCard
                                                        key={post.id}
                                                        post={post}
                                                        onUpdate={refreshPosts}
                                                    />
                                                ))
                                            ) : (
                                                <div className="w-full rounded-xl bg-white p-12 text-center shadow">
                                                    <p className="text-lg font-medium text-gray-900">
                                                        Aucune publication aimée
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        Vous n'avez encore aimé
                                                        aucune publication
                                                    </p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="w-full rounded-xl bg-white p-12 text-center shadow">
                                                <p className="text-lg font-medium text-gray-900">
                                                    Contenu privé
                                                </p>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Les publications aimées sont
                                                    privées
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* FIN ZONE DE CONTENU */}
                    </div>
                </div>

                {/* Modal d'édition du profil */}
                {showEdit && relationship.is_own_profile && (
                    <ProfileModal
                        user={profile_user}
                        setShowEdit={setShowEdit}
                        onUpdate={refreshPosts}
                    />
                )}
            </div>
            {/* ══ Modal post — monté au root du layout ══ */}
            {selectedPostId && (
                <PostModal
                    postId={selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                />
            )}
        </AppLayout>
    ) : (
        <Loading />
    );
};

export default Profile;
