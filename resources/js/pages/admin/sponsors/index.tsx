import AdminLayout from '@/layouts/admin-layout';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Edit,
    Eye,
    Link as LinkIcon,
    MousePointerClick,
    Percent,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    TrendingUp,
    User,
    X,
    XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Sponsor {
    id: string;
    title: string;
    description: string;
    image_url: string;
    link_url: string;
    cta_label: string;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    impressions_count: number;
    clicks_count: number;
    ctr: number;
    is_live: boolean;
    sort_order: number;
    created_at: string;
    deleted_at: string | null;
    creator?: {
        id: number;
        full_name: string;
        username: string;
    };
}

interface PaginatedSponsors {
    data: Sponsor[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface GlobalStats {
    total: number;
    active: number;
    inactive: number;
    deleted: number;
    total_impressions: number;
    total_clicks: number;
}

interface SponsorFormData {
    id?: string;
    title: string;
    description: string;
    image: File | null;
    image_url: string;
    link_url: string;
    cta_label: string;
    is_active: boolean;
    starts_at: string;
    ends_at: string;
    sort_order: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATISTIQUES GLOBALES (FIXES - ne changent pas avec les filtres)
// ─────────────────────────────────────────────────────────────────────────────

interface StatsWidgetProps {
    stats: GlobalStats;
}

function StatsWidget({ stats }: StatsWidgetProps) {
    const avgCtr =
        stats.total_impressions > 0
            ? ((stats.total_clicks / stats.total_impressions) * 100).toFixed(2)
            : '0.00';

    const statsDisplay = [
        {
            label: 'Total sponsors',
            value: stats.total,
            icon: Eye,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Actifs',
            value: stats.active,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            label: 'Supprimés',
            value: stats.deleted,
            icon: Trash2,
            color: 'text-red-600',
            bg: 'bg-red-50',
        },
        {
            label: 'Impressions',
            value: stats.total_impressions.toLocaleString('fr-FR'),
            icon: Eye,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            label: 'Clics',
            value: stats.total_clicks.toLocaleString('fr-FR'),
            icon: MousePointerClick,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        },
        {
            label: 'CTR moyen',
            value: `${avgCtr}%`,
            icon: Percent,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {statsDisplay.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={i}
                        className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm"
                    >
                        <div className={`rounded-lg p-3 ${stat.bg}`}>
                            <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">
                                {stat.label}
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODAL DÉTAILS SPONSOR (avec bouton Restaurer)
// ─────────────────────────────────────────────────────────────────────────────

interface SponsorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    sponsor: Sponsor | null;
    onRestore: (id: string) => void;
}

function SponsorDetailModal({
    isOpen,
    onClose,
    sponsor,
    onRestore,
}: SponsorDetailModalProps) {
    if (!isOpen || !sponsor) return null;

    const isDeleted = !!sponsor.deleted_at;
    const statusColor = isDeleted
        ? 'bg-red-100 text-red-800'
        : sponsor.is_live
          ? 'bg-green-100 text-green-800'
          : sponsor.is_active
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800';

    const statusLabel = isDeleted
        ? 'Supprimé'
        : sponsor.is_live
          ? 'En cours'
          : sponsor.is_active
            ? 'Planifié'
            : 'Inactif';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        Détails du sponsor
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6 p-6">
                    {/* Image */}
                    <div className="relative">
                        <img
                            src={sponsor.image_url}
                            alt={sponsor.title}
                            className={`h-64 w-full rounded-lg object-cover shadow-sm ${isDeleted ? 'opacity-60' : ''}`}
                        />
                        {isDeleted && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="rounded-full bg-red-600 p-4">
                                    <Trash2 className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Statut badge */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}
                        >
                            {statusLabel}
                        </span>
                        {sponsor.is_live && !isDeleted && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                                ● En diffusion
                            </span>
                        )}
                    </div>

                    {/* Alerte si supprimé */}
                    {isDeleted && (
                        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-800">
                                        Ce sponsor a été supprimé le{' '}
                                        {new Date(
                                            sponsor.deleted_at!,
                                        ).toLocaleString('fr-FR')}
                                    </p>
                                    <p className="mt-1 text-xs text-red-600">
                                        Vous pouvez le restaurer en cliquant sur
                                        le bouton ci-dessous.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Informations principales */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">
                                Titre
                            </label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                {sponsor.title}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500">
                                Description
                            </label>
                            <p className="mt-1 text-gray-700">
                                {sponsor.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Bouton CTA
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {sponsor.cta_label}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Ordre d'affichage
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {sponsor.sort_order}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                <LinkIcon className="h-4 w-4" />
                                URL de destination
                            </label>
                            <a
                                href={sponsor.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 block text-blue-600 hover:underline"
                            >
                                {sponsor.link_url}
                            </a>
                        </div>
                    </div>

                    {/* Période de diffusion */}
                    <div className="rounded-lg bg-gray-50 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Calendar className="h-4 w-4" />
                            Période de diffusion
                        </h3>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block font-medium text-gray-500">
                                    Début
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {sponsor.starts_at
                                        ? new Date(
                                              sponsor.starts_at,
                                          ).toLocaleString('fr-FR')
                                        : 'Immédiat'}
                                </p>
                            </div>
                            <div>
                                <label className="block font-medium text-gray-500">
                                    Fin
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {sponsor.ends_at
                                        ? new Date(
                                              sponsor.ends_at,
                                          ).toLocaleString('fr-FR')
                                        : 'Indéfinie'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Métriques */}
                    <div className="rounded-lg bg-indigo-50 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <TrendingUp className="h-4 w-4" />
                            Performances
                        </h3>
                        <div className="mt-3 grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Impressions
                                </label>
                                <p className="mt-1 text-2xl font-bold text-indigo-600">
                                    {sponsor.impressions_count.toLocaleString(
                                        'fr-FR',
                                    )}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    Clics
                                </label>
                                <p className="mt-1 text-2xl font-bold text-indigo-600">
                                    {sponsor.clicks_count.toLocaleString(
                                        'fr-FR',
                                    )}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">
                                    CTR
                                </label>
                                <p className="mt-1 text-2xl font-bold text-indigo-600">
                                    {sponsor.ctr}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Créateur */}
                    {sponsor.creator && (
                        <div className="rounded-lg border border-gray-200 p-4">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                <User className="h-4 w-4" />
                                Créé par
                            </h3>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                                    <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {sponsor.creator.full_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        @{sponsor.creator.username}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date de création */}
                    <div className="text-sm text-gray-500">
                        Créé le{' '}
                        {new Date(sponsor.created_at).toLocaleString('fr-FR')}
                    </div>
                </div>

                {/* Footer avec boutons */}
                <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
                    <div className="flex gap-3">
                        {isDeleted ? (
                            <>
                                <button
                                    onClick={() => {
                                        onRestore(sponsor.id);
                                        onClose();
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Restaurer ce sponsor
                                </button>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Fermer
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                            >
                                Fermer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODAL FORMULAIRE (création / édition)
// ─────────────────────────────────────────────────────────────────────────────

interface SponsorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    sponsor: Sponsor | null;
}

function SponsorFormModal({ isOpen, onClose, sponsor }: SponsorFormModalProps) {
    const isEdit = !!sponsor;
    const [formData, setFormData] = useState<SponsorFormData>({
        id: sponsor?.id,
        title: sponsor?.title ?? '',
        description: sponsor?.description ?? '',
        image: null,
        image_url: sponsor?.image_url ?? '',
        link_url: sponsor?.link_url ?? '',
        cta_label: sponsor?.cta_label ?? 'En savoir plus',
        is_active: sponsor?.is_active ?? true,
        starts_at: sponsor?.starts_at ? sponsor.starts_at.slice(0, 16) : '',
        ends_at: sponsor?.ends_at ? sponsor.ends_at.slice(0, 16) : '',
        sort_order: sponsor?.sort_order ?? 0,
    });
    const [previewUrl, setPreviewUrl] = useState<string>(
        sponsor?.image_url ?? '',
    );
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                id: sponsor?.id,
                title: sponsor?.title ?? '',
                description: sponsor?.description ?? '',
                image: null,
                image_url: sponsor?.image_url ?? '',
                link_url: sponsor?.link_url ?? '',
                cta_label: sponsor?.cta_label ?? 'En savoir plus',
                is_active: sponsor?.is_active ?? true,
                starts_at: sponsor?.starts_at
                    ? sponsor.starts_at.slice(0, 16)
                    : '',
                ends_at: sponsor?.ends_at ? sponsor.ends_at.slice(0, 16) : '',
                sort_order: sponsor?.sort_order ?? 0,
            });
            setPreviewUrl(sponsor?.image_url ?? '');
        }
    }, [sponsor, isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('link_url', formData.link_url);
        data.append('cta_label', formData.cta_label);
        data.append('is_active', formData.is_active ? '1' : '0');
        data.append('sort_order', String(formData.sort_order));

        if (formData.image) {
            data.append('image', formData.image);
        } else if (formData.image_url) {
            data.append('image_url', formData.image_url);
        }

        if (formData.starts_at) data.append('starts_at', formData.starts_at);
        if (formData.ends_at) data.append('ends_at', formData.ends_at);

        if (isEdit) {
            data.append('_method', 'PUT');
        }

        router.post(
            isEdit ? `/admin/sponsors/${sponsor.id}` : '/admin/sponsors',
            data,
            {
                preserveState: false,
                onSuccess: () => {
                    toast.success(
                        isEdit
                            ? 'Sponsor modifié avec succès'
                            : 'Sponsor créé avec succès',
                    );
                    onClose();
                },
                onError: (errors) => {
                    toast.error('Erreur lors de la soumission');
                    console.error(errors);
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEdit ? 'Modifier le sponsor' : 'Nouveau sponsor'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    {previewUrl && (
                        <div className="rounded-lg border border-gray-200 p-4">
                            <p className="mb-2 text-sm font-medium text-gray-700">
                                Aperçu :
                            </p>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-48 w-full rounded-lg object-cover"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Titre *
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={120}
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            placeholder="Ex: Huiles essentielles BioNature"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description *
                        </label>
                        <textarea
                            required
                            maxLength={500}
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            placeholder="Découvrez notre gamme 100% naturelle..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.description.length}/500 caractères
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Image *
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Ou entrez une URL externe :
                        </p>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    image_url: e.target.value,
                                })
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                URL de destination *
                            </label>
                            <input
                                type="url"
                                required
                                value={formData.link_url}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        link_url: e.target.value,
                                    })
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Texte du bouton
                            </label>
                            <input
                                type="text"
                                maxLength={60}
                                value={formData.cta_label}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        cta_label: e.target.value,
                                    })
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                placeholder="En savoir plus"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Début de diffusion
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.starts_at}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        starts_at: e.target.value,
                                    })
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Fin de diffusion
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.ends_at}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ends_at: e.target.value,
                                    })
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Ordre d'affichage
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={9999}
                                value={formData.sort_order}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sort_order: parseInt(e.target.value),
                                    })
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Plus bas = affiché en premier
                            </p>
                        </div>
                        <div className="flex items-end">
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_active: e.target.checked,
                                        })
                                    }
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Actif
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>{isEdit ? 'Modifier' : 'Créer'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LIGNE DU TABLEAU
// ─────────────────────────────────────────────────────────────────────────────

interface SponsorRowProps {
    sponsor: Sponsor;
    onEdit: (sponsor: Sponsor) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
    onViewDetails: (sponsor: Sponsor) => void;
    onRestore: (id: string) => void;
}

function SponsorRow({
    sponsor,
    onEdit,
    onDelete,
    onToggle,
    onViewDetails,
    onRestore,
}: SponsorRowProps) {
    const isDeleted = !!sponsor.deleted_at;

    const statusColor = isDeleted
        ? 'bg-red-100 text-red-800'
        : sponsor.is_live
          ? 'bg-green-100 text-green-800'
          : sponsor.is_active
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800';

    const statusLabel = isDeleted
        ? 'Supprimé'
        : sponsor.is_live
          ? 'En cours'
          : sponsor.is_active
            ? 'Planifié'
            : 'Inactif';

    return (
        <tr
            className={`border-b border-gray-100 transition hover:bg-gray-50 ${isDeleted ? 'bg-red-50/30' : ''}`}
        >
            <td className="px-6 py-4">
                <div className="relative">
                    <img
                        src={sponsor.image_url}
                        alt={sponsor.title}
                        className={`h-12 w-20 rounded-lg object-cover shadow-sm ${isDeleted ? 'opacity-40' : ''}`}
                    />
                    {isDeleted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                    )}
                </div>
            </td>

            <td className="px-6 py-4">
                <p
                    className={`font-medium ${isDeleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                >
                    {sponsor.title}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                    {sponsor.description}
                </p>
            </td>

            <td className="px-6 py-4">
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                >
                    {statusLabel}
                </span>
            </td>

            <td className="px-6 py-4">
                <div className="space-y-1 text-xs">
                    <p className="flex items-center gap-1 text-gray-600">
                        <Eye className="h-3 w-3" />
                        {sponsor.impressions_count.toLocaleString('fr-FR')}
                    </p>
                    <p className="flex items-center gap-1 text-gray-600">
                        <MousePointerClick className="h-3 w-3" />
                        {sponsor.clicks_count.toLocaleString('fr-FR')}
                    </p>
                    <p className="font-medium text-indigo-600">
                        CTR: {sponsor.ctr}%
                    </p>
                </div>
            </td>

            <td className="px-6 py-4 text-xs text-gray-500">
                {sponsor.starts_at ? (
                    <p>
                        Du{' '}
                        {new Date(sponsor.starts_at).toLocaleDateString(
                            'fr-FR',
                        )}
                    </p>
                ) : (
                    <p>Immédiat</p>
                )}
                {sponsor.ends_at && (
                    <p>
                        Au{' '}
                        {new Date(sponsor.ends_at).toLocaleDateString('fr-FR')}
                    </p>
                )}
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewDetails(sponsor)}
                        className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                        title="Voir les détails"
                    >
                        <Eye className="h-4 w-4" />
                    </button>

                    {isDeleted ? (
                        <button
                            onClick={() => onRestore(sponsor.id)}
                            className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                            title="Restaurer"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => onToggle(sponsor.id)}
                                title={
                                    sponsor.is_active ? 'Désactiver' : 'Activer'
                                }
                                className="rounded-lg p-2 transition hover:bg-gray-100"
                            >
                                {sponsor.is_active ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-gray-400" />
                                )}
                            </button>

                            <button
                                onClick={() => onEdit(sponsor)}
                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                title="Modifier"
                            >
                                <Edit className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => onDelete(sponsor.id)}
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                title="Supprimer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
    sponsors: PaginatedSponsors;
    globalStats: GlobalStats;
    filters: {
        status: string;
    };
}

export default function AdminSponsorsIndex({
    sponsors: paginatedSponsors,
    globalStats,
    filters,
}: Props) {
    const [filter, setFilter] = useState<string>(filters.status ?? 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
    const [viewingSponsor, setViewingSponsor] = useState<Sponsor | null>(null);

    const filteredSponsors = paginatedSponsors.data.filter((s) => {
        const matchesSearch =
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        router.get(
            '/admin/sponsors',
            { status: newFilter },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleEdit = (sponsor: Sponsor) => {
        setEditingSponsor(sponsor);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setEditingSponsor(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingSponsor(null);
    };

    const handleViewDetails = (sponsor: Sponsor) => {
        setViewingSponsor(sponsor);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setViewingSponsor(null);
    };

    const handleToggle = (id: string) => {
        router.patch(
            `/admin/sponsors/${id}/toggle`,
            {},
            {
                preserveState: false,
                onSuccess: () => toast.success('Statut modifié'),
                onError: () => toast.error('Erreur'),
            },
        );
    };

    const handleDelete = (id: string) => {
        if (
            confirm('Supprimer ce sponsor ? (suppression douce, récupérable)')
        ) {
            router.delete(`/admin/sponsors/${id}`, {
                preserveState: false,
                onSuccess: () => {
                    toast.success('Sponsor supprimé avec succès');
                },
                onError: (errors) => {
                    console.error('Erreur suppression:', errors);
                    toast.error('Erreur lors de la suppression');
                },
            });
        }
    };

    const handleRestore = (id: string) => {
        if (confirm('Restaurer ce sponsor ?')) {
            router.post(
                `/admin/sponsors/${id}/restore`,
                {},
                {
                    preserveState: false,
                    onSuccess: () => {
                        toast.success('Sponsor restauré avec succès ! 🎉');
                    },
                    onError: (errors) => {
                        console.error('Erreur restauration:', errors);
                        toast.error('Erreur lors de la restauration');
                    },
                },
            );
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Gestion des sponsors
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Gérez les annonces sponsorisées affichées dans la
                            sidebar
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nouveau sponsor
                    </button>
                </div>

                {/* Stats GLOBALES (fixes, ne changent pas avec les filtres) */}
                <StatsWidget stats={globalStats} />

                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2">
                            {[
                                { key: 'all', label: 'Tous' },
                                { key: 'active', label: 'Actifs' },
                                { key: 'inactive', label: 'Inactifs' },
                                {
                                    key: 'deleted',
                                    label: 'Supprimés',
                                    color: 'red',
                                },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => handleFilterChange(item.key)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        filter === item.key
                                            ? item.color === 'red'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-indigo-100 text-indigo-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:w-64"
                            />
                        </div>
                    </div>
                </div>

                {filter === 'deleted' && (
                    <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">
                            🗑️ Vous consultez les sponsors supprimés
                        </p>
                        <p className="mt-1 text-xs text-red-600">
                            Cliquez sur l'icône{' '}
                            <RotateCcw className="inline h-3 w-3" /> pour
                            restaurer un sponsor.
                        </p>
                    </div>
                )}

                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Titre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Métriques
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Période
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSponsors.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-sm text-gray-500"
                                        >
                                            {filter === 'deleted'
                                                ? 'Aucun sponsor supprimé'
                                                : 'Aucun sponsor trouvé'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSponsors.map((sponsor) => (
                                        <SponsorRow
                                            key={sponsor.id}
                                            sponsor={sponsor}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onToggle={handleToggle}
                                            onViewDetails={handleViewDetails}
                                            onRestore={handleRestore}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {paginatedSponsors.last_page > 1 && (
                    <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-600">
                            Page {paginatedSponsors.current_page} sur{' '}
                            {paginatedSponsors.last_page}
                        </p>
                        <div className="flex gap-2">
                            {paginatedSponsors.current_page > 1 && (
                                <button
                                    onClick={() =>
                                        router.get(
                                            `/admin/sponsors?page=${paginatedSponsors.current_page - 1}&status=${filter}`,
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Précédent
                                </button>
                            )}
                            {paginatedSponsors.current_page <
                                paginatedSponsors.last_page && (
                                <button
                                    onClick={() =>
                                        router.get(
                                            `/admin/sponsors?page=${paginatedSponsors.current_page + 1}&status=${filter}`,
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Suivant
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <SponsorFormModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                sponsor={editingSponsor}
            />

            <SponsorDetailModal
                isOpen={detailModalOpen}
                onClose={handleCloseDetailModal}
                sponsor={viewingSponsor}
                onRestore={handleRestore}
            />
        </AdminLayout>
    );
}
