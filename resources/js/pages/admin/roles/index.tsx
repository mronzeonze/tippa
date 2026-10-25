// import AdminLayout from '@/layouts/admin-layout';
// import { PageProps, Permission, Role } from '@/types/role';
// import { router, usePage } from '@inertiajs/react';
// import {
//     AlertCircle,
//     Edit,
//     Key,
//     Loader2,
//     Plus,
//     Search,
//     Shield,
//     ShieldAlert,
//     ShieldCheck,
//     Trash2,
//     X,
// } from 'lucide-react';
// import { useState } from 'react';

// export default function Index() {
//     const { roles, permissions, auth } = usePage<PageProps>().props;

//     const currentUser = auth.user;

//     // États principaux
//     const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>(
//         'roles',
//     );
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // États pour les rôles
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showPermissionsModal, setShowPermissionsModal] = useState(false);
//     const [selectedRole, setSelectedRole] = useState<Role | null>(null);
//     const [formData, setFormData] = useState({
//         name: '',
//         slug: '',
//         description: '',
//         level: 20,
//         permissions: [] as string[],
//     });

//     // États pour les permissions
//     const [showCreatePermModal, setShowCreatePermModal] = useState(false);
//     const [showEditPermModal, setShowEditPermModal] = useState(false);
//     const [selectedPermission, setSelectedPermission] =
//         useState<Permission | null>(null);
//     const [permFormData, setPermFormData] = useState({
//         name: '',
//         slug: '',
//         description: '',
//         group: '',
//     });

//     // ========================================
//     // FONCTIONS UTILITAIRES
//     // ========================================

//     const resetForm = () => {
//         setFormData({
//             name: '',
//             slug: '',
//             description: '',
//             level: 20,
//             permissions: [],
//         });
//     };

//     const resetPermForm = () => {
//         setPermFormData({
//             name: '',
//             slug: '',
//             description: '',
//             group: '',
//         });
//     };

//     const generateSlug = (name: string) => {
//         return name
//             .toLowerCase()
//             .normalize('NFD')
//             .replace(/[\u0300-\u036f]/g, '')
//             .replace(/[^a-z0-9]+/g, '-')
//             .replace(/^-|-$/g, '');
//     };

//     const getLevelColor = (level: number) => {
//         if (level >= 80)
//             return 'bg-purple-100 text-purple-800 border-purple-300';
//         if (level >= 60) return 'bg-red-100 text-red-800 border-red-300';
//         if (level >= 40)
//             return 'bg-orange-100 text-orange-800 border-orange-300';
//         return 'bg-blue-100 text-blue-800 border-blue-300';
//     };

//     const getLevelIcon = (level: number) => {
//         if (level >= 80) return <ShieldCheck className="h-5 w-5" />;
//         if (level >= 60) return <Shield className="h-5 w-5" />;
//         return <ShieldAlert className="h-5 w-5" />;
//     };

//     // Filtrage
//     const filteredRoles = roles.filter(
//         (role) =>
//             role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             role.slug.toLowerCase().includes(searchTerm.toLowerCase()),
//     );

//     const filteredPermissions = Object.entries(permissions).reduce(
//         (acc, [group, perms]) => {
//             const filtered = perms.filter(
//                 (p) =>
//                     p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                     p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                     group.toLowerCase().includes(searchTerm.toLowerCase()),
//             );
//             if (filtered.length > 0) {
//                 acc[group] = filtered;
//             }
//             return acc;
//         },
//         {} as Record<string, Permission[]>,
//     );

//     // ========================================
//     // HANDLERS POUR LES RÔLES
//     // ========================================

//     const handleOpenCreate = () => {
//         resetForm();
//         setShowCreateModal(true);
//     };

//     const handleOpenEdit = (role: Role) => {
//         setSelectedRole(role);
//         setFormData({
//             name: role.name,
//             slug: role.slug,
//             description: role.description || '',
//             level: role.level,
//             permissions: role.permissions,
//         });
//         setShowEditModal(true);
//     };

//     const handleOpenPermissions = (role: Role) => {
//         setSelectedRole(role);
//         setFormData({
//             ...formData,
//             permissions: role.permissions,
//         });
//         setShowPermissionsModal(true);
//     };

//     const handleCreate = (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         router.post('/admin/roles', formData, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 setShowCreateModal(false);
//                 resetForm();
//             },
//             onFinish: () => setIsSubmitting(false),
//         });
//     };

//     const handleUpdate = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!selectedRole) return;
//         setIsSubmitting(true);

//         router.put(`/admin/roles/${selectedRole.id}`, formData, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 setShowEditModal(false);
//                 setSelectedRole(null);
//                 resetForm();
//             },
//             onFinish: () => setIsSubmitting(false),
//         });
//     };

//     const handleSyncPermissions = () => {
//         if (!selectedRole) return;
//         setIsSubmitting(true);

//         router.post(
//             `/admin/roles/${selectedRole.id}/permissions`,
//             { permissions: formData.permissions },
//             {
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     setShowPermissionsModal(false);
//                     setSelectedRole(null);
//                 },
//                 onFinish: () => setIsSubmitting(false),
//             },
//         );
//     };

//     const handleDelete = (role: Role) => {
//         if (['super-admin', 'admin', 'user'].includes(role.slug)) {
//             alert('Les rôles système ne peuvent pas être supprimés');
//             return;
//         }
//         if (!confirm(`Supprimer le rôle "${role.name}" ?`)) return;

//         router.delete(`/admin/roles/${role.id}`, {
//             preserveScroll: true,
//         });
//     };

//     const togglePermission = (permSlug: string) => {
//         setFormData({
//             ...formData,
//             permissions: formData.permissions.includes(permSlug)
//                 ? formData.permissions.filter((p) => p !== permSlug)
//                 : [...formData.permissions, permSlug],
//         });
//     };

//     const toggleGroup = (groupPerms: Permission[]) => {
//         const groupSlugs = groupPerms.map((p) => p.slug);
//         const allSelected = groupSlugs.every((slug) =>
//             formData.permissions.includes(slug),
//         );

//         setFormData({
//             ...formData,
//             permissions: allSelected
//                 ? formData.permissions.filter((p) => !groupSlugs.includes(p))
//                 : [...new Set([...formData.permissions, ...groupSlugs])],
//         });
//     };

//     // ========================================
//     // HANDLERS POUR LES PERMISSIONS
//     // ========================================

//     const handleOpenCreatePerm = () => {
//         resetPermForm();
//         setShowCreatePermModal(true);
//     };

//     const handleOpenEditPerm = (perm: Permission) => {
//         setSelectedPermission(perm);
//         setPermFormData({
//             name: perm.name,
//             slug: perm.slug,
//             description: perm.description || '',
//             group: perm.group,
//         });
//         setShowEditPermModal(true);
//     };

//     const handleCreatePerm = (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         router.post('/admin/permissions', permFormData, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 setShowCreatePermModal(false);
//                 resetPermForm();
//             },
//             onFinish: () => setIsSubmitting(false),
//         });
//     };

//     const handleUpdatePerm = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!selectedPermission) return;
//         setIsSubmitting(true);

//         router.put(
//             `/admin/permissions/${selectedPermission.id}`,
//             permFormData,
//             {
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     setShowEditPermModal(false);
//                     setSelectedPermission(null);
//                     resetPermForm();
//                 },
//                 onFinish: () => setIsSubmitting(false),
//             },
//         );
//     };

//     const handleDeletePerm = (perm: Permission) => {
//         if (!confirm(`Supprimer la permission "${perm.name}" ?`)) return;

//         router.delete(`/admin/permissions/${perm.id}`, {
//             preserveScroll: true,
//         });
//     };

//     // ========================================
//     // RENDU DU FORMULAIRE RÔLE
//     // ========================================

//     const renderRoleForm = (isEdit: boolean) => (
//         <div
//             className="space-y-4"
//             onSubmit={isEdit ? handleUpdate : handleCreate}
//         >
//             <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Nom du rôle <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => {
//                         setFormData({
//                             ...formData,
//                             name: e.target.value,
//                             slug: generateSlug(e.target.value),
//                         });
//                     }}
//                     placeholder="Ex: Modérateur"
//                     className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                     required
//                     disabled={isSubmitting}
//                 />
//             </div>

//             <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Slug <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     type="text"
//                     value={formData.slug}
//                     onChange={(e) =>
//                         setFormData({ ...formData, slug: e.target.value })
//                     }
//                     placeholder="Ex: moderateur"
//                     className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                     required
//                     disabled={isSubmitting}
//                 />
//             </div>

//             <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Description
//                 </label>
//                 <textarea
//                     value={formData.description}
//                     onChange={(e) =>
//                         setFormData({
//                             ...formData,
//                             description: e.target.value,
//                         })
//                     }
//                     placeholder="Description du rôle..."
//                     rows={3}
//                     className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                     disabled={isSubmitting}
//                 />
//             </div>

//             <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Niveau hiérarchique (1-99){' '}
//                     <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     type="number"
//                     value={formData.level}
//                     onChange={(e) =>
//                         setFormData({
//                             ...formData,
//                             level: parseInt(e.target.value),
//                         })
//                     }
//                     min="1"
//                     max="99"
//                     className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                     required
//                     disabled={isSubmitting}
//                 />
//             </div>

//             <div className="flex gap-3 pt-4">
//                 <button
//                     type="button"
//                     onClick={isEdit ? handleUpdate : handleCreate}
//                     disabled={isSubmitting}
//                     className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
//                 >
//                     {isSubmitting && (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                     )}
//                     {isEdit ? 'Enregistrer' : 'Créer'}
//                 </button>
//                 <button
//                     type="button"
//                     onClick={() => {
//                         if (isEdit) {
//                             setShowEditModal(false);
//                             setSelectedRole(null);
//                         } else {
//                             setShowCreateModal(false);
//                         }
//                     }}
//                     disabled={isSubmitting}
//                     className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
//                 >
//                     Annuler
//                 </button>
//             </div>
//         </div>
//     );

//     // ========================================
//     // RENDU DU FORMULAIRE PERMISSION
//     // ========================================

//     const renderPermissionForm = (isEdit: boolean) => (
//         <div className="space-y-4">
//             <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Nom <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     type="text"
//                     value={permFormData.name}
//                     onChange={(e) =>
//                         setPermFormData({
//                             ...permFormData,
//                             name: e.target.value,
//                             slug: generateSlug(e.target.value),
//                         })
//                     }
//                     placeholder="Ex: Gérer les utilisateurs"
//                     className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                 />
//             </div>

//             <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Slug <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     type="text"
//                     value={permFormData.slug}
//                     onChange={(e) =>
//                         setPermFormData({
//                             ...permFormData,
//                             slug: e.target.value,
//                         })
//                     }
//                     placeholder="Ex: manage-users"
//                     className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                 />
//             </div>

//             <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Groupe <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     type="text"
//                     value={permFormData.group}
//                     onChange={(e) =>
//                         setPermFormData({
//                             ...permFormData,
//                             group: e.target.value,
//                         })
//                     }
//                     placeholder="Ex: users"
//                     className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
//                     required
//                     disabled={isSubmitting}
//                 />
//             </div>

//             <div>
//                 <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Description
//                 </label>
//                 <textarea
//                     value={permFormData.description}
//                     onChange={(e) =>
//                         setPermFormData({
//                             ...permFormData,
//                             description: e.target.value,
//                         })
//                     }
//                     placeholder="Description de la permission..."
//                     rows={3}
//                     className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
//                     disabled={isSubmitting}
//                 />
//             </div>

//             <div className="flex gap-3">
//                 <button
//                     type="button"
//                     onClick={isEdit ? handleUpdatePerm : handleCreatePerm}
//                     disabled={isSubmitting}
//                     className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-white disabled:opacity-50"
//                 >
//                     {isSubmitting && (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                     )}
//                     {isEdit ? 'Enregistrer' : 'Créer'}
//                 </button>
//                 <button
//                     type="button"
//                     onClick={() => {
//                         if (isEdit) {
//                             setShowEditPermModal(false);
//                             setSelectedPermission(null);
//                         } else {
//                             setShowCreatePermModal(false);
//                         }
//                     }}
//                     disabled={isSubmitting}
//                     className="flex-1 rounded-lg border py-3 disabled:opacity-50"
//                 >
//                     Annuler
//                 </button>
//             </div>
//         </div>
//     );

//     return (
//         <AdminLayout >
//             <div className="min-h-screen bg-gray-50 p-6">
//                 <div className="mx-auto max-w-7xl">
//                     {/* Header avec onglets */}
//                     <div className="mb-6">
//                         <h1 className="text-3xl font-bold text-gray-900">
//                             Gestion des Rôles & Permissions
//                         </h1>

//                         {/* Onglets */}
//                         <div className="mt-4 flex gap-2">
//                             <button
//                                 onClick={() => setActiveTab('roles')}
//                                 className={`rounded-lg px-6 py-2 font-medium transition ${
//                                     activeTab === 'roles'
//                                         ? 'bg-indigo-600 text-white'
//                                         : 'bg-white text-gray-700 hover:bg-gray-100'
//                                 }`}
//                             >
//                                 Rôles ({roles.length})
//                             </button>
//                             <button
//                                 onClick={() => setActiveTab('permissions')}
//                                 className={`rounded-lg px-6 py-2 font-medium transition ${
//                                     activeTab === 'permissions'
//                                         ? 'bg-indigo-600 text-white'
//                                         : 'bg-white text-gray-700 hover:bg-gray-100'
//                                 }`}
//                             >
//                                 Permissions (
//                                 {Object.values(permissions).flat().length})
//                             </button>
//                         </div>
//                     </div>

//                     {/* Barre de recherche */}
//                     <div className="mb-6 flex items-center justify-between">
//                         <div className="relative max-w-md flex-1">
//                             <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder={`Rechercher ${activeTab === 'roles' ? 'un rôle' : 'une permission'}...`}
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                             />
//                         </div>
//                         <button
//                             onClick={
//                                 activeTab === 'roles'
//                                     ? handleOpenCreate
//                                     : handleOpenCreatePerm
//                             }
//                             className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700"
//                         >
//                             <Plus className="h-5 w-5" />
//                             Créer{' '}
//                             {activeTab === 'roles'
//                                 ? 'un rôle'
//                                 : 'une permission'}
//                         </button>
//                     </div>

//                     {/* Contenu selon l'onglet actif */}
//                     {activeTab === 'roles' ? (
//                         // Section Rôles
//                         filteredRoles.length === 0 ? (
//                             <div className="rounded-xl bg-white p-12 text-center shadow">
//                                 <AlertCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//                                 <h3 className="mb-2 text-xl font-bold text-gray-900">
//                                     Aucun rôle trouvé
//                                 </h3>
//                                 <p className="text-gray-600">
//                                     Essayez de modifier vos critères de
//                                     recherche
//                                 </p>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//                                 {filteredRoles.map((role) => (
//                                     <div
//                                         key={role.id}
//                                         className="overflow-hidden rounded-xl bg-white shadow transition hover:shadow-lg"
//                                     >
//                                         <div
//                                             className={`p-6 ${getLevelColor(role.level)} border-b-4`}
//                                         >
//                                             <div className="flex items-start justify-between">
//                                                 <div className="flex items-center gap-3">
//                                                     <div className="rounded-full bg-white/30 p-3">
//                                                         {getLevelIcon(
//                                                             role.level,
//                                                         )}
//                                                     </div>
//                                                     <div>
//                                                         <h3 className="text-xl font-bold">
//                                                             {role.name}
//                                                         </h3>
//                                                         <p className="text-sm opacity-80">
//                                                             Niveau {role.level}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 {role.is_default && (
//                                                     <span className="rounded-full bg-white/30 px-2 py-1 text-xs font-medium">
//                                                         Défaut
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         <div className="p-6">
//                                             {role.description && (
//                                                 <p className="mb-4 line-clamp-2 text-sm text-gray-600">
//                                                     {role.description}
//                                                 </p>
//                                             )}

//                                             <div className="mb-4 grid grid-cols-2 gap-4">
//                                                 <div className="rounded-lg bg-blue-50 p-3 text-center">
//                                                     <p className="text-2xl font-bold text-blue-600">
//                                                         {role.users_count}
//                                                     </p>
//                                                     <p className="text-xs text-blue-800">
//                                                         Utilisateurs
//                                                     </p>
//                                                 </div>
//                                                 <div className="rounded-lg bg-green-50 p-3 text-center">
//                                                     <p className="text-2xl font-bold text-green-600">
//                                                         {role.permissions_count}
//                                                     </p>
//                                                     <p className="text-xs text-green-800">
//                                                         Permissions
//                                                     </p>
//                                                 </div>
//                                             </div>

//                                             <div className="grid grid-cols-3 gap-2">
//                                                 <button
//                                                     onClick={() =>
//                                                         handleOpenPermissions(
//                                                             role,
//                                                         )
//                                                     }
//                                                     className="flex items-center justify-center rounded-lg bg-purple-100 p-2 text-purple-600 transition hover:bg-purple-200"
//                                                     title="Permissions"
//                                                 >
//                                                     <Key className="h-4 w-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() =>
//                                                         handleOpenEdit(role)
//                                                     }
//                                                     className="flex items-center justify-center rounded-lg bg-green-100 p-2 text-green-600 transition hover:bg-green-200"
//                                                     title="Modifier"
//                                                 >
//                                                     <Edit className="h-4 w-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() =>
//                                                         handleDelete(role)
//                                                     }
//                                                     disabled={[
//                                                         'super-admin',
//                                                         'admin',
//                                                         'user',
//                                                     ].includes(role.slug)}
//                                                     className="flex items-center justify-center rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200 disabled:opacity-50"
//                                                     title="Supprimer"
//                                                 >
//                                                     <Trash2 className="h-4 w-4" />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )
//                     ) : (
//                         // Section Permissions
//                         <div className="space-y-6">
//                             {Object.keys(filteredPermissions).length === 0 ? (
//                                 <div className="rounded-xl bg-white p-12 text-center shadow">
//                                     <AlertCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//                                     <h3 className="mb-2 text-xl font-bold text-gray-900">
//                                         Aucune permission trouvée
//                                     </h3>
//                                     <p className="text-gray-600">
//                                         Essayez de modifier vos critères de
//                                         recherche
//                                     </p>
//                                 </div>
//                             ) : (
//                                 Object.entries(filteredPermissions).map(
//                                     ([group, groupPerms]) => (
//                                         <div
//                                             key={group}
//                                             className="rounded-xl bg-white p-6 shadow"
//                                         >
//                                             <div className="mb-4 flex items-center justify-between">
//                                                 <h3 className="text-xl font-bold text-gray-900 uppercase">
//                                                     {group}
//                                                 </h3>
//                                                 <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
//                                                     {groupPerms.length}{' '}
//                                                     permission(s)
//                                                 </span>
//                                             </div>
//                                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//                                                 {groupPerms.map((perm) => (
//                                                     <div
//                                                         key={perm.id}
//                                                         className="flex items-start justify-between rounded-lg border p-4 hover:bg-gray-50"
//                                                     >
//                                                         <div className="flex-1">
//                                                             <h4 className="font-semibold text-gray-900">
//                                                                 {perm.name}
//                                                             </h4>
//                                                             <p className="text-sm text-gray-500">
//                                                                 {perm.slug}
//                                                             </p>
//                                                             {perm.description && (
//                                                                 <p className="mt-1 text-xs text-gray-600">
//                                                                     {
//                                                                         perm.description
//                                                                     }
//                                                                 </p>
//                                                             )}
//                                                         </div>
//                                                         <div className="flex gap-2">
//                                                             <button
//                                                                 onClick={() =>
//                                                                     handleOpenEditPerm(
//                                                                         perm,
//                                                                     )
//                                                                 }
//                                                                 className="rounded p-1 text-blue-600 hover:bg-blue-100"
//                                                                 title="Modifier"
//                                                             >
//                                                                 <Edit className="h-4 w-4" />
//                                                             </button>
//                                                             <button
//                                                                 onClick={() =>
//                                                                     handleDeletePerm(
//                                                                         perm,
//                                                                     )
//                                                                 }
//                                                                 className="rounded p-1 text-red-600 hover:bg-red-100"
//                                                                 title="Supprimer"
//                                                             >
//                                                                 <Trash2 className="h-4 w-4" />
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     ),
//                                 )
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* Modaux Rôles */}
//                 {showCreateModal && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//                         <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
//                             <div className="mb-4 flex items-center justify-between">
//                                 <h2 className="text-2xl font-bold">
//                                     Créer un rôle
//                                 </h2>
//                                 <button
//                                     onClick={() => setShowCreateModal(false)}
//                                     disabled={isSubmitting}
//                                     className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
//                                 >
//                                     <X className="h-5 w-5" />
//                                 </button>
//                             </div>
//                             {renderRoleForm(false)}
//                         </div>
//                     </div>
//                 )}

//                 {showEditModal && selectedRole && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//                         <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
//                             <div className="mb-4 flex items-center justify-between">
//                                 <h2 className="text-2xl font-bold">
//                                     Modifier "{selectedRole.name}"
//                                 </h2>
//                                 <button
//                                     onClick={() => {
//                                         setShowEditModal(false);
//                                         setSelectedRole(null);
//                                     }}
//                                     disabled={isSubmitting}
//                                     className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
//                                 >
//                                     <X className="h-5 w-5" />
//                                 </button>
//                             </div>
//                             {renderRoleForm(true)}
//                         </div>
//                     </div>
//                 )}

//                 {showPermissionsModal && selectedRole && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//                         <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
//                             <div className="mb-4 flex items-center justify-between">
//                                 <h2 className="text-2xl font-bold">
//                                     Permissions de "{selectedRole.name}"
//                                 </h2>
//                                 <button
//                                     onClick={() => {
//                                         setShowPermissionsModal(false);
//                                         setSelectedRole(null);
//                                     }}
//                                     disabled={isSubmitting}
//                                     className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
//                                 >
//                                     <X className="h-5 w-5" />
//                                 </button>
//                             </div>

//                             <div className="mb-4 rounded-lg bg-blue-50 p-4">
//                                 <p className="text-sm text-blue-800">
//                                     <strong>
//                                         {formData.permissions.length}
//                                     </strong>{' '}
//                                     permission(s) sélectionnée(s)
//                                 </p>
//                             </div>

//                             <div className="space-y-4">
//                                 {Object.entries(permissions).map(
//                                     ([group, groupPerms]) => (
//                                         <div
//                                             key={group}
//                                             className="rounded-lg border p-4"
//                                         >
//                                             <div className="mb-3 flex items-center justify-between">
//                                                 <h3 className="text-sm font-bold text-gray-700 uppercase">
//                                                     {group}
//                                                 </h3>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() =>
//                                                         toggleGroup(groupPerms)
//                                                     }
//                                                     disabled={isSubmitting}
//                                                     className="text-xs text-indigo-600 hover:text-indigo-800"
//                                                 >
//                                                     {groupPerms.every((p) =>
//                                                         formData.permissions.includes(
//                                                             p.slug,
//                                                         ),
//                                                     )
//                                                         ? 'Tout désélectionner'
//                                                         : 'Tout sélectionner'}
//                                                 </button>
//                                             </div>
//                                             <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
//                                                 {groupPerms.map((perm) => (
//                                                     <label
//                                                         key={perm.id}
//                                                         className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-indigo-50"
//                                                     >
//                                                         <input
//                                                             type="checkbox"
//                                                             checked={formData.permissions.includes(
//                                                                 perm.slug,
//                                                             )}
//                                                             onChange={() =>
//                                                                 togglePermission(
//                                                                     perm.slug,
//                                                                 )
//                                                             }
//                                                             disabled={
//                                                                 isSubmitting
//                                                             }
//                                                             className="h-4 w-4 rounded text-indigo-600"
//                                                         />
//                                                         <span className="text-sm">
//                                                             {perm.name}
//                                                         </span>
//                                                     </label>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     ),
//                                 )}
//                             </div>

//                             <div className="mt-6 flex gap-3">
//                                 <button
//                                     onClick={handleSyncPermissions}
//                                     disabled={isSubmitting}
//                                     className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
//                                 >
//                                     {isSubmitting && (
//                                         <Loader2 className="h-4 w-4 animate-spin" />
//                                     )}
//                                     Enregistrer
//                                 </button>
//                                 <button
//                                     onClick={() => {
//                                         setShowPermissionsModal(false);
//                                         setSelectedRole(null);
//                                     }}
//                                     disabled={isSubmitting}
//                                     className="flex-1 rounded-lg border py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
//                                 >
//                                     Annuler
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Modaux Permissions */}
//                 {showCreatePermModal && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//                         <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
//                             <div className="mb-4 flex items-center justify-between">
//                                 <h2 className="text-2xl font-bold">
//                                     Créer une permission
//                                 </h2>
//                                 <button
//                                     onClick={() =>
//                                         setShowCreatePermModal(false)
//                                     }
//                                     disabled={isSubmitting}
//                                     className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
//                                 >
//                                     <X className="h-5 w-5" />
//                                 </button>
//                             </div>
//                             {renderPermissionForm(false)}
//                         </div>
//                     </div>
//                 )}

//                 {showEditPermModal && selectedPermission && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//                         <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
//                             <div className="mb-4 flex items-center justify-between">
//                                 <h2 className="text-2xl font-bold">
//                                     Modifier "{selectedPermission.name}"
//                                 </h2>
//                                 <button
//                                     onClick={() => {
//                                         setShowEditPermModal(false);
//                                         setSelectedPermission(null);
//                                     }}
//                                     disabled={isSubmitting}
//                                     className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
//                                 >
//                                     <X className="h-5 w-5" />
//                                 </button>
//                             </div>
//                             {renderPermissionForm(true)}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </AdminLayout>
//     );
// }

import AdminLayout from '@/layouts/admin-layout';
import { Permission, Role } from '@/types/role';
import { router, usePage } from '@inertiajs/react';

// ─── Type local PageProps ────────────────────────────────────────────────────
// Définition locale pour garantir que `auth.user.roles[]` est bien typé
// avec la structure renvoyée par buildAuthPayload() dans AdminController.
// Les rôles sont chargés depuis la table pivot `user_roles`.
interface PageProps {
    roles: Role[];
    permissions: Record<string, Permission[]>;
    auth: {
        user: {
            id: string;
            full_name: string;
            username: string;
            email: string;
            profile_picture: string | null;
            account_type?: string;
            /**
             * Tableau des rôles chargés depuis `user_roles`.
             * Chaque entrée = { id, name, slug }.
             * Utilisé par admin-layout.tsx → userHasRole() pour afficher
             * le bon menu de navigation.
             */
            roles: { id: string; name: string; slug: string }[];
        };
    };
    [key: string]: unknown;
}
import {
    AlertCircle,
    Edit,
    Key,
    Loader2,
    Plus,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Index() {
    const { roles, permissions, auth } = usePage<PageProps>().props;

    const currentUser = auth.user;

    // États principaux
    const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>(
        'roles',
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États pour les rôles
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        level: 20,
        permissions: [] as string[],
    });

    // États pour les permissions
    const [showCreatePermModal, setShowCreatePermModal] = useState(false);
    const [showEditPermModal, setShowEditPermModal] = useState(false);
    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null);
    const [permFormData, setPermFormData] = useState({
        name: '',
        slug: '',
        description: '',
        group: '',
    });

    // ========================================
    // FONCTIONS UTILITAIRES
    // ========================================

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            level: 20,
            permissions: [],
        });
    };

    const resetPermForm = () => {
        setPermFormData({
            name: '',
            slug: '',
            description: '',
            group: '',
        });
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const getLevelColor = (level: number) => {
        if (level >= 80)
            return 'bg-purple-100 text-purple-800 border-purple-300';
        if (level >= 60) return 'bg-red-100 text-red-800 border-red-300';
        if (level >= 40)
            return 'bg-orange-100 text-orange-800 border-orange-300';
        return 'bg-blue-100 text-blue-800 border-blue-300';
    };

    const getLevelIcon = (level: number) => {
        if (level >= 80) return <ShieldCheck className="h-5 w-5" />;
        if (level >= 60) return <Shield className="h-5 w-5" />;
        return <ShieldAlert className="h-5 w-5" />;
    };

    // Filtrage
    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const filteredPermissions = Object.entries(permissions).reduce(
        (acc, [group, perms]) => {
            const filtered = perms.filter(
                (p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    group.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            if (filtered.length > 0) {
                acc[group] = filtered;
            }
            return acc;
        },
        {} as Record<string, Permission[]>,
    );

    // ========================================
    // HANDLERS POUR LES RÔLES
    // ========================================

    const handleOpenCreate = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleOpenEdit = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            slug: role.slug,
            description: role.description || '',
            level: role.level,
            permissions: role.permissions,
        });
        setShowEditModal(true);
    };

    const handleOpenPermissions = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            ...formData,
            permissions: role.permissions,
        });
        setShowPermissionsModal(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/admin/roles', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                resetForm();
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        setIsSubmitting(true);

        router.put(`/admin/roles/${selectedRole.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedRole(null);
                resetForm();
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleSyncPermissions = () => {
        if (!selectedRole) return;
        setIsSubmitting(true);

        router.post(
            `/admin/roles/${selectedRole.id}/permissions`,
            { permissions: formData.permissions },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowPermissionsModal(false);
                    setSelectedRole(null);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleDelete = (role: Role) => {
        if (['super-admin', 'admin', 'user'].includes(role.slug)) {
            alert('Les rôles système ne peuvent pas être supprimés');
            return;
        }
        if (!confirm(`Supprimer le rôle "${role.name}" ?`)) return;

        router.delete(`/admin/roles/${role.id}`, {
            preserveScroll: true,
        });
    };

    const togglePermission = (permSlug: string) => {
        setFormData({
            ...formData,
            permissions: formData.permissions.includes(permSlug)
                ? formData.permissions.filter((p) => p !== permSlug)
                : [...formData.permissions, permSlug],
        });
    };

    const toggleGroup = (groupPerms: Permission[]) => {
        const groupSlugs = groupPerms.map((p) => p.slug);
        const allSelected = groupSlugs.every((slug) =>
            formData.permissions.includes(slug),
        );

        setFormData({
            ...formData,
            permissions: allSelected
                ? formData.permissions.filter((p) => !groupSlugs.includes(p))
                : [...new Set([...formData.permissions, ...groupSlugs])],
        });
    };

    // ========================================
    // HANDLERS POUR LES PERMISSIONS
    // ========================================

    const handleOpenCreatePerm = () => {
        resetPermForm();
        setShowCreatePermModal(true);
    };

    const handleOpenEditPerm = (perm: Permission) => {
        setSelectedPermission(perm);
        setPermFormData({
            name: perm.name,
            slug: perm.slug,
            description: perm.description || '',
            group: perm.group,
        });
        setShowEditPermModal(true);
    };

    const handleCreatePerm = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/admin/permissions', permFormData, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreatePermModal(false);
                resetPermForm();
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleUpdatePerm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPermission) return;
        setIsSubmitting(true);

        router.put(
            `/admin/permissions/${selectedPermission.id}`,
            permFormData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowEditPermModal(false);
                    setSelectedPermission(null);
                    resetPermForm();
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleDeletePerm = (perm: Permission) => {
        if (!confirm(`Supprimer la permission "${perm.name}" ?`)) return;

        router.delete(`/admin/permissions/${perm.id}`, {
            preserveScroll: true,
        });
    };

    // ========================================
    // RENDU DU FORMULAIRE RÔLE
    // ========================================

    const renderRoleForm = (isEdit: boolean) => (
        <div
            className="space-y-4"
            onSubmit={isEdit ? handleUpdate : handleCreate}
        >
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nom du rôle <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                        setFormData({
                            ...formData,
                            name: e.target.value,
                            slug: generateSlug(e.target.value),
                        });
                    }}
                    placeholder="Ex: Modérateur"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Slug <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="Ex: moderateur"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                    placeholder="Description du rôle..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Niveau hiérarchique (1-99){' '}
                    <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    value={formData.level}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            level: parseInt(e.target.value),
                        })
                    }
                    min="1"
                    max="99"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={isEdit ? handleUpdate : handleCreate}
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isEdit ? 'Enregistrer' : 'Créer'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (isEdit) {
                            setShowEditModal(false);
                            setSelectedRole(null);
                        } else {
                            setShowCreateModal(false);
                        }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                    Annuler
                </button>
            </div>
        </div>
    );

    // ========================================
    // RENDU DU FORMULAIRE PERMISSION
    // ========================================

    const renderPermissionForm = (isEdit: boolean) => (
        <div className="space-y-4">
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nom <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={permFormData.name}
                    onChange={(e) =>
                        setPermFormData({
                            ...permFormData,
                            name: e.target.value,
                            slug: generateSlug(e.target.value),
                        })
                    }
                    placeholder="Ex: Gérer les utilisateurs"
                    className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Slug <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={permFormData.slug}
                    onChange={(e) =>
                        setPermFormData({
                            ...permFormData,
                            slug: e.target.value,
                        })
                    }
                    placeholder="Ex: manage-users"
                    className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Groupe <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={permFormData.group}
                    onChange={(e) =>
                        setPermFormData({
                            ...permFormData,
                            group: e.target.value,
                        })
                    }
                    placeholder="Ex: users"
                    className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    value={permFormData.description}
                    onChange={(e) =>
                        setPermFormData({
                            ...permFormData,
                            description: e.target.value,
                        })
                    }
                    placeholder="Description de la permission..."
                    rows={3}
                    className="w-full rounded-lg border px-4 py-2 outline-none focus:border-indigo-500"
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={isEdit ? handleUpdatePerm : handleCreatePerm}
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-white disabled:opacity-50"
                >
                    {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isEdit ? 'Enregistrer' : 'Créer'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (isEdit) {
                            setShowEditPermModal(false);
                            setSelectedPermission(null);
                        } else {
                            setShowCreatePermModal(false);
                        }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border py-3 disabled:opacity-50"
                >
                    Annuler
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header avec onglets */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gestion des Rôles & Permissions
                        </h1>

                        {/* Onglets */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => setActiveTab('roles')}
                                className={`rounded-lg px-6 py-2 font-medium transition ${
                                    activeTab === 'roles'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Rôles ({roles.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('permissions')}
                                className={`rounded-lg px-6 py-2 font-medium transition ${
                                    activeTab === 'permissions'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Permissions (
                                {Object.values(permissions).flat().length})
                            </button>
                        </div>
                    </div>

                    {/* Barre de recherche */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Rechercher ${activeTab === 'roles' ? 'un rôle' : 'une permission'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                        <button
                            onClick={
                                activeTab === 'roles'
                                    ? handleOpenCreate
                                    : handleOpenCreatePerm
                            }
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700"
                        >
                            <Plus className="h-5 w-5" />
                            Créer{' '}
                            {activeTab === 'roles'
                                ? 'un rôle'
                                : 'une permission'}
                        </button>
                    </div>

                    {/* Contenu selon l'onglet actif */}
                    {activeTab === 'roles' ? (
                        // Section Rôles
                        filteredRoles.length === 0 ? (
                            <div className="rounded-xl bg-white p-12 text-center shadow">
                                <AlertCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="mb-2 text-xl font-bold text-gray-900">
                                    Aucun rôle trouvé
                                </h3>
                                <p className="text-gray-600">
                                    Essayez de modifier vos critères de
                                    recherche
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredRoles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="overflow-hidden rounded-xl bg-white shadow transition hover:shadow-lg"
                                    >
                                        <div
                                            className={`p-6 ${getLevelColor(role.level)} border-b-4`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full bg-white/30 p-3">
                                                        {getLevelIcon(
                                                            role.level,
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold">
                                                            {role.name}
                                                        </h3>
                                                        <p className="text-sm opacity-80">
                                                            Niveau {role.level}
                                                        </p>
                                                    </div>
                                                </div>
                                                {role.is_default && (
                                                    <span className="rounded-full bg-white/30 px-2 py-1 text-xs font-medium">
                                                        Défaut
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {role.description && (
                                                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                                                    {role.description}
                                                </p>
                                            )}

                                            <div className="mb-4 grid grid-cols-2 gap-4">
                                                <div className="rounded-lg bg-blue-50 p-3 text-center">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {role.users_count}
                                                    </p>
                                                    <p className="text-xs text-blue-800">
                                                        Utilisateurs
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-green-50 p-3 text-center">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {role.permissions_count}
                                                    </p>
                                                    <p className="text-xs text-green-800">
                                                        Permissions
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleOpenPermissions(
                                                            role,
                                                        )
                                                    }
                                                    className="flex items-center justify-center rounded-lg bg-purple-100 p-2 text-purple-600 transition hover:bg-purple-200"
                                                    title="Permissions"
                                                >
                                                    <Key className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleOpenEdit(role)
                                                    }
                                                    className="flex items-center justify-center rounded-lg bg-green-100 p-2 text-green-600 transition hover:bg-green-200"
                                                    title="Modifier"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(role)
                                                    }
                                                    disabled={[
                                                        'super-admin',
                                                        'admin',
                                                        'user',
                                                    ].includes(role.slug)}
                                                    className="flex items-center justify-center rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200 disabled:opacity-50"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        // Section Permissions
                        <div className="space-y-6">
                            {Object.keys(filteredPermissions).length === 0 ? (
                                <div className="rounded-xl bg-white p-12 text-center shadow">
                                    <AlertCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                                        Aucune permission trouvée
                                    </h3>
                                    <p className="text-gray-600">
                                        Essayez de modifier vos critères de
                                        recherche
                                    </p>
                                </div>
                            ) : (
                                Object.entries(filteredPermissions).map(
                                    ([group, groupPerms]) => (
                                        <div
                                            key={group}
                                            className="rounded-xl bg-white p-6 shadow"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-gray-900 uppercase">
                                                    {group}
                                                </h3>
                                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                                                    {groupPerms.length}{' '}
                                                    permission(s)
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {groupPerms.map((perm) => (
                                                    <div
                                                        key={perm.id}
                                                        className="flex items-start justify-between rounded-lg border p-4 hover:bg-gray-50"
                                                    >
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900">
                                                                {perm.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                {perm.slug}
                                                            </p>
                                                            {perm.description && (
                                                                <p className="mt-1 text-xs text-gray-600">
                                                                    {
                                                                        perm.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenEditPerm(
                                                                        perm,
                                                                    )
                                                                }
                                                                className="rounded p-1 text-blue-600 hover:bg-blue-100"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeletePerm(
                                                                        perm,
                                                                    )
                                                                }
                                                                className="rounded p-1 text-red-600 hover:bg-red-100"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Modaux Rôles */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Créer un rôle
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={isSubmitting}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            {renderRoleForm(false)}
                        </div>
                    </div>
                )}

                {showEditModal && selectedRole && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Modifier "{selectedRole.name}"
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedRole(null);
                                    }}
                                    disabled={isSubmitting}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            {renderRoleForm(true)}
                        </div>
                    </div>
                )}

                {showPermissionsModal && selectedRole && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Permissions de "{selectedRole.name}"
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowPermissionsModal(false);
                                        setSelectedRole(null);
                                    }}
                                    disabled={isSubmitting}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-4 rounded-lg bg-blue-50 p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>
                                        {formData.permissions.length}
                                    </strong>{' '}
                                    permission(s) sélectionnée(s)
                                </p>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(permissions).map(
                                    ([group, groupPerms]) => (
                                        <div
                                            key={group}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-gray-700 uppercase">
                                                    {group}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleGroup(groupPerms)
                                                    }
                                                    disabled={isSubmitting}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                >
                                                    {groupPerms.every((p) =>
                                                        formData.permissions.includes(
                                                            p.slug,
                                                        ),
                                                    )
                                                        ? 'Tout désélectionner'
                                                        : 'Tout sélectionner'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                {groupPerms.map((perm) => (
                                                    <label
                                                        key={perm.id}
                                                        className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-indigo-50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions.includes(
                                                                perm.slug,
                                                            )}
                                                            onChange={() =>
                                                                togglePermission(
                                                                    perm.slug,
                                                                )
                                                            }
                                                            disabled={
                                                                isSubmitting
                                                            }
                                                            className="h-4 w-4 rounded text-indigo-600"
                                                        />
                                                        <span className="text-sm">
                                                            {perm.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleSyncPermissions}
                                    disabled={isSubmitting}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isSubmitting && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Enregistrer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPermissionsModal(false);
                                        setSelectedRole(null);
                                    }}
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-lg border py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modaux Permissions */}
                {showCreatePermModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Créer une permission
                                </h2>
                                <button
                                    onClick={() =>
                                        setShowCreatePermModal(false)
                                    }
                                    disabled={isSubmitting}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            {renderPermissionForm(false)}
                        </div>
                    </div>
                )}

                {showEditPermModal && selectedPermission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Modifier "{selectedPermission.name}"
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowEditPermModal(false);
                                        setSelectedPermission(null);
                                    }}
                                    disabled={isSubmitting}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            {renderPermissionForm(true)}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}