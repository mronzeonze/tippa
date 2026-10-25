import AdminLayout from '@/layouts/admin-layout';
import { router, usePage } from '@inertiajs/react';
import {
    Award,
    Ban,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Filter,
    Search,
    ShieldCheck,
    UserCheck,
    UserCog,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Role {
    id: string;
    name: string;
    slug: string;
    level: number;
}

interface User {
    id: string;
    full_name: string;
    username: string;
    email: string;
    profile_picture: string | null;
    account_type: 'user' | 'practitioner' | 'expert';
    is_verified: boolean;
    is_expert: boolean;
    is_active: boolean;
    is_banned: boolean;
    banned_at: string | null;
    ban_reason: string | null;
    created_at: string;
    last_active_at: string | null;
    posts_count: number;
    followers_count: number;
    following_count: number;
    roles: Role[];
    primary_role: { name: string; slug: string } | null;
}

export default function Index() {
    const { users, stats, filters, roles } = usePage<any>().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [accountType, setAccountType] = useState(filters?.account_type || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');

    // Modals
    const [showBanModal, setShowBanModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [banReason, setBanReason] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    const handleFilter = () => {
        router.get(
            '/admin/users',
            {
                search,
                account_type: accountType,
                status,
                role: roleFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        setAccountType('');
        setStatus('');
        setRoleFilter('');
        router.get('/admin/users');
    };

    const handleExport = () => {
        window.location.href = `/admin/users/export?account_type=${accountType}`;
    };

    // Bannir un utilisateur
    const handleBan = () => {
        if (!selectedUser || !banReason.trim()) {
            toast.error('Veuillez saisir une raison');
            return;
        }

        router.post(
            `/admin/users/${selectedUser.id}/ban`,
            { reason: banReason },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Utilisateur banni avec succès');
                    setShowBanModal(false);
                    setBanReason('');
                    setSelectedUser(null);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    // Débannir un utilisateur
    const handleUnban = (user: User) => {
        if (confirm(`Débannir ${user.full_name} ?`)) {
            router.post(
                `/admin/users/${user.id}/unban`,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Utilisateur débanni');
                    },
                },
            );
        }
    };

    // Toggle statut actif
    const handleToggleStatus = (user: User) => {
        const action = user.is_active ? 'désactiver' : 'activer';
        if (confirm(`${action} le compte de ${user.full_name} ?`)) {
            router.patch(
                `/admin/users/${user.id}/toggle-active`,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Compte ${action} avec succès`);
                    },
                },
            );
        }
    };

    // Assigner un rôle
    const handleAssignRole = () => {
        if (!selectedUser || !selectedRole) {
            toast.error('Veuillez sélectionner un rôle');
            return;
        }

        router.post(
            `/admin/users/${selectedUser.id}/assign-role`,
            { role_slug: selectedRole },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Rôle attribué avec succès');
                    setShowRoleModal(false);
                    setSelectedRole('');
                    setSelectedUser(null);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    // Retirer un rôle
    const handleRemoveRole = (user: User, role: Role) => {
        if (confirm(`Retirer le rôle "${role.name}" de ${user.full_name} ?`)) {
            router.delete(`/admin/users/${user.id}/remove-role/${role.id}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Rôle retiré');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            });
        }
    };

    const getStatusBadge = (user: User) => {
        if (user.is_banned) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                    <Ban className="h-3 w-3" />
                    Banni
                </span>
            );
        }
        if (!user.is_active) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                    <XCircle className="h-3 w-3" />
                    Inactif
                </span>
            );
        }
        if (user.account_type === 'practitioner' && !user.is_verified) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                    <Clock className="h-3 w-3" />
                    En attente
                </span>
            );
        }
        if (user.is_verified) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    <ShieldCheck className="h-3 w-3" />
                    Vérifié
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                <CheckCircle className="h-3 w-3" />
                Actif
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestion des Utilisateurs
                        </h1>
                        <p className="text-gray-600">
                            Administrez les comptes, rôles et permissions
                        </p>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div className="rounded-lg bg-white p-4 shadow">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-3">
                                    <UserCheck className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.total}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Total utilisateurs
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-3">
                                    <ShieldCheck className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.practitioners}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Tradipraticiens
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Award className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.experts}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Experts
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-emerald-100 p-3">
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.verified}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Vérifiés
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-4 shadow">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-orange-100 p-3">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.pending}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        En attente
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex items-center gap-2 text-gray-700">
                            <Filter className="h-5 w-5" />
                            <h2 className="font-semibold">Filtres</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {/* Recherche */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Recherche
                                </label>
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Nom, email, username..."
                                        className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Type de compte */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Type de compte
                                </label>
                                <select
                                    value={accountType}
                                    onChange={(e) =>
                                        setAccountType(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                >
                                    <option value="">Tous les types</option>
                                    <option value="user">Utilisateur</option>
                                    <option value="practitioner">
                                        Tradipraticien
                                    </option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>

                            {/* Rôle */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Rôle
                                </label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) =>
                                        setRoleFilter(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                >
                                    <option value="">Tous les rôles</option>
                                    {roles?.map((role: Role) => (
                                        <option key={role.id} value={role.slug}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Statut */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Statut
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="active">Actif</option>
                                    <option value="inactive">Inactif</option>
                                    <option value="banned">Banni</option>
                                    <option value="verified">Vérifié</option>
                                    <option value="pending">
                                        En attente de vérification
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Boutons */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="rounded-lg bg-emerald-600 px-6 py-2 text-white transition hover:bg-emerald-700"
                            >
                                Appliquer
                            </button>
                            <button
                                onClick={handleReset}
                                className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50"
                            >
                                Réinitialiser
                            </button>
                            <button
                                onClick={handleExport}
                                className="ml-auto flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50"
                            >
                                <Download className="h-4 w-4" />
                                Exporter CSV
                            </button>
                        </div>
                    </div>

                    {/* Liste des utilisateurs */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Utilisateur
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Rôles
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Statistiques
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.data.map((user: User) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={
                                                        user.profile_picture ||
                                                        defaultProfilePicture
                                                    }
                                                    alt={user.full_name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            defaultProfilePicture;
                                                    }}
                                                />
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">
                                                        {user.full_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        @{user.username}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                {user.account_type ===
                                                'practitioner'
                                                    ? 'Tradipraticien'
                                                    : user.account_type ===
                                                        'expert'
                                                      ? 'Expert'
                                                      : 'Utilisateur'}
                                            </span>
                                            {user.is_expert && (
                                                <div className="mt-1">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
                                                        <Award className="h-3 w-3" />
                                                        Expert
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <span
                                                        key={role.id}
                                                        className="group relative inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800"
                                                    >
                                                        {role.name}
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveRole(
                                                                    user,
                                                                    role,
                                                                )
                                                            }
                                                            className="ml-1 hidden text-red-600 group-hover:inline hover:text-red-800"
                                                            title="Retirer ce rôle"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(user)}
                                            {user.is_banned &&
                                                user.ban_reason && (
                                                    <div className="mt-1 text-xs text-red-600">
                                                        {user.ban_reason}
                                                    </div>
                                                )}
                                        </td>

                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                            <div className="space-y-1">
                                                <div>
                                                    {user.posts_count || 0}{' '}
                                                    posts
                                                </div>
                                                <div>
                                                    {user.followers_count || 0}{' '}
                                                    abonnés
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                {/* Voir détails */}
                                                <button
                                                    onClick={() =>
                                                        router.get(
                                                            `/admin/users/${user.id}`,
                                                        )
                                                    }
                                                    className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                                                    title="Voir détails"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                {/* Gérer rôles */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowRoleModal(true);
                                                    }}
                                                    className="rounded-lg bg-indigo-100 p-2 text-indigo-600 transition hover:bg-indigo-200"
                                                    title="Gérer les rôles"
                                                >
                                                    <UserCog className="h-4 w-4" />
                                                </button>

                                                {/* Bannir/Débannir */}
                                                {user.is_banned ? (
                                                    <button
                                                        onClick={() =>
                                                            handleUnban(user)
                                                        }
                                                        className="rounded-lg bg-green-100 p-2 text-green-600 transition hover:bg-green-200"
                                                        title="Débannir"
                                                    >
                                                        <ShieldCheck className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                user,
                                                            );
                                                            setShowBanModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                                                        title="Bannir"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {/* Toggle actif */}
                                                <button
                                                    onClick={() =>
                                                        handleToggleStatus(user)
                                                    }
                                                    className={`rounded-lg p-2 transition ${
                                                        user.is_active
                                                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                                            : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                    }`}
                                                    title={
                                                        user.is_active
                                                            ? 'Désactiver'
                                                            : 'Activer'
                                                    }
                                                >
                                                    {user.is_active ? (
                                                        <XCircle className="h-4 w-4" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4" />
                                                    )}
                                                </button>

                                                {/* Profil public */}
                                                <button
                                                    onClick={() =>
                                                        router.get(
                                                            `/profile/${user.id}`,
                                                        )
                                                    }
                                                    className="rounded-lg bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
                                                    title="Voir profil public"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Page{' '}
                                            <span className="font-medium">
                                                {users.current_page}
                                            </span>{' '}
                                            sur{' '}
                                            <span className="font-medium">
                                                {users.last_page}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                router.get(
                                                    `/admin/users?page=${users.current_page - 1}`,
                                                )
                                            }
                                            disabled={users.current_page === 1}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            onClick={() =>
                                                router.get(
                                                    `/admin/users?page=${users.current_page + 1}`,
                                                )
                                            }
                                            disabled={
                                                users.current_page ===
                                                users.last_page
                                            }
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Bannissement */}
                {showBanModal && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-4 text-xl font-bold text-red-600">
                                ⚠️ Bannir {selectedUser.full_name}
                            </h2>

                            <textarea
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Raison du bannissement (obligatoire)..."
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                            />

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleBan}
                                    disabled={!banReason.trim()}
                                    className="flex-1 rounded-lg bg-red-600 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    Bannir
                                </button>
                                <button
                                    onClick={() => {
                                        setShowBanModal(false);
                                        setBanReason('');
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Attribution Rôle */}
                {showRoleModal && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                Attribuer un rôle à {selectedUser.full_name}
                            </h2>

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Rôles actuels
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.roles.length > 0 ? (
                                        selectedUser.roles.map((role) => (
                                            <span
                                                key={role.id}
                                                className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
                                            >
                                                {role.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            Aucun rôle attribué
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Sélectionner un nouveau rôle
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) =>
                                        setSelectedRole(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                >
                                    <option value="">
                                        -- Choisir un rôle --
                                    </option>
                                    {roles?.map((role: Role) => (
                                        <option key={role.id} value={role.slug}>
                                            {role.name} (Niveau {role.level})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleAssignRole}
                                    disabled={!selectedRole}
                                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Attribuer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRoleModal(false);
                                        setSelectedRole('');
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
