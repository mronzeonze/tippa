import RecentMessages from '@/components/front/recent-messages';
import SponsorWidget from '@/components/front/sponsor_widget';
import { HorizontalNavbar } from '@/components/horizontal-navbar';
import { Link, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    Eye,
    MapPin,
    PlusCircle,
    RefreshCw,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import {
    type PropsWithChildren,
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Toaster } from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarStats {
    connections_count: number;
    profile_views: number;
    new_views: number; // badge rouge « nouveau »
    followers_count: number;
    following_count: number;
    fetched_at?: string;
}

interface AppLayoutProps extends PropsWithChildren {
    showLeftSidebar?: boolean;
    showRightSidebar?: boolean;
    showRecentMessages?: boolean;
    showCreatePostWidget?: boolean;
    leftSidebarContent?: ReactNode;
    rightSidebarContent?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : useProfileStats
// Récupère les stats depuis GET /api/user/stats puis les rafraîchit
// automatiquement toutes les POLL_INTERVAL ms (60 s par défaut).
// ─────────────────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 60_000; // 60 secondes

function useProfileStats(
    initialConnectionsCount: number,
    initialProfileViews: number,
) {
    const [stats, setStats] = useState<SidebarStats>({
        connections_count: initialConnectionsCount,
        profile_views: initialProfileViews,
        new_views: 0,
        followers_count: 0,
        following_count: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Appel vers l'endpoint Laravel : GET /user/stats
            // Protégé par auth:sanctum (ou session cookie Inertia)
            const response = await fetch('/user/stats', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin', // envoie le cookie de session Laravel
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data: SidebarStats = await response.json();
            setStats(data);
            setLastRefresh(new Date());
        } catch (err) {
            // En cas d'erreur on garde les valeurs précédentes
            setError('Impossible de rafraîchir les statistiques');
            console.warn('[ProfileSidebar] fetchStats error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Chargement initial + polling
    useEffect(() => {
        fetchStats(); // 1er appel immédiat

        intervalRef.current = setInterval(fetchStats, POLL_INTERVAL);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchStats]);

    return { stats, loading, error, lastRefresh, refresh: fetchStats };
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant : StatRow  (une ligne de statistique)
// ─────────────────────────────────────────────────────────────────────────────

interface StatRowProps {
    label: string;
    value: number;
    badge?: number; // badge « nouveau »
    isLoading?: boolean;
    colorClass?: string; // ex. "text-emerald-600"
    icon?: ReactNode;
}

function StatRow({
    label,
    value,
    badge = 0,
    isLoading = false,
    colorClass = 'text-emerald-600',
    icon,
}: StatRowProps) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-600">
                {icon}
                {label}
            </span>

            <span
                className={`flex items-center gap-1 font-semibold ${colorClass}`}
            >
                {isLoading ? (
                    /* Skeleton animé pendant le chargement */
                    <span className="inline-block h-3 w-8 animate-pulse rounded bg-gray-200" />
                ) : (
                    <>
                        {value.toLocaleString('fr-FR')}
                        {badge > 0 && (
                            <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
                                +{badge}
                            </span>
                        )}
                    </>
                )}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant : ProfileSidebar
// ─────────────────────────────────────────────────────────────────────────────

function ProfileSidebar() {
    const { auth } = usePage<any>().props;
    const currentUser = auth?.user;

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Valeurs initiales issues des props Inertia (évite un « 0 » au 1er rendu)
    const { stats, loading, error, lastRefresh, refresh } = useProfileStats(
        currentUser?.connections_count ?? 0,
        currentUser?.profile_views ?? 0,
    );

    if (!currentUser) return null;

    // Formater l'heure du dernier rafraîchissement
    const lastRefreshLabel = lastRefresh.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="sticky top-20 hidden w-64 space-y-4 lg:block">
            {/* ── Carte Profil Principal ── */}
            <div className="overflow-hidden rounded-xl bg-white shadow">
                {/* Cover Image */}
                <div className="relative h-16 bg-gradient-to-r from-emerald-400 to-green-500">
                    {currentUser.cover_photo && (
                        <img
                            src={currentUser.cover_photo}
                            alt="Cover"
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                {/* Profil Info */}
                <div className="relative px-4 pb-4">
                    {/* Photo de profil */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                        <img
                            src={
                                currentUser.profile_picture ||
                                defaultProfilePicture
                            }
                            alt={currentUser.full_name}
                            className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-md"
                            onError={(e) => {
                                e.currentTarget.src = defaultProfilePicture;
                            }}
                        />
                    </div>

                    {/* Nom et titre */}
                    <div className="mt-10 text-center">
                        <Link href={`/profile/${currentUser.id}`}>
                            <h3 className="text-sm font-semibold text-gray-900 hover:text-emerald-600">
                                {currentUser.full_name}
                            </h3>
                        </Link>
                        <p className="mt-0.5 text-xs text-gray-600">
                            @{currentUser.username}
                        </p>
                        {currentUser.bio && (
                            <p className="mt-2 line-clamp-2 text-xs text-gray-600">
                                {currentUser.bio}
                            </p>
                        )}
                    </div>

                    {/* ── Section Stats (mise à jour en temps réel) ── */}
                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                        {/* En-tête avec bouton rafraîchir */}
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                                Statistiques
                            </span>
                            <button
                                onClick={refresh}
                                disabled={loading}
                                title={`Dernière mise à jour : ${lastRefreshLabel}`}
                                className={`rounded p-0.5 text-gray-400 transition hover:text-emerald-600 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none disabled:cursor-not-allowed ${loading ? 'animate-spin text-emerald-500' : ''} `}
                            >
                                <RefreshCw className="h-3 w-3" />
                            </button>
                        </div>

                        {/* Message d'erreur discret */}
                        {error && (
                            <p className="text-[10px] text-red-400">{error}</p>
                        )}

                        {/* Ligne : Connexions */}
                        <StatRow
                            label="Connexions"
                            value={stats.connections_count}
                            isLoading={loading}
                            colorClass="text-emerald-600"
                            icon={<Users className="h-3 w-3" />}
                        />

                        {/* Ligne : followers */}
                        <StatRow
                            label="Abonnés"
                            value={stats.followers_count}
                            badge={stats.new_views}
                            isLoading={loading}
                            colorClass="text-gray-900"
                            icon={<Users className="h-3 w-3" />}
                        />

                        {/* Ligne : followers */}
                        <StatRow
                            label="Abonnements"
                            value={stats.following_count}
                            badge={stats.new_views}
                            isLoading={loading}
                            colorClass="text-gray-900"
                            icon={<UserCheck className="h-3 w-3" />}
                        />

                        {/* Ligne : Vues du profil (avec badge nouvelles vues) */}
                        <StatRow
                            label="Vues du profil"
                            value={stats.profile_views}
                            badge={stats.new_views}
                            isLoading={loading}
                            colorClass="text-gray-900"
                            icon={<Eye className="h-3 w-3" />}
                        />

                        {/* Heure du dernier rafraîchissement */}
                        <p className="pt-1 text-right text-[10px] text-gray-300">
                            Mis à jour à {lastRefreshLabel}
                        </p>
                    </div>

                    {/* Informations supplémentaires */}
                    {(currentUser.location || currentUser.occupation) && (
                        <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                            {currentUser.location && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{currentUser.location}</span>
                                </div>
                            )}
                            {currentUser.occupation && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>{currentUser.occupation}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Section Groupes/Événements ── */}
            <div className="rounded-xl bg-white p-4 shadow">
                <h4 className="text-xs font-semibold text-gray-900">
                    Mes intérêts
                </h4>
                <div className="mt-3 space-y-2">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-xs text-gray-600 transition hover:text-emerald-600"
                    >
                        <Users className="h-4 w-4" />
                        <span>Groupes</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-xs text-gray-600 transition hover:text-emerald-600"
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Événements</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-xs text-gray-600 transition hover:text-emerald-600"
                    >
                        <TrendingUp className="h-4 w-4" />
                        <span>Hashtags suivis</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant : RightSidebar
// ─────────────────────────────────────────────────────────────────────────────

interface RightSidebarProps {
    showCreatePostWidget?: boolean;
    showRecentMessages?: boolean;
}

function RightSidebar({
    showCreatePostWidget = true,
    showRecentMessages = true,
}: RightSidebarProps) {
    const { auth, settings } = usePage<any>().props;

    return (
        <div className="sticky top-20 hidden w-80 space-y-4 xl:block">
            {/* Widget Créer un post (optionnel) */}
            {showCreatePostWidget && (
                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4">
                        <h3 className="font-semibold text-white">
                            Partagez vos pensées
                        </h3>
                    </div>
                    <div className="p-4">
                        <Link
                            href="/create-post"
                            className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-3 text-left transition hover:border-emerald-600 hover:bg-green-50"
                        >
                            <img
                                src={
                                    auth.user.profile_picture ||
                                    'http://localhost:8000/storage/images/default-avatar.jpg'
                                }
                                alt={auth.user.full_name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">
                                    Qu'est-ce qui vous préoccupe ?
                                </p>
                            </div>
                            <PlusCircle className="h-5 w-5 text-emerald-600" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Widget Sponsorisé */}
            <SponsorWidget />

            {/* Widget Messages récents */}
            {showRecentMessages && <RecentMessages />}

            {/* Footer */}
            <div className="rounded-xl bg-white p-4 text-center text-xs text-gray-500 shadow">
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                    <Link href="/about" className="hover:text-emerald-600">
                        À propos
                    </Link>
                    <Link href="/help" className="hover:text-emerald-600">
                        Aide
                    </Link>
                    <Link href="/privacy" className="hover:text-emerald-600">
                        Confidentialité
                    </Link>
                    <Link href="/terms" className="hover:text-emerald-600">
                        Conditions
                    </Link>
                </div>
                <p className="mt-2 text-gray-400">
                    © 2025 {settings?.app_name}
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout Principal
// ─────────────────────────────────────────────────────────────────────────────

export default function AppLayout({
    children,
    showLeftSidebar = true,
    showRightSidebar = true,
    showRecentMessages = true,
    showCreatePostWidget = true,
    leftSidebarContent,
    rightSidebarContent,
}: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Zone de notification */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { background: '#363636', color: '#fff' },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#fff' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#fff' },
                    },
                }}
            />

            {/* Navbar horizontale */}
            <HorizontalNavbar />

            {/* Contenu principal : structure 3 colonnes */}
            <div className="mx-auto max-w-[1400px]">
                <div className="flex gap-6 p-6">
                    {/* Sidebar Gauche – Profil */}
                    {showLeftSidebar &&
                        (leftSidebarContent || <ProfileSidebar />)}

                    {/* Contenu Principal */}
                    <main className="min-w-0 flex-1">{children}</main>

                    {/* Sidebar Droite – Widgets */}
                    {showRightSidebar &&
                        (rightSidebarContent || (
                            <RightSidebar
                                showCreatePostWidget={showCreatePostWidget}
                                showRecentMessages={showRecentMessages}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}