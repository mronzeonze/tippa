import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    ChevronDown,
    FileText,
    Flag,
    Home,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    Search,
    Settings,
    Shield,
    TrendingUp,
    User,
    X,
} from 'lucide-react';
import { ReactNode, useState } from 'react';

// ========================================
// INTERFACES
// ========================================

interface ModeratorLayoutProps {
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
        };
    };
    [key: string]: any;
}

// ========================================
// CONFIGURATION DU MENU - ALIGNÉ AVEC ModeratorController
// ========================================

const menuItems = [
    {
        title: 'Tableau de bord',
        icon: LayoutDashboard,
        href: '/moderator/dashboard',
        active: ['moderator', 'moderator.dashboard'],
        description: "Vue d'ensemble des statistiques de modération",
    },
    {
        title: 'Signalements',
        icon: Flag,
        href: '/moderator/reports',
        active: ['moderator.reports', 'moderator.reports.show'],
        description: "Gérer les signalements d'utilisateurs",
        badge: true, // Affiche le nombre de signalements en attente
    },
    {
        title: 'Publications',
        icon: FileText,
        href: '/moderator/posts',
        active: ['moderator.posts'],
        description: 'Modération des publications',
    },
    {
        title: 'Commentaires',
        icon: MessageSquare,
        href: '/moderator/comments',
        active: ['moderator.comments'],
        description: 'Modération des commentaires',
    },
    {
        title: 'Statistiques',
        icon: TrendingUp,
        href: '/moderator/statistics',
        active: ['moderator.statistics'],
    },
];

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export default function ModeratorLayout({ children }: ModeratorLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // État pour les compteurs (à récupérer depuis le backend)
    const [pendingReports, setPendingReports] = useState(0);

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Vérifier si un lien est actif
    const isActive = (href: string) => {
        return (
            window.location.pathname === href ||
            window.location.pathname.startsWith(href + '/')
        );
    };

    // Déconnexion
    const handleLogout = () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            router.post('/logout', {});
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Overlay pour mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo / Header */}
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xl font-bold text-indigo-600"
                    >
                        <Shield className="h-6 w-6" />
                        <span>Modération</span>
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
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                                    active
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                title={item.description}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="flex-1">{item.title}</span>

                                {/* Badge pour les signalements en attente */}
                                {item.badge && pendingReports > 0 && (
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                                        {pendingReports > 99
                                            ? '99+'
                                            : pendingReports}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Section Aide */}
                <div className="border-t border-gray-200 p-4">
                    <div className="mb-4 rounded-lg bg-blue-50 p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-blue-600" />
                            <div className="text-xs text-blue-800">
                                <p className="font-medium">
                                    Guide de modération
                                </p>
                                <p className="mt-1 text-blue-600">
                                    Consultez les règles de modération
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bouton retour au site */}
                    <Link
                        href="/feeds"
                        className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                        <Home className="h-5 w-5" />
                        <span>Fils d'actualités</span>
                    </Link>
                </div>
            </aside>

            {/* Contenu principal */}
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
                                placeholder="Rechercher utilisateur, publication..."
                                className="w-80 rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100">
                            <Bell className="h-5 w-5" />
                            {pendingReports > 0 && (
                                <span className="absolute top-1 right-1 flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                                </span>
                            )}
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
                                        Modérateur
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
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
