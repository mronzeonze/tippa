import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { User as UserType } from '@/types/user';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    Grid,
    Home,
    LogOut,
    Menu,
    MessageCircle,
    PlusCircle,
    Search,
    Settings,
    User,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Un rôle tel que sérialisé par buildAuthPayload() côté Laravel.
 * Chargé depuis la table pivot `user_roles`.
 */
interface UserRole {
    id: string;
    name: string;
    slug: string;
}

interface AppSettings {
    app_name: string;
    // Ajoutez d'autres paramètres globaux si nécessaire
}

/**
 * On étend UserType en remplaçant l'ancien champ `role` (objet scalaire)
 * par `roles[]` (many-to-many depuis user_roles).
 */
interface AuthUser extends Omit<UserType, 'roles'> {
    roles: UserRole[];
}

interface PageProps {
    auth: {
        user: AuthUser;
    };
    settings: AppSettings;
    [key: string]: any;
}

// ─── Helper — détection de rôle ───────────────────────────────────────────────

/**
 * Vérifie si l'utilisateur possède un rôle donné (par son slug)
 * dans le tableau `roles[]` chargé depuis `user_roles`.
 *
 * @example  userHasRole(currentUser, 'super-admin')
 * @example  userHasRole(currentUser, 'moderation')
 */
function userHasRole(user: AuthUser, slug: string): boolean {
    return Array.isArray(user.roles) && user.roles.some((r) => r.slug === slug);
}

export function HorizontalNavbar() {
    const { auth, settings } = usePage<PageProps>().props;
    const currentUser = auth?.user;
    const appName = settings?.app_name || 'Mon Application';

    // Calculer les droits une seule fois pour ce rendu
    // Source : roles[] chargés depuis user_roles via buildAuthPayload()
    const isSuperAdmin = userHasRole(currentUser, 'super-admin');
    const isAdmin = userHasRole(currentUser, 'admin');
    const isModerator = userHasRole(currentUser, 'moderator');
    const hasAdminAccess = isSuperAdmin || isAdmin || isModerator;

    // URL du dashboard selon le rôle le plus élevé
    const dashboardHref =
        isModerator && !isSuperAdmin && !isAdmin
            ? '/moderator/dashboard'
            : '/admin/dashboard';

    // Libellé affiché dans le menu utilisateur
    const roleLabel = isSuperAdmin
        ? 'Super Admin'
        : isAdmin
          ? 'Administrateur'
          : isModerator
            ? 'Modérateur'
            : null;

    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hook pour les notifications
    const { unreadCount, notifications, isConnected } =
        useMessageNotifications();

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    const mainNavItems = [
        {
            title: 'Accueil',
            href: '/feeds',
            icon: Home,
            badge: null,
        },
        {
            title: 'Réseau',
            href: '/connections',
            icon: Users,
            badge: null,
        },
        {
            title: 'Découvrir',
            href: '/discover',
            icon: Search,
            badge: null,
        },
        {
            title: 'Messages',
            href: '/messages',
            icon: MessageCircle,
            badge: unreadCount,
        },
    ];

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo + Search */}
                    <div className="flex max-w-xl flex-1 items-center gap-4">
                        {/* Logo */}
                        <Link
                            href="/feeds"
                            className="flex shrink-0 items-center gap-2"
                        >
                            <AppLogo />
                            {/* Indicateur de connexion */}
                            <span
                                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
                                title={
                                    isConnected
                                        ? 'Connecté aux notifications'
                                        : 'Déconnecté'
                                }
                            />
                            
                        </Link>

                        {/* Barre de recherche */}
                        <div className="hidden max-w-md flex-1 md:flex">
                            <div className="relative w-full">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="w-full rounded-lg bg-gray-100 py-2 pr-4 pl-10 text-sm transition outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            const searchValue = (
                                                e.target as HTMLInputElement
                                            ).value;
                                            window.location.href = `/discover?search=${encodeURIComponent(searchValue)}`;
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Desktop */}
                    <div className="hidden items-center gap-1 lg:flex">
                        {mainNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group relative flex flex-col items-center gap-1 px-4 py-2 text-gray-600 transition hover:text-emerald-600"
                                >
                                    <div className="relative">
                                        <Icon className="h-6 w-6" />
                                        {/* {item.badge && item.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                {item.badge > 9
                                                    ? '9+'
                                                    : item.badge}
                                            </span>
                                        )} */}
                                    </div>
                                    <span className="text-xs font-medium">
                                        {item.title}
                                    </span>
                                    <div className="absolute right-0 bottom-0 left-0 h-1 rounded-t-full bg-emerald-600 opacity-0 transition-opacity group-hover:opacity-100" />
                                </Link>
                            );
                        })}

                        {/* Notifications Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative flex flex-col items-center gap-1 px-4 py-2 text-gray-600 transition hover:text-emerald-600"
                            >
                                <div className="relative">
                                    <Bell className="h-6 w-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                    )}
                                </div>
                                <span className="text-xs font-medium">
                                    Notifications
                                </span>
                            </button>

                            {/* Dropdown Notifications */}
                            {notifOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setNotifOpen(false)}
                                    />
                                    <div className="absolute top-full right-0 z-20 mt-2 w-96 rounded-xl border border-gray-200 bg-white shadow-lg">
                                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                            <p className="text-sm font-semibold text-gray-900">
                                                Notifications récentes
                                            </p>
                                            {unreadCount > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    {unreadCount} nouveau
                                                    {unreadCount > 1
                                                        ? 'x'
                                                        : ''}{' '}
                                                    message
                                                    {unreadCount > 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications &&
                                            notifications.length > 0 ? (
                                                <>
                                                    {notifications
                                                        .slice(0, 5)
                                                        .map((notif, index) => (
                                                            <Link
                                                                key={`${notif.sender?.id}-${index}`}
                                                                href={`/messages/${notif.sender?.id || ''}`}
                                                                className="flex items-start gap-3 border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50"
                                                                onClick={() =>
                                                                    setNotifOpen(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                <img
                                                                    src={
                                                                        notif
                                                                            .sender
                                                                            ?.profile_picture ||
                                                                        defaultProfilePicture
                                                                    }
                                                                    alt={
                                                                        notif
                                                                            .sender
                                                                            ?.full_name ||
                                                                        'User'
                                                                    }
                                                                    className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        e.currentTarget.src =
                                                                            defaultProfilePicture;
                                                                    }}
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                                        {notif
                                                                            .sender
                                                                            ?.full_name ||
                                                                            'Utilisateur'}
                                                                    </p>
                                                                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                                                                        {notif
                                                                            .message
                                                                            ?.message_type ===
                                                                        'image'
                                                                            ? '📷 Photo'
                                                                            : notif
                                                                                  .message
                                                                                  ?.text ||
                                                                              'Nouveau message'}
                                                                    </p>
                                                                    {notif
                                                                        .message
                                                                        ?.created_at && (
                                                                        <p className="mt-1 text-xs text-gray-400">
                                                                            {new Date(
                                                                                notif.message.created_at,
                                                                            ).toLocaleTimeString(
                                                                                'fr-FR',
                                                                                {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                },
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    <Link
                                                        href="/messages"
                                                        className="block py-3 text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                                                        onClick={() =>
                                                            setNotifOpen(false)
                                                        }
                                                    >
                                                        Voir tous les messages
                                                    </Link>
                                                </>
                                            ) : (
                                                <div className="px-4 py-12 text-center">
                                                    <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Aucune notification
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Vos nouveaux messages
                                                        apparaîtront ici
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Séparateur */}
                        <div className="mx-2 h-8 w-px bg-gray-200" />

                        {/* User Menu Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-gray-100"
                            >
                                <img
                                    src={
                                        currentUser.profile_picture ||
                                        defaultProfilePicture
                                    }
                                    alt={currentUser.full_name}
                                    className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            defaultProfilePicture;
                                    }}
                                />
                                <div className="hidden text-left xl:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        Moi
                                    </p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute top-full right-0 z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-lg">
                                        <div className="border-b border-gray-200 p-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        currentUser.profile_picture ||
                                                        defaultProfilePicture
                                                    }
                                                    alt={currentUser.full_name}
                                                    className="h-14 w-14 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            defaultProfilePicture;
                                                    }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {currentUser.full_name}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500">
                                                        @{currentUser.username}
                                                    </p>
                                                    {/* Badge de rôle — visible uniquement pour admin/modérateur */}
                                                    {roleLabel && (
                                                        <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                                                            {roleLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/profile/${currentUser.id}`}
                                                className="mt-3 block w-full rounded-lg border border-emerald-600 py-2 text-center text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                                                onClick={() =>
                                                    setUserMenuOpen(false)
                                                }
                                            >
                                                Voir le profil
                                            </Link>
                                        </div>

                                        <div className="p-2">
                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                                                onClick={() =>
                                                    setUserMenuOpen(false)
                                                }
                                            >
                                                <Settings className="h-4 w-4" />
                                                Paramètres
                                            </Link>
                                            <hr className="my-2 border-gray-200" />
                                            {/* Lien Dashboard — visible uniquement pour admin, super-admin et modérateur */}
                                            {hasAdminAccess && (
                                                <Link
                                                    href={dashboardHref}
                                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                                                    onClick={() =>
                                                        setUserMenuOpen(false)
                                                    }
                                                >
                                                    <Grid className="h-4 w-4" />
                                                    {roleLabel} Panel
                                                </Link>
                                            )}
                                            <hr className="my-2 border-gray-200" />
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Déconnexion
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Bouton Create Post */}
                        <Link
                            href="/create-post"
                            className="ml-2 flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-medium text-white transition hover:from-emerald-600 hover:to-green-700 active:scale-95"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden xl:inline">Publier</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="border-t border-gray-200 bg-white lg:hidden">
                    <div className="space-y-1 px-4 py-3">
                        {/* Search Mobile */}
                        <div className="mb-3">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="w-full rounded-lg bg-gray-100 py-2 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            const searchValue = (
                                                e.target as HTMLInputElement
                                            ).value;
                                            window.location.href = `/discover?search=${encodeURIComponent(searchValue)}`;
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {mainNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className="relative">
                                        <Icon className="h-5 w-5" />
                                        {item.badge && item.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                {item.badge > 9
                                                    ? '9+'
                                                    : item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {item.title}
                                    </span>
                                </Link>
                            );
                        })}

                        <Link
                            href={`/profile/${currentUser.id}`}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <User className="h-5 w-5" />
                            <span className="text-sm font-medium">
                                Mon Profil
                            </span>
                        </Link>

                        <Link
                            href="/create-post"
                            className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-2 text-white transition active:scale-95"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">
                                Créer une publication
                            </span>
                        </Link>

                        {/* Lien Dashboard mobile — visible uniquement pour admin, super-admin et modérateur */}
                        {hasAdminAccess && (
                            <div className="mt-4 border-t border-gray-200 pt-3">
                                <Link
                                    href={dashboardHref}
                                    className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 transition hover:bg-gray-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Grid className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                        Dashboard
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
