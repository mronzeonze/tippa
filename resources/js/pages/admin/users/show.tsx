import AdminLayout from '@/layouts/admin-layout';
import { router, usePage } from '@inertiajs/react';
import {
    Award,
    Ban,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    Shield,
    ShieldCheck,
    Trash2,
    UserCog,
    UserMinus,
    XCircle,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Role {
    id: string;
    name: string;
    slug: string;
    level: number;
}

interface Permission {
    id: string;
    name: string;
    slug: string;
}

interface User {
    id: string;
    full_name: string;
    username: string;
    email: string;
    profile_picture: string | null;
    cover_photo: string | null;
    bio: string | null;
    location: string | null;
    account_type: string;
    is_verified: boolean;
    is_expert: boolean;
    is_active: boolean;
    is_banned: boolean;
    banned_at: string | null;
    banned_by: string | null;
    ban_reason: string | null;
    created_at: string;
    email_verified_at: string | null;
    last_active_at: string | null;
    roles: Role[];
    permissions: Permission[];
}

export default function Show() {
    const { user, stats, recent_activity, roles } = usePage<any>().props;

    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);

    const [certificationNumber, setCertificationNumber] = useState('');
    const [yearsExperience, setYearsExperience] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('verified');
    const [rejectionReason, setRejectionReason] = useState('');
    const [promoteReason, setPromoteReason] = useState('');
    const [deleteReason, setDeleteReason] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    const handleVerify = () => {
        router.post(
            `/admin/users/${user.id}/verify-practitioner`,
            {
                verification_status: verificationStatus,
                rejection_reason: rejectionReason,
                certification_number: certificationNumber,
                years_of_experience: yearsExperience,
            },
            {
                onSuccess: () => {
                    toast.success('Vérification effectuée');
                    setShowVerifyModal(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handlePromote = () => {
        router.post(
            `/admin/users/${user.id}/promote-expert`,
            { reason: promoteReason },
            {
                onSuccess: () => {
                    toast.success("Promu au statut d'expert");
                    setShowPromoteModal(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handleToggleStatus = () => {
        const action = user.is_active ? 'désactiver' : 'activer';
        if (confirm(`Êtes-vous sûr de vouloir ${action} ce compte ?`)) {
            router.post(
                `/admin/users/${user.id}/toggle-active`,
                {},
                {
                    onSuccess: () => {
                        toast.success(`Compte ${action} avec succès`);
                    },
                },
            );
        }
    };

    const handleBan = () => {
        if (!banReason.trim()) {
            toast.error('Veuillez saisir une raison');
            return;
        }

        router.post(
            `/admin/users/${user.id}/ban`,
            { reason: banReason },
            {
                onSuccess: () => {
                    toast.success('Utilisateur banni');
                    setShowBanModal(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handleUnban = () => {
        if (confirm('Débannir cet utilisateur ?')) {
            router.post(
                `/admin/users/${user.id}/unban`,
                {},
                {
                    onSuccess: () => {
                        toast.success('Utilisateur débanni');
                    },
                },
            );
        }
    };

    const handleAssignRole = () => {
        if (!selectedRole) {
            toast.error('Sélectionnez un rôle');
            return;
        }

        router.post(
            `/admin/users/${user.id}/assign-role`,
            { role_slug: selectedRole },
            {
                onSuccess: () => {
                    toast.success('Rôle attribué');
                    setShowRoleModal(false);
                    setSelectedRole('');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handleRemoveRole = (roleId: string, roleName: string) => {
        if (confirm(`Retirer le rôle "${roleName}" ?`)) {
            router.delete(`/admin/users/${user.id}/remove-role/${roleId}`, {
                onSuccess: () => {
                    toast.success('Rôle retiré');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            });
        }
    };

    const handleDelete = () => {
        if (!confirmDelete || !deleteReason.trim()) {
            toast.error('Veuillez confirmer et saisir une raison');
            return;
        }

        router.delete(`/admin/users/${user.id}`, {
            data: { reason: deleteReason, confirm: confirmDelete },
            onSuccess: () => router.get('/admin/users'),
        });
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header avec profil */}
                    <div className="overflow-hidden rounded-xl bg-white shadow">
                        {/* Cover Photo */}
                        <div className="relative h-48 bg-gradient-to-r from-emerald-400 to-teal-500">
                            {user.cover_photo && (
                                <img
                                    src={user.cover_photo}
                                    alt="Cover"
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="relative px-6 pb-6">
                            {/* Photo de profil */}
                            <div className="absolute -top-16 left-6">
                                <img
                                    src={
                                        user.profile_picture ||
                                        defaultProfilePicture
                                    }
                                    alt={user.full_name}
                                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            defaultProfilePicture;
                                    }}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap justify-end gap-2 pt-4">
                                {/* Vérifier (si tradipraticien non vérifié) */}
                                {user.account_type === 'practitioner' &&
                                    !user.is_verified && (
                                        <button
                                            onClick={() =>
                                                setShowVerifyModal(true)
                                            }
                                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            Vérifier
                                        </button>
                                    )}

                                {/* Promouvoir Expert */}
                                {user.is_verified && !user.is_expert && (
                                    <button
                                        onClick={() =>
                                            setShowPromoteModal(true)
                                        }
                                        className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700"
                                    >
                                        <Award className="h-4 w-4" />
                                        Promouvoir Expert
                                    </button>
                                )}

                                {/* Gérer rôles */}
                                <button
                                    onClick={() => setShowRoleModal(true)}
                                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
                                >
                                    <UserCog className="h-4 w-4" />
                                    Gérer rôles
                                </button>

                                {/* Bannir/Débannir */}
                                {user.is_banned ? (
                                    <button
                                        onClick={handleUnban}
                                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        Débannir
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowBanModal(true)}
                                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                                    >
                                        <Ban className="h-4 w-4" />
                                        Bannir
                                    </button>
                                )}

                                {/* Activer/Désactiver */}
                                <button
                                    onClick={handleToggleStatus}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white transition ${
                                        user.is_active
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {user.is_active ? (
                                        <>
                                            <XCircle className="h-4 w-4" />
                                            Désactiver
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            Activer
                                        </>
                                    )}
                                </button>

                                {/* Supprimer */}
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                </button>
                            </div>

                            {/* Informations utilisateur */}
                            <div className="mt-16">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {user.full_name}
                                    </h1>
                                </div>
                                <p className="text-gray-600">
                                    @{user.username}
                                </p>

                                {/* Badges de statut */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {user.is_banned && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                                            <Ban className="h-4 w-4" />
                                            Banni depuis{' '}
                                            {moment(user.banned_at).format(
                                                'DD/MM/YYYY',
                                            )}
                                        </span>
                                    )}
                                    {!user.is_active && !user.is_banned && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                                            <XCircle className="h-4 w-4" />
                                            Inactif
                                        </span>
                                    )}
                                    {user.is_verified && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                            <ShieldCheck className="h-4 w-4" />
                                            Vérifié
                                        </span>
                                    )}
                                    {user.is_expert && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                                            <Award className="h-4 w-4" />
                                            Expert
                                        </span>
                                    )}
                                    {user.email_verified_at && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                            <Mail className="h-4 w-4" />
                                            Email vérifié
                                        </span>
                                    )}
                                </div>

                                {/* Ban reason */}
                                {user.is_banned && user.ban_reason && (
                                    <div className="mt-4 rounded-lg bg-red-50 p-4">
                                        <p className="text-sm font-medium text-red-800">
                                            Raison du bannissement:
                                        </p>
                                        <p className="text-sm text-red-700">
                                            {user.ban_reason}
                                        </p>
                                    </div>
                                )}

                                {/* Bio */}
                                {user.bio && (
                                    <p className="mt-4 text-gray-700">
                                        {user.bio}
                                    </p>
                                )}

                                {/* Informations supplémentaires */}
                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    {user.location && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            Inscrit le{' '}
                                            {moment(user.created_at).format(
                                                'DD/MM/YYYY',
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Rôles et Permissions */}
                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Rôles */}
                                    <div className="rounded-lg bg-indigo-50 p-4">
                                        <div className="mb-3 flex items-center gap-2 text-indigo-900">
                                            <Shield className="h-5 w-5" />
                                            <h3 className="font-semibold">
                                                Rôles ({user.roles.length})
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.length > 0 ? (
                                                user.roles.map((role: Role) => (
                                                    <span
                                                        key={role.id}
                                                        className="group relative inline-flex items-center gap-1 rounded-full bg-indigo-200 px-3 py-1 text-sm font-medium text-indigo-900"
                                                    >
                                                        {role.name} (Niv.{' '}
                                                        {role.level})
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveRole(
                                                                    role.id,
                                                                    role.name,
                                                                )
                                                            }
                                                            className="ml-1 hidden text-red-600 group-hover:inline hover:text-red-800"
                                                            title="Retirer"
                                                        >
                                                            <UserMinus className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-indigo-700">
                                                    Aucun rôle
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Permissions */}
                                    <div className="rounded-lg bg-green-50 p-4">
                                        <div className="mb-3 flex items-center gap-2 text-green-900">
                                            <ShieldCheck className="h-5 w-5" />
                                            <h3 className="font-semibold">
                                                Permissions directes (
                                                {user.permissions.length})
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {user.permissions.length > 0 ? (
                                                user.permissions.map(
                                                    (
                                                        permission: Permission,
                                                    ) => (
                                                        <span
                                                            key={permission.id}
                                                            className="rounded-full bg-green-200 px-3 py-1 text-xs font-medium text-green-900"
                                                        >
                                                            {permission.name}
                                                        </span>
                                                    ),
                                                )
                                            ) : (
                                                <span className="text-sm text-green-700">
                                                    Aucune permission directe
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques et Activité */}
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Statistiques */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                Statistiques
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stats.posts_count}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Publications
                                    </p>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4">
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.followers_count}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Abonnés
                                    </p>
                                </div>
                                <div className="rounded-lg bg-purple-50 p-4">
                                    <p className="text-2xl font-bold text-purple-600">
                                        {stats.following_count}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Abonnements
                                    </p>
                                </div>
                                <div className="rounded-lg bg-orange-50 p-4">
                                    <p className="text-2xl font-bold text-orange-600">
                                        {stats.rating > 0
                                            ? `${stats.rating.toFixed(1)}/5`
                                            : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Note moyenne
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Activité récente */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                Activité récente
                            </h2>
                            <div className="max-h-96 space-y-3 overflow-y-auto">
                                {recent_activity &&
                                recent_activity.length > 0 ? (
                                    recent_activity.map((log: any) => (
                                        <div
                                            key={log.id}
                                            className="rounded-lg border border-gray-200 p-3"
                                        >
                                            <p className="text-sm font-medium text-gray-900">
                                                {log.action}
                                            </p>
                                            {log.description && (
                                                <p className="text-sm text-gray-600">
                                                    {log.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                {moment(
                                                    log.created_at,
                                                ).fromNow()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">
                                        Aucune activité récente
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODALS */}

                {/* Modal Vérification */}
                {showVerifyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                Vérifier le tradipraticien
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Statut vérification
                                    </label>
                                    <select
                                        value={verificationStatus}
                                        onChange={(e) =>
                                            setVerificationStatus(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                    >
                                        <option value="verified">
                                            Vérifié
                                        </option>
                                        <option value="rejected">Rejeté</option>
                                    </select>
                                </div>

                                {verificationStatus === 'rejected' && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Raison du rejet *
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) =>
                                                setRejectionReason(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                            placeholder="Ex: Documents invalides"
                                            rows={3}
                                        />
                                    </div>
                                )}

                                {verificationStatus === 'verified' && (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Numéro de certification
                                            </label>
                                            <input
                                                type="text"
                                                value={certificationNumber}
                                                onChange={(e) =>
                                                    setCertificationNumber(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                                placeholder="Ex: CERT-2024-001"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Années d'expérience
                                            </label>
                                            <input
                                                type="number"
                                                value={yearsExperience}
                                                onChange={(e) =>
                                                    setYearsExperience(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                                placeholder="Ex: 10"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleVerify}
                                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-white transition hover:bg-emerald-700"
                                >
                                    Confirmer
                                </button>
                                <button
                                    onClick={() => setShowVerifyModal(false)}
                                    className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Promotion Expert */}
                {showPromoteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                Promouvoir au statut d'Expert
                            </h2>

                            <textarea
                                value={promoteReason}
                                onChange={(e) =>
                                    setPromoteReason(e.target.value)
                                }
                                placeholder="Raison de la promotion..."
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                            />

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handlePromote}
                                    disabled={!promoteReason.trim()}
                                    className="flex-1 rounded-lg bg-purple-600 py-2 text-white transition hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Promouvoir
                                </button>
                                <button
                                    onClick={() => setShowPromoteModal(false)}
                                    className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Bannissement */}
                {showBanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-4 text-xl font-bold text-red-600">
                                ⚠️ Bannir {user.full_name}
                            </h2>

                            <p className="mb-4 text-sm text-gray-600">
                                Cette action empêchera l'utilisateur d'accéder à
                                son compte.
                            </p>

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
                {showRoleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                Attribuer un rôle
                            </h2>

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Rôles actuels
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.length > 0 ? (
                                        user.roles.map((role: Role) => (
                                            <span
                                                key={role.id}
                                                className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
                                            >
                                                {role.name}
                                                <button
                                                    onClick={() =>
                                                        handleRemoveRole(
                                                            role.id,
                                                            role.name,
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <UserMinus className="h-3 w-3" />
                                                </button>
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
                                    {roles?.map((role: Role) => {
                                        const hasRole = user.roles.some(
                                            (r: Role) => r.id === role.id,
                                        );
                                        return (
                                            <option
                                                key={role.id}
                                                value={role.slug}
                                                disabled={hasRole}
                                            >
                                                {role.name} (Niveau {role.level}
                                                )
                                                {hasRole
                                                    ? ' - Déjà attribué'
                                                    : ''}
                                            </option>
                                        );
                                    })}
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
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 transition hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Suppression */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-4 text-xl font-bold text-red-600">
                                ⚠️ Supprimer l'utilisateur
                            </h2>

                            <div className="mb-4 rounded-lg bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">
                                    ⚠️ Action irréversible
                                </p>
                                <p className="text-sm text-red-700">
                                    Toutes les données de l'utilisateur seront
                                    supprimées définitivement :
                                </p>
                                <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                                    <li>Profil et informations personnelles</li>
                                    <li>Publications et commentaires</li>
                                    <li>Messages et conversations</li>
                                    <li>Connexions et abonnements</li>
                                </ul>
                            </div>

                            <textarea
                                value={deleteReason}
                                onChange={(e) =>
                                    setDeleteReason(e.target.value)
                                }
                                placeholder="Raison de la suppression (obligatoire)..."
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                            />

                            <label className="mt-4 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={confirmDelete}
                                    onChange={(e) =>
                                        setConfirmDelete(e.target.checked)
                                    }
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">
                                    Je confirme vouloir supprimer définitivement
                                    ce compte
                                </span>
                            </label>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={
                                        !confirmDelete || !deleteReason.trim()
                                    }
                                    className="flex-1 rounded-lg bg-red-600 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                    Supprimer définitivement
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteReason('');
                                        setConfirmDelete(false);
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
