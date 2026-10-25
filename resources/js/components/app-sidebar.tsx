import { NavUser } from '@/components/nav-user';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { type NavItem } from '@/types';
import { User } from '@/types/user';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CirclePlus,
    Home,
    MessageCircle,
    Search,
    UserIcon,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';
import { bgGradient } from './assets/assets';

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth?.user;

    // Hook pour les notifications
    const { unreadCount, notifications, isConnected } =
        useMessageNotifications();

    const mainNavItems: NavItem[] = [
        {
            title: "Fil d'actualité",
            href: '/feeds',
            icon: Home,
        },
        {
            title: 'Connections',
            href: '/connections',
            icon: Users,
        },
        {
            title: 'Discover',
            href: '/discover',
            icon: Search,
        },
        {
            title: 'Profile',
            href: currentUser ? `/profile/${currentUser.id}` : '/profile',
            icon: UserIcon,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* ========================================
                HEADER - Logo + Indicateur de connexion
                ======================================== */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href="/feeds"
                                className="flex items-center gap-2"
                            >
                                <AppLogo />
                                {/* Indicateur de connexion discret */}
                                <span
                                    className={`ml-auto h-2 w-2 rounded-full ${
                                        isConnected
                                            ? 'bg-green-500'
                                            : 'bg-gray-300'
                                    }`}
                                    title={
                                        isConnected
                                            ? 'Connecté aux notifications'
                                            : 'Déconnecté'
                                    }
                                />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ========================================
                CONTENT - Navigation avec badges
                ======================================== */}
            <SidebarContent>
                {/* Premier item de navigation */}
                <div className="space-y-1 px-3 py-2">
                    <Link
                        href="/feeds"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        <Home className="h-5 w-5" />
                        <span>Fil d'actualité</span>
                    </Link>

                    {/* ========================================
                        MESSAGES avec badge intégré
                        ======================================== */}
                    <Link
                        href="/messages"
                        className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        <div className="relative">
                            <MessageCircle className="h-5 w-5" />

                            {/* Badge de compteur sur l'icône */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>

                        <span>Messages</span>

                        {/* Badge de compteur (version texte) */}
                        {unreadCount > 0 && (
                            <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </Link>

                    {/* ========================================
                        CENTRE DE NOTIFICATIONS (avec DropdownMenu)
                        ======================================== */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
                                <div className="relative">
                                    <Bell className="h-5 w-5" />

                                    {/* Badge si notifications */}
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                                    )}
                                </div>

                                <span>Notifications</span>

                                {unreadCount > 0 && (
                                    <span className="ml-auto text-xs text-gray-500">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-80"
                            align="end"
                            side="right"
                            sideOffset={8}
                        >
                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                                <p className="text-sm font-semibold text-gray-900">
                                    Notifications récentes
                                </p>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-gray-500">
                                        {unreadCount} nouveau
                                        {unreadCount > 1 ? 'x' : ''} message
                                        {unreadCount > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            {notifications && notifications.length > 0 ? (
                                <>
                                    <div className="max-h-[400px] overflow-y-auto py-1">
                                        {notifications
                                            .slice(0, 5)
                                            .map((notif, index) => (
                                                <DropdownMenuItem
                                                    key={`${notif.sender?.id}-${index}`}
                                                    asChild
                                                    className="cursor-pointer"
                                                >
                                                    <Link
                                                        href={`/messages/${notif.sender?.id || ''}`}
                                                        className="flex items-start gap-3 px-4 py-3 transition hover:bg-gray-50"
                                                    >
                                                        <img
                                                            src={
                                                                notif.sender
                                                                    ?.profile_picture ||
                                                                'http://localhost:8000/storage/images/default-avatar.jpg'
                                                            }
                                                            alt={
                                                                notif.sender
                                                                    ?.full_name ||
                                                                'User'
                                                            }
                                                            className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    'http://localhost:8000/storage/images/default-avatar.jpg';
                                                            }}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                                {notif.sender
                                                                    ?.full_name ||
                                                                    'Utilisateur'}
                                                            </p>
                                                            <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                                                                {notif.message
                                                                    ?.message_type ===
                                                                'image'
                                                                    ? '📷 Photo'
                                                                    : notif
                                                                          .message
                                                                          ?.text ||
                                                                      'Nouveau message'}
                                                            </p>
                                                            {notif.message
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
                                                </DropdownMenuItem>
                                            ))}
                                    </div>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/messages"
                                            className="flex w-full cursor-pointer items-center justify-center py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                                        >
                                            Voir tous les messages
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <div className="px-4 py-12 text-center">
                                    <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                    <p className="text-sm font-medium text-gray-900">
                                        Aucune notification
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Vos nouveaux messages apparaîtront ici
                                    </p>
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Autres items */}
                    <Link
                        href="/connections"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        <Users className="h-5 w-5" />
                        <span>Connections</span>
                    </Link>

                    <Link
                        href="/discover"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        <Search className="h-5 w-5" />
                        <span>Discover</span>
                    </Link>

                    <Link
                        href={
                            currentUser
                                ? `/profile/${currentUser.id}`
                                : '/profile'
                        }
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        <UserIcon className="h-5 w-5" />
                        <span>Profile</span>
                    </Link>
                </div>

                {/* Séparateur */}
                <div className="my-2 border-t border-gray-200" />

                {/* Bouton Create Post */}
                <Link
                    href="/create-post"
                    className={`mx-6 flex cursor-pointer items-center justify-center gap-2 rounded-lg ${bgGradient} py-2.5 text-white transition active:scale-95`}
                >
                    <CirclePlus className="h-5 w-5" />
                    Create Post
                </Link>

                {/* Liens dashboard selon rôle */}
                {(currentUser.role.name === 'moderator' ||
                    currentUser.role.name === 'admin' ||
                    currentUser.role.name === 'super-admin') && (
                    <div className="mt-4 border-t border-gray-200 p-4">
                        <Link
                            href={
                                currentUser.role.name === 'moderator'
                                    ? '/moderator/dashboard'
                                    : '/admin/dashboard'
                            }
                            className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                        >
                            <Home className="h-5 w-5" />
                            <span>Retour au Dashboard</span>
                        </Link>
                    </div>
                )}
            </SidebarContent>

            {/* ========================================
                FOOTER - User info
                ======================================== */}
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
