// import { bgGradient } from '@/components/assets/assets';
// import UserCard from '@/components/front/user-card';
// import Loading from '@/components/loading';
// import AppLayout from '@/layouts/app-layout';
// import type { DiscoverPageProps, DiscoverUser } from '@/types/discover';
// import { router, usePage } from '@inertiajs/react';
// import { Search, TrendingUp, X } from 'lucide-react';
// import { useEffect, useState } from 'react';

// const Discover = () => {
//     // Récupération des données depuis Inertia avec valeurs par défaut
//     const {
//         users: initialUsers,
//         suggestions = [],
//         search_query = '',
//         auth,
//     } = usePage<DiscoverPageProps>().props;

//     // États locaux avec vérifications
//     const [input, setInput] = useState(search_query || '');
//     const [users, setUsers] = useState<DiscoverUser[]>(
//         initialUsers?.data || [],
//     );
//     const [loading, setLoading] = useState(false);
//     const [currentPage, setCurrentPage] = useState(
//         initialUsers?.current_page || 1,
//     );
//     const [hasMorePages, setHasMorePages] = useState(
//         initialUsers?.next_page_url !== null &&
//             initialUsers?.next_page_url !== undefined,
//     );
//     const [totalResults, setTotalResults] = useState(initialUsers?.total || 0);

//     // Rafraîchir les données
//     const refreshData = () => {
//         router.get(
//             '/discover',
//             { search: input },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 only: ['users', 'search_query'],
//             },
//         );
//     };

//     // Recherche au clavier (Enter)
//     const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === 'Enter') {
//             performSearch();
//         }
//     };

//     // Effectuer la recherche
//     const performSearch = () => {
//         setLoading(true);
//         router.get(
//             '/discover',
//             { search: input },
//             {
//                 preserveState: false,
//                 preserveScroll: false,
//                 onFinish: () => setLoading(false),
//             },
//         );
//     };

//     // Effacer la recherche
//     const clearSearch = () => {
//         setInput('');
//         router.get(
//             '/discover',
//             {},
//             {
//                 preserveState: false,
//                 preserveScroll: false,
//             },
//         );
//     };

//     // Charger plus de résultats (pagination)
//     const loadMore = () => {
//         if (!hasMorePages || loading) return;

//         setLoading(true);
//         router.get(
//             '/discover',
//             { search: input, page: currentPage + 1 },
//             {
//                 preserveState: true,
//                 preserveScroll: true,
//                 only: ['users'],
//                 onSuccess: (page) => {
//                     const newData = (page.props as unknown as DiscoverPageProps)
//                         .users;
//                     if (newData && newData.data) {
//                         setUsers((prev) => [...prev, ...newData.data]);
//                         setCurrentPage(newData.current_page);
//                         setHasMorePages(newData.next_page_url !== null);
//                         setTotalResults(newData.total);
//                     }
//                 },
//                 onFinish: () => setLoading(false),
//             },
//         );
//     };

//     // Mettre à jour quand les props changent
//     useEffect(() => {
//         if (initialUsers && initialUsers.data) {
//             setUsers(initialUsers.data);
//             setCurrentPage(initialUsers.current_page);
//             setHasMorePages(initialUsers.next_page_url !== null);
//             setTotalResults(initialUsers.total);
//         }
//     }, [initialUsers]);

//     return (
//         <AppLayout showLeftSidebar={false}>
//             <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//                 <div className="mx-auto max-w-7xl p-6">
//                     {/* Header */}
//                     <div className="mb-8">
//                         <h1 className="mb-2 text-3xl font-bold text-slate-900">
//                             Découvrir des personnes
//                         </h1>
//                         <p className="text-slate-600">
//                             Connectez-vous avec des personnes incroyables et
//                             développez votre réseau
//                         </p>
//                     </div>

//                     {/* Barre de recherche */}
//                     <div className="mb-8 rounded-xl border border-slate-200/60 bg-white shadow-md">
//                         <div className="p-6">
//                             <div className="relative">
//                                 <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
//                                 <input
//                                     type="text"
//                                     placeholder="Rechercher par nom, nom d'utilisateur, bio ou emplacement..."
//                                     className="w-full rounded-lg border border-gray-300 py-3 pr-24 pl-12 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
//                                     onChange={(e) => setInput(e.target.value)}
//                                     value={input}
//                                     onKeyUp={handleSearch}
//                                 />
//                                 <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-2">
//                                     {input && (
//                                         <button
//                                             onClick={clearSearch}
//                                             className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
//                                             title="Effacer la recherche"
//                                         >
//                                             <X className="h-4 w-4" />
//                                         </button>
//                                     )}
//                                     <button
//                                         onClick={performSearch}
//                                         disabled={loading}
//                                         className={`rounded-lg ${bgGradient} px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50`}
//                                     >
//                                         {loading
//                                             ? 'Recherche en cours...'
//                                             : 'Rechercher'}
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Indicateur de résultats */}
//                             {search_query && totalResults > 0 && (
//                                 <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2 text-sm">
//                                     <span className="text-emerald-800">
//                                         <strong>{totalResults}</strong>{' '}
//                                         résultats
//                                         {totalResults !== 1 ? 's' : ''} trouvés
//                                         pour
//                                         <strong className="ml-1">
//                                             "{search_query}"
//                                         </strong>
//                                     </span>
//                                     <button
//                                         onClick={clearSearch}
//                                         className="text-emerald-600 hover:text-emerald-800"
//                                     >
//                                         Effacer
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Suggestions (si pas de recherche) */}
//                     {!search_query && suggestions && suggestions.length > 0 && (
//                         <div className="mb-8">
//                             <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
//                                 <TrendingUp className="h-5 w-5 text-emerald-600" />
//                                 Profils Populaires
//                             </h2>
//                             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                                 {suggestions.map((user) => (
//                                     <UserCard
//                                         key={user.id}
//                                         user={user}
//                                         onUpdate={refreshData}
//                                     />
//                                 ))}
//                             </div>
//                         </div>
//                     )}

//                     {/* Liste des utilisateurs */}
//                     {users.length > 0 && (
//                         <>
//                             {search_query && (
//                                 <h2 className="mb-4 text-xl font-bold text-slate-900">
//                                     Résultats de recherche
//                                 </h2>
//                             )}
//                             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//                                 {users.map((user) => (
//                                     <UserCard
//                                         key={user.id}
//                                         user={user}
//                                         onUpdate={refreshData}
//                                     />
//                                 ))}
//                             </div>

//                             {/* Bouton charger plus */}
//                             {hasMorePages && (
//                                 <div className="mt-8 flex justify-center">
//                                     <button
//                                         onClick={loadMore}
//                                         disabled={loading}
//                                         className="rounded-lg border-2 border-emerald-500 px-6 py-3 font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
//                                     >
//                                         {loading
//                                             ? 'Chargement...'
//                                             : 'Charger plus'}
//                                     </button>
//                                 </div>
//                             )}
//                         </>
//                     )}

//                     {/* État vide */}
//                     {users.length === 0 && !loading && (
//                         <div className="rounded-xl bg-white p-12 text-center shadow">
//                             <Search className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//                             <h3 className="mb-2 text-xl font-bold text-gray-900">
//                                 {search_query
//                                     ? 'Rien trouvé'
//                                     : 'Commencez à découvrir des personnes'}
//                             </h3>
//                             <p className="text-gray-600">
//                                 {search_query
//                                     ? `Aucun utilisateur trouvé correspondant à "${search_query}". Essayez un terme de recherche différent.`
//                                     : 'Recherchez des personnes avec qui vous connecter et développer votre réseau'}
//                             </p>
//                             {search_query && (
//                                 <button
//                                     onClick={clearSearch}
//                                     className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
//                                 >
//                                     Effacer la recherche
//                                 </button>
//                             )}
//                         </div>
//                     )}

//                     {/* Loading state */}
//                     {loading && users.length === 0 && <Loading height="60vh" />}
//                 </div>
//             </div>
//         </AppLayout>
//     );
// };

// export default Discover;

import { bgGradient } from '@/components/assets/assets';
import UserCard from '@/components/front/user-card';
import Loading from '@/components/loading';
import AppLayout from '@/layouts/app-layout';
import type { DiscoverPageProps, DiscoverUser } from '@/types/discover';
import { router, usePage } from '@inertiajs/react';
import { Search, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const Discover = () => {
    const {
        users: initialUsers,
        suggestions = [],
        search_query = '',
        auth,
    } = usePage<DiscoverPageProps>().props;

    // ── États locaux ──────────────────────────────────────────────────────────
    const [input, setInput] = useState(search_query || '');
    const [users, setUsers] = useState<DiscoverUser[]>(
        initialUsers?.data || [],
    );
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(
        initialUsers?.current_page || 1,
    );
    const [hasMorePages, setHasMorePages] = useState(
        initialUsers?.next_page_url !== null &&
            initialUsers?.next_page_url !== undefined,
    );
    const [totalResults, setTotalResults] = useState(initialUsers?.total || 0);

    // ── Fonctions ─────────────────────────────────────────────────────────────

    const refreshData = () => {
        router.get(
            '/discover',
            { search: input },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['users', 'search_query'],
            },
        );
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') performSearch();
    };

    const performSearch = () => {
        setLoading(true);
        router.get(
            '/discover',
            { search: input },
            {
                preserveState: false,
                preserveScroll: false,
                onFinish: () => setLoading(false),
            },
        );
    };

    const clearSearch = () => {
        setInput('');
        router.get(
            '/discover',
            {},
            { preserveState: false, preserveScroll: false },
        );
    };

    const loadMore = () => {
        if (!hasMorePages || loading) return;
        setLoading(true);
        router.get(
            '/discover',
            { search: input, page: currentPage + 1 },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['users'],
                onSuccess: (page) => {
                    const newData = (page.props as unknown as DiscoverPageProps)
                        .users;
                    if (newData?.data) {
                        setUsers((prev) => [...prev, ...newData.data]);
                        setCurrentPage(newData.current_page);
                        setHasMorePages(newData.next_page_url !== null);
                        setTotalResults(newData.total);
                    }
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    // Synchroniser l'état local quand les props Inertia changent
    useEffect(() => {
        if (initialUsers?.data) {
            setUsers(initialUsers.data);
            setCurrentPage(initialUsers.current_page);
            setHasMorePages(initialUsers.next_page_url !== null);
            setTotalResults(initialUsers.total);
        }
    }, [initialUsers]);

    // ── Rendu ─────────────────────────────────────────────────────────────────

    return (
        <AppLayout showLeftSidebar={false}>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <div className="mx-auto max-w-5xl p-6">
                    {/* ── Header ─────────────────────────────────────────────── */}
                    <div className="mb-6">
                        <h1 className="mb-1 text-2xl font-bold text-slate-900">
                            Découvrir des personnes
                        </h1>
                        <p className="text-sm text-slate-500">
                            Connectez-vous avec des tradipraticiens et
                            développez votre réseau
                        </p>
                    </div>

                    {/* ── Barre de recherche ──────────────────────────────────── */}
                    <div className="mb-6 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Nom, username, bio, région…"
                                className="w-full rounded-lg border border-gray-200 py-2.5 pr-28 pl-10 text-sm transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyUp={handleSearch}
                            />
                            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-1.5">
                                {input && (
                                    <button
                                        onClick={clearSearch}
                                        className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                        title="Effacer"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <button
                                    onClick={performSearch}
                                    disabled={loading}
                                    className={`rounded-lg ${bgGradient} px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50`}
                                >
                                    {loading ? 'Recherche…' : 'Rechercher'}
                                </button>
                            </div>
                        </div>

                        {/* Indicateur de résultats */}
                        {search_query && totalResults > 0 && (
                            <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 text-xs">
                                <span className="text-emerald-800">
                                    <strong>{totalResults}</strong> résultat
                                    {totalResults > 1 ? 's' : ''} pour{' '}
                                    <strong>"{search_query}"</strong>
                                </span>
                                <button
                                    onClick={clearSearch}
                                    className="font-medium text-emerald-600 hover:text-emerald-800"
                                >
                                    Effacer
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Suggestions ─────────────────────────────────────────── */}
                    {!search_query && suggestions && suggestions.length > 0 && (
                        <section className="mb-8">
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                                Profils populaires
                            </h2>
                            {/* Grille 1 col mobile → 2 col tablette+ pour les cartes compactes */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {suggestions.map((user) => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        onUpdate={refreshData}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Liste principale ─────────────────────────────────────── */}
                    {users.length > 0 && (
                        <section>
                            {search_query && (
                                <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                                    Résultats de recherche
                                </h2>
                            )}

                            {!search_query && (
                                <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                                    Tous les membres
                                </h2>
                            )}

                            {/* Grille 1 col mobile → 2 col tablette+ */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {users.map((user) => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        onUpdate={refreshData}
                                    />
                                ))}
                            </div>

                            {/* Charger plus */}
                            {hasMorePages && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="rounded-lg border-2 border-emerald-500 px-5 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                    >
                                        {loading
                                            ? 'Chargement…'
                                            : 'Charger plus'}
                                    </button>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ── État vide ────────────────────────────────────────────── */}
                    {users.length === 0 && !loading && (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
                            <Search className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                            <h3 className="mb-1 text-base font-bold text-gray-900">
                                {search_query
                                    ? 'Aucun résultat'
                                    : 'Commencez à découvrir'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {search_query
                                    ? `Aucun utilisateur trouvé pour "${search_query}". Essayez un autre terme.`
                                    : 'Recherchez des personnes avec qui vous connecter'}
                            </p>
                            {search_query && (
                                <button
                                    onClick={clearSearch}
                                    className={`mt-4 rounded-lg ${bgGradient} px-5 py-2 text-sm font-medium text-white transition`}
                                >
                                    Effacer la recherche
                                </button>
                            )}
                        </div>
                    )}

                    {/* Loading plein écran */}
                    {loading && users.length === 0 && <Loading height="60vh" />}
                </div>
            </div>
        </AppLayout>
    );
};

export default Discover;