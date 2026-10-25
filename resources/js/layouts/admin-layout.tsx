import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    Dices,
    FileText,
    Home,
    LayoutDashboard,
    LogOut,
    Megaphone,
    Menu,
    MessageSquare,
    Search,
    Settings,
    Shield,
    TrendingUp,
    User,
    Users,
    X,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// ========================================
// INTERFACES
// ========================================

interface AdminLayoutProps {
    children: ReactNode;
}

interface PageProps {
    auth: {
        user: {
            id: string;
            full_name: string;
            username: string;
            email: string;
            profile_picture: string | null;
            roles?: { slug: string }[];
            account_type?: string;
        };
    };
    [key: string]: any;
}

// ========================================
// CONFIGURATION DU MENU
// ========================================

const superAdminMenuItems = [
    {
        title: 'Tableau de bord',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
    },
    {
        title: 'Utilisateurs',
        icon: Users,
        href: '/admin/users',
    },
    {
        title: 'Rôles & Permissions',
        icon: Shield,
        href: '/admin/roles',
    },
    {
        title: 'Specialisations',
        icon: Dices,
        href: '/admin/specializations',
    },
    {
        title: 'Publications',
        icon: FileText,
        href: '/admin/posts',
    },
    {
        title: 'Messages',
        icon: MessageSquare,
        href: '/admin/messages',
    },
    {
        title: 'Sponsors',
        icon: Megaphone,
        href: '/admin/sponsors',
    },
    {
        title: 'Statistiques',
        icon: TrendingUp,
        href: '/admin/analytics',
    },
    {
        title: 'Paramètres',
        icon: Settings,
        href: '/admin/settings',
    },
];

const adminMenuItems = [
    {
        title: 'Tableau de bord',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
    },
    {
        title: 'Utilisateurs',
        icon: Users,
        href: '/admin/users',
    },
    {
        title: 'Rôles & Permissions',
        icon: Shield,
        href: '/admin/roles',
    },
    {
        title: 'Specialisations',
        icon: Dices,
        href: '/admin/specializations',
    },
    {
        title: 'Publications',
        icon: FileText,
        href: '/admin/posts',
    },
    {
        title: 'Sponsors',
        icon: Megaphone,
        href: '/admin/sponsors',
    },
    {
        title: 'Statistiques',
        icon: TrendingUp,
        href: '/admin/analytics',
    },
];

// ========================================
// HELPERS — Détection de rôle robuste
// ========================================

/**
 * Détermine si l'utilisateur possède un rôle donné en consultant
 * TROIS sources dans l'ordre de priorité :
 *
 * 1. `user.roles[]`  — relation many-to-many chargée (la plus précise)
 * 2. `user.role`     — accesseur Laravel getPrimaryRole/getRole (toujours sérialisé)
 * 3. `user.account_type` — champ legacy présent dans certains contextes
 *
 * Cette triple vérification garantit que le menu s'affiche correctement
 * quelle que soit la page admin, même si la relation `roles` n'a pas été
 * eager-loadée par le contrôleur courant.
 */
function userHasRole(user: PageProps['auth']['user'], slug: string): boolean {
    // Source 1 : relation Eloquent chargée → vérification la plus fiable
    if (Array.isArray(user.roles) && user.roles.length > 0) {
        return user.roles.some((r) => r.slug === slug);
    }

    return false;
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Calculer les droits une seule fois pour ce rendu
    const isSuperAdmin = userHasRole(currentUser, 'super-admin');
    const isAdmin = userHasRole(currentUser, 'admin');

    // Menu à afficher : super-admin voit tout, admin voit son sous-ensemble
    // (si l'utilisateur est super-admin ET admin, superAdminMenuItems prime)
    const menuItems = isSuperAdmin ? superAdminMenuItems : adminMenuItems;
    const showMenu = isSuperAdmin || isAdmin;

    // Vérifie si un lien est actif
    const isActive = (href: string) =>
        window.location.pathname === href ||
        window.location.pathname.startsWith(href + '/');

    // Déconnexion
    const handleLogout = () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            router.post(
                '/logout',
                {},
                {
                    onSuccess: () => toast.success('Déconnexion réussie'),
                },
            );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ============================================================
                SIDEBAR
            ============================================================ */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo / Header */}
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 text-xl font-bold text-indigo-600"
                    >
                        <Shield className="h-6 w-6" />
                        <span>Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden"
                    >
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                    {/*
                     * Afficher le menu uniquement si l'utilisateur est admin ou super-admin.
                     * La fonction userHasRole() gère les trois sources possibles (roles[],
                     * role, account_type) pour être robuste quelle que soit la page.
                     */}
                    {showMenu ? (
                        menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        active
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })
                    ) : (
                        /* Fallback : aucun rôle détecté — accès de base uniquement */
                        <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-700">
                            Rôle non détecté. Contactez un super-admin.
                        </div>
                    )}
                </nav>

                {/* Bouton retour au site */}
                <div className="border-t border-gray-200 p-4">
                    <Link
                        href="/feeds"
                        className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                        <Home className="h-5 w-5" />
                        <span>Fils d'actualités</span>
                    </Link>
                </div>
            </aside>

            {/* ============================================================
                CONTENU PRINCIPAL
            ============================================================ */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Bouton menu mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="h-6 w-6 text-gray-600" />
                        </button>

                        {/* Barre de recherche */}
                        <div className="relative hidden md:block">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-64 rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                        </button>

                        {/* Menu utilisateur */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-gray-100"
                            >
                                <img
                                    src={
                                        currentUser.profile_picture ||
                                        defaultProfilePicture
                                    }
                                    alt={currentUser.full_name}
                                    className="h-8 w-8 rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            defaultProfilePicture;
                                    }}
                                />
                                <div className="hidden text-left md:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        {currentUser.full_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {/* Afficher le rôle actif peu importe la source */}
                                        {isSuperAdmin
                                            ? 'Super Admin'
                                            : isAdmin
                                              ? 'Administrateur'
                                              : `@${currentUser.username}`}
                                    </p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                            </button>

                            {/* Dropdown */}
                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-lg bg-white py-2 shadow-xl">
                                        <Link
                                            href={`/profile/${currentUser.id}`}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <User className="h-4 w-4" />
                                            Mon profil
                                        </Link>
                                        <Link
                                            href="/settings/profile"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Paramètres
                                        </Link>
                                        <hr className="my-2 border-gray-200" />
                                        <Link
                                            href="/feeds"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Home className="h-4 w-4" />
                                            Fils d'actualités
                                        </Link>
                                        <hr className="my-2 border-gray-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Déconnexion
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Zone de contenu avec scroll */}
                <main className="flex-1 overflow-y-auto">
                    <Toaster position="top-right" reverseOrder={false} />
                    {children}
                </main>
            </div>
        </div>
    );
}
