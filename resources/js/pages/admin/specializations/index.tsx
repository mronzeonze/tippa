import AdminLayout from '@/layouts/admin-layout';
import { PageProps, Specialization } from '@/types/specialization';
import { router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Download,
    Edit,
    ImageIcon,
    Loader2,
    Plus,
    Search,
    Trash2,
    Upload,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Types


export default function Index() {
    const {
        specializations,
        stats,
        search: initialSearch,
    } = usePage<PageProps>().props;

    // États
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortField, setSortField] = useState<
        'name' | 'users_count' | 'created_at'
    >('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSpecialization, setSelectedSpecialization] =
        useState<Specialization | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: null as File | null,
        is_active: true,
    });

    const defaultIcon =
        'https://ui-avatars.com/api/?name=Spec&background=10b981&color=fff&size=200';

    // ========================================
    // FONCTIONS UTILITAIRES
    // ========================================

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            icon: null,
            is_active: true,
        });
        setIconPreview(null);
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Filtrage local
    const filteredSpecializations = specializations.filter(
        (spec) =>
            spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            spec.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (spec.description &&
                spec.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())),
    );

    // Tri
    const handleSort = (field: 'name' | 'users_count' | 'created_at') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedData = [...filteredSpecializations].sort((a, b) => {
        let comparison = 0;

        if (sortField === 'name') {
            comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'users_count') {
            comparison = a.users_count - b.users_count;
        } else if (sortField === 'created_at' && a.created_at && b.created_at) {
            comparison =
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime();
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Gestion de l'icône
    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Vérifier la taille (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("L'image ne doit pas dépasser 2MB");
                return;
            }

            // Vérifier le type
            const validTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/svg+xml',
            ];
            if (!validTypes.includes(file.type)) {
                toast.error('Format non valide. Utilisez JPG, PNG, GIF ou SVG');
                return;
            }

            setFormData({ ...formData, icon: file });
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const removeIcon = () => {
        if (iconPreview && iconPreview.startsWith('blob:')) {
            URL.revokeObjectURL(iconPreview);
        }
        setFormData({ ...formData, icon: null });
        setIconPreview(null);
    };

    // ========================================
    // HANDLERS CRUD
    // ========================================

    const handleOpenCreate = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleOpenEdit = (specialization: Specialization) => {
        setSelectedSpecialization(specialization);
        setFormData({
            name: specialization.name,
            slug: specialization.slug,
            description: specialization.description || '',
            icon: null,
            is_active: specialization.is_active,
        });
        setIconPreview(specialization.icon || null);
        setShowEditModal(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Le nom est requis');
            return;
        }

        if (!formData.slug.trim()) {
            toast.error('Le slug est requis');
            return;
        }

        setIsSubmitting(true);

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('slug', formData.slug);
        submitData.append('description', formData.description);
        submitData.append('is_active', formData.is_active ? '1' : '0');

        if (formData.icon) {
            submitData.append('icon', formData.icon);
        }

        router.post('/admin/specializations', submitData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Spécialisation créée avec succès');
                setShowCreateModal(false);
                resetForm();
            },
            onError: (errors) => {
                console.error(errors);
                const errorMessage = Object.values(errors)[0] as string;
                toast.error(errorMessage || 'Erreur lors de la création');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSpecialization) return;

        if (!formData.name.trim()) {
            toast.error('Le nom est requis');
            return;
        }

        setIsSubmitting(true);

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('slug', formData.slug);
        submitData.append('description', formData.description);
        submitData.append('is_active', formData.is_active ? '1' : '0');
        submitData.append('_method', 'PUT');

        if (formData.icon) {
            submitData.append('icon', formData.icon);
        }

        router.post(
            `/admin/specializations/${selectedSpecialization.id}`,
            submitData,
            {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Spécialisation mise à jour');
                    setShowEditModal(false);
                    setSelectedSpecialization(null);
                    resetForm();
                },
                onError: (errors) => {
                    console.error(errors);
                    const errorMessage = Object.values(errors)[0] as string;
                    toast.error(
                        errorMessage || 'Erreur lors de la mise à jour',
                    );
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleDelete = (specialization: Specialization) => {
        if (
            !confirm(
                `Êtes-vous sûr de vouloir supprimer "${specialization.name}" ?`,
            )
        ) {
            return;
        }

        router.delete(`/admin/specializations/${specialization.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Spécialisation supprimée');
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors)[0] as string;
                toast.error(errorMessage || 'Erreur lors de la suppression');
            },
        });
    };

    // Export CSV
    const handleExport = () => {
        window.location.href = '/admin/specializations/export';
        toast.success('Export en cours...');
    };

    // Recherche serveur
    const handleSearch = () => {
        router.get(
            '/admin/specializations',
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // ========================================
    // RENDU DU FORMULAIRE
    // ========================================

    const renderForm = (isEdit: boolean) => (
        <form onSubmit={isEdit ? handleUpdate : handleCreate} className="">
            {/* Icône */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Icône de la spécialisation
                </label>
                <div className="flex items-start gap-4">
                    {/* Preview de l'icône */}
                    <div className="relative">
                        <img
                            src={iconPreview || defaultIcon}
                            alt="Icône"
                            className="h-24 w-24 rounded-lg object-cover ring-2 ring-gray-200"
                            onError={(e) => {
                                e.currentTarget.src = defaultIcon;
                            }}
                        />
                        {iconPreview && (
                            <button
                                type="button"
                                onClick={removeIcon}
                                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Bouton upload */}
                    <div className="flex-1">
                        <input
                            type="file"
                            id="icon-upload"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                            hidden
                            onChange={handleIconChange}
                            disabled={isSubmitting}
                        />
                        <label
                            htmlFor="icon-upload"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-emerald-500 hover:bg-emerald-50"
                        >
                            <Upload className="h-5 w-5" />
                            Choisir une icône
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                            JPG, PNG, GIF ou SVG. Max 2MB.
                        </p>
                    </div>
                </div>
            </div>

            {/* Nom */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nom de la spécialisation{' '}
                    <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                        const name = e.target.value;
                        setFormData({
                            ...formData,
                            name,
                            slug: generateSlug(name),
                        });
                    }}
                    placeholder="Ex: Phytothérapie"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    required
                    disabled={isSubmitting}
                />
            </div>

            {/* Slug */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="Ex: phytotherapie"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    required
                    disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                    Uniquement des lettres minuscules, chiffres et tirets
                </p>
            </div>

            {/* Description */}
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
                    placeholder="Description détaillée de la spécialisation..."
                    rows={4}
                    maxLength={1000}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    disabled={isSubmitting}
                />
                <p className="mt-1 text-right text-xs text-gray-500">
                    {formData.description.length}/1000 caractères
                </p>
            </div>

            {/* Statut */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Statut <span className="text-red-500">*</span>
                </label>
                <select
                    value={formData.is_active ? '1' : '0'}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            is_active: e.target.value === '1',
                        })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    disabled={isSubmitting}
                >
                    <option value="1">Actif</option>
                    <option value="0">Inactif</option>
                </select>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 border-t pt-6">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting && (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    )}
                    {isSubmitting
                        ? 'Enregistrement...'
                        : isEdit
                          ? 'Mettre à jour'
                          : 'Créer'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (isEdit) {
                            setShowEditModal(false);
                            setSelectedSpecialization(null);
                        } else {
                            setShowCreateModal(false);
                        }
                        resetForm();
                    }}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border-2 border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Annuler
                </button>
            </div>
        </form>
    );

    // ========================================
    // RENDU PRINCIPAL
    // ========================================

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestion des Spécialisations
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Gérez les spécialisations des tradipraticiens
                            </p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                        >
                            <Download className="h-5 w-5" />
                            Exporter CSV
                        </button>
                    </div>

                    {/* STATISTIQUES */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Total
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-gray-900">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <ImageIcon className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Actifs
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-green-600">
                                        {stats.active}
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Inactifs
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-red-600">
                                        {stats.inactive}
                                    </p>
                                </div>
                                <div className="rounded-full bg-red-100 p-3">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Utilisateurs
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-purple-600">
                                        {stats.total_users}
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Download className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BARRE DE RECHERCHE ET ACTIONS */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une spécialisation..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                />
                            </div>
                            <button
                                onClick={handleOpenCreate}
                                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700"
                            >
                                <Plus className="h-5 w-5" />
                                Nouvelle spécialisation
                            </button>
                        </div>
                    </div>

                    {/* TABLEAU */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <button
                                                onClick={() =>
                                                    handleSort('name')
                                                }
                                                className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-700 uppercase transition hover:text-emerald-600"
                                            >
                                                Spécialisation
                                                {sortField === 'name' && (
                                                    <span className="text-emerald-600">
                                                        {sortDirection === 'asc'
                                                            ? '↑'
                                                            : '↓'}
                                                    </span>
                                                )}
                                            </button>
                                        </th>

                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-semibold tracking-wider text-gray-700 uppercase">
                                                Description
                                            </span>
                                        </th>

                                        <th className="px-6 py-4 text-center">
                                            <button
                                                onClick={() =>
                                                    handleSort('users_count')
                                                }
                                                className="flex w-full items-center justify-center gap-2 text-xs font-semibold tracking-wider text-gray-700 uppercase transition hover:text-emerald-600"
                                            >
                                                Utilisateurs
                                                {sortField ===
                                                    'users_count' && (
                                                    <span className="text-emerald-600">
                                                        {sortDirection === 'asc'
                                                            ? '↑'
                                                            : '↓'}
                                                    </span>
                                                )}
                                            </button>
                                        </th>

                                        <th className="px-6 py-4 text-center">
                                            <span className="text-xs font-semibold tracking-wider text-gray-700 uppercase">
                                                Statut
                                            </span>
                                        </th>

                                        <th className="px-6 py-4 text-center">
                                            <span className="text-xs font-semibold tracking-wider text-gray-700 uppercase">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {sortedData.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <Search className="mb-3 h-12 w-12 text-gray-300" />
                                                    <p className="text-sm text-gray-500">
                                                        Aucune spécialisation
                                                        trouvée
                                                    </p>
                                                    {searchTerm && (
                                                        <button
                                                            onClick={() => {
                                                                setSearchTerm(
                                                                    '',
                                                                );
                                                                handleSearch();
                                                            }}
                                                            className="mt-3 text-sm text-emerald-600 hover:underline"
                                                        >
                                                            Réinitialiser la
                                                            recherche
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedData.map((spec) => (
                                            <tr
                                                key={spec.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                {/* Nom avec icône */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={
                                                                spec.icon ||
                                                                defaultIcon
                                                            }
                                                            alt={spec.name}
                                                            className="h-12 w-12 rounded-lg object-cover ring-2 ring-gray-100"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    defaultIcon;
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {spec.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {spec.slug}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Description */}
                                                <td className="px-6 py-4">
                                                    {spec.description ? (
                                                        <p className="line-clamp-2 max-w-md text-sm text-gray-600">
                                                            {spec.description}
                                                        </p>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">
                                                            Aucune description
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Utilisateurs */}
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                                        {spec.users_count}
                                                    </span>
                                                </td>

                                                {/* Statut */}
                                                <td className="px-6 py-4 text-center">
                                                    {spec.is_active ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Actif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                            <XCircle className="h-3 w-3" />
                                                            Inactif
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    spec,
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                                            title="Modifier"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    spec,
                                                                )
                                                            }
                                                            disabled={
                                                                spec.users_count >
                                                                0
                                                            }
                                                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                                                                spec.users_count >
                                                                0
                                                                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-50'
                                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            }`}
                                                            title={
                                                                spec.users_count >
                                                                0
                                                                    ? 'Impossible de supprimer : utilisateurs assignés'
                                                                    : 'Supprimer'
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer avec stats */}
                        {sortedData.length > 0 && (
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <p>
                                        Affichage de{' '}
                                        <span className="font-semibold">
                                            {sortedData.length}
                                        </span>{' '}
                                        spécialisation
                                        {sortedData.length > 1 ? 's' : ''}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-emerald-600">
                                            {stats.active}
                                        </span>{' '}
                                        active{stats.active > 1 ? 's' : ''} •{' '}
                                        <span className="font-semibold text-blue-600">
                                            {stats.total_users}
                                        </span>{' '}
                                        utilisateurs
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MODALS */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Créer une spécialisation
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        disabled={isSubmitting}
                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                {renderForm(false)}
                            </div>
                        </div>
                    )}

                    {showEditModal && selectedSpecialization && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Modifier "{selectedSpecialization.name}"
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedSpecialization(null);
                                            resetForm();
                                        }}
                                        disabled={isSubmitting}
                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                {renderForm(true)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
