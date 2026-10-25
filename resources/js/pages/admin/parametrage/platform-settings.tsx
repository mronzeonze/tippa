// import AdminLayout from '@/layouts/admin-layout';
// import AppLayout from '@/layouts/app-layout';
// import { router, usePage } from '@inertiajs/react';
// import {
//     AlertCircle,
//     Check,
//     Database,
//     Globe,
//     Mail,
//     RefreshCw,
//     Save,
//     Settings,
//     Shield,
//     TrendingUp,
//     Users,
// } from 'lucide-react';
// import { useState } from 'react';
// import toast from 'react-hot-toast';

// // Types
// interface Setting {
//     id: number;
//     key: string;
//     value: string;
//     type: string;
//     group: string;
//     description: string;
//     is_public: boolean;
// }

// interface Settings {
//     general?: { [key: string]: Setting };
//     users?: { [key: string]: Setting };
//     content?: { [key: string]: Setting };
//     notifications?: { [key: string]: Setting };
//     security?: { [key: string]: Setting };
// }

// interface Stats {
//     total_users: number;
//     total_practitioners: number;
//     verified_practitioners: number;
//     total_posts: number;
//     total_messages: number;
//     pending_verifications: number;
// }

// interface PageProps {
//     settings: Settings;
//     stats: Stats;
//     auth: {
//         user: any;
//     };
//     [key: string]: any;
// }

// export default function PlatformSettings() {
//     const { settings: initialSettings, stats } = usePage<PageProps>().props;
//     const [activeTab, setActiveTab] = useState<string>('general');
//     const [settings, setSettings] = useState<Settings>(initialSettings);
//     const [hasChanges, setHasChanges] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);

//     // Groupes de paramètres avec icônes
//     const groups = [
//         { key: 'general', label: 'Général', icon: Globe },
//         { key: 'users', label: 'Utilisateurs', icon: Users },
//         { key: 'content', label: 'Contenu', icon: Database },
//         { key: 'notifications', label: 'Notifications', icon: Mail },
//         { key: 'security', label: 'Sécurité', icon: Shield },
//     ];

//     // Mettre à jour une valeur
//     const handleChange = (group: string, key: string, value: any) => {
//         setSettings((prev) => ({
//             ...prev,
//             [group]: {
//                 ...prev[group as keyof Settings],
//                 [key]: {
//                     ...(prev[group as keyof Settings] as any)[key],
//                     value: value,
//                 },
//             },
//         }));
//         setHasChanges(true);
//     };

//     // Sauvegarder tous les changements
//     const handleSaveAll = () => {
//         setIsSaving(true);

//         // Préparer les données
//         const settingsToUpdate: { [key: string]: any } = {};
//         Object.entries(settings).forEach(([group, groupSettings]) => {
//             Object.entries(groupSettings as any).forEach(([key, setting]) => {
//                 settingsToUpdate[key] = (setting as Setting).value;
//             });
//         });

//         router.post(
//             '/admin/settings/batch',
//             { settings: settingsToUpdate },
//             {
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     toast.success('Paramètres enregistrés avec succès');
//                     setHasChanges(false);
//                 },
//                 onError: (errors) => {
//                     toast.error(
//                         (Object.values(errors)[0] as string) ||
//                             'Erreur lors de la sauvegarde',
//                     );
//                 },
//                 onFinish: () => {
//                     setIsSaving(false);
//                 },
//             },
//         );
//     };

//     // Réinitialiser aux valeurs par défaut
//     const handleReset = () => {
//         if (
//             !confirm(
//                 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?',
//             )
//         )
//             return;

//         router.post(
//             '/admin/settings/reset',
//             {},
//             {
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     toast.success('Paramètres réinitialisés');
//                     setHasChanges(false);
//                 },
//                 onError: () => {
//                     toast.error('Erreur lors de la réinitialisation');
//                 },
//             },
//         );
//     };

//     // Rendre un champ selon son type
//     const renderField = (setting: Setting, group: string) => {
//         const value = setting.value;

//         switch (setting.type) {
//             case 'boolean':
//                 return (
//                     <label className="flex cursor-pointer items-center gap-3">
//                         <div className="relative">
//                             <input
//                                 type="checkbox"
//                                 checked={value === '1' || value === 'true'}
//                                 onChange={(e) =>
//                                     handleChange(
//                                         group,
//                                         setting.key,
//                                         e.target.checked ? '1' : '0',
//                                     )
//                                 }
//                                 className="peer sr-only"
//                             />
//                             <div className="h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-emerald-500"></div>
//                             <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5"></div>
//                         </div>
//                         <span className="text-sm text-gray-700">
//                             {setting.description}
//                         </span>
//                     </label>
//                 );

//             case 'number':
//                 return (
//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-700">
//                             {setting.description}
//                         </label>
//                         <input
//                             type="number"
//                             value={value}
//                             onChange={(e) =>
//                                 handleChange(group, setting.key, e.target.value)
//                             }
//                             className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                         />
//                     </div>
//                 );

//             case 'textarea':
//                 return (
//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-700">
//                             {setting.description}
//                         </label>
//                         <textarea
//                             value={value}
//                             onChange={(e) =>
//                                 handleChange(group, setting.key, e.target.value)
//                             }
//                             rows={4}
//                             className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                         />
//                     </div>
//                 );

//             default:
//                 return (
//                     <div>
//                         <label className="mb-2 block text-sm font-medium text-gray-700">
//                             {setting.description}
//                         </label>
//                         <input
//                             type={setting.type === 'email' ? 'email' : 'text'}
//                             value={value}
//                             onChange={(e) =>
//                                 handleChange(group, setting.key, e.target.value)
//                             }
//                             className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                         />
//                     </div>
//                 );
//         }
//     };

//     return (
//         <AdminLayout>
//             <div className="min-h-screen bg-gray-50 p-6">
//                 <div className="mx-auto max-w-7xl">
//                     {/* Header */}
//                     <div className="mb-8 flex items-center justify-between">
//                         <div>
//                             <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-gray-900">
//                                 <Settings className="h-8 w-8 text-emerald-600" />
//                                 Paramètres de la plateforme
//                             </h1>
//                             <p className="text-gray-600">
//                                 Configuration globale réservée aux super-admins
//                             </p>
//                         </div>

//                         <div className="flex items-center gap-3">
//                             {hasChanges && (
//                                 <span className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
//                                     <AlertCircle className="h-4 w-4" />
//                                     Modifications non sauvegardées
//                                 </span>
//                             )}
//                             <button
//                                 onClick={handleReset}
//                                 className="flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
//                             >
//                                 <RefreshCw className="h-4 w-4" />
//                                 Réinitialiser
//                             </button>
//                             <button
//                                 onClick={handleSaveAll}
//                                 disabled={!hasChanges || isSaving}
//                                 className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
//                             >
//                                 {isSaving ? (
//                                     <>
//                                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                                         Sauvegarde...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save className="h-4 w-4" />
//                                         Enregistrer
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     {/* Statistiques */}
//                     <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-6">
//                         <div className="rounded-xl bg-white p-6 shadow">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <Users className="h-5 w-5 text-blue-600" />
//                                 <TrendingUp className="h-4 w-4 text-green-500" />
//                             </div>
//                             <p className="text-2xl font-bold text-gray-900">
//                                 {stats.total_users}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                                 Utilisateurs
//                             </p>
//                         </div>

//                         <div className="rounded-xl bg-white p-6 shadow">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <Shield className="h-5 w-5 text-emerald-600" />
//                             </div>
//                             <p className="text-2xl font-bold text-gray-900">
//                                 {stats.total_practitioners}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                                 Tradipraticiens
//                             </p>
//                         </div>

//                         <div className="rounded-xl bg-white p-6 shadow">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <Check className="h-5 w-5 text-green-600" />
//                             </div>
//                             <p className="text-2xl font-bold text-gray-900">
//                                 {stats.verified_practitioners}
//                             </p>
//                             <p className="text-sm text-gray-600">Vérifiés</p>
//                         </div>

//                         <div className="rounded-xl bg-white p-6 shadow">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <Database className="h-5 w-5 text-purple-600" />
//                             </div>
//                             <p className="text-2xl font-bold text-gray-900">
//                                 {stats.total_posts}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                                 Publications
//                             </p>
//                         </div>

//                         <div className="rounded-xl bg-white p-6 shadow">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <Mail className="h-5 w-5 text-indigo-600" />
//                             </div>
//                             <p className="text-2xl font-bold text-gray-900">
//                                 {stats.total_messages}
//                             </p>
//                             <p className="text-sm text-gray-600">Messages</p>
//                         </div>

//                         <div className="rounded-xl bg-white p-6 shadow">
//                             <div className="mb-2 flex items-center justify-between">
//                                 <AlertCircle className="h-5 w-5 text-orange-600" />
//                             </div>
//                             <p className="text-2xl font-bold text-gray-900">
//                                 {stats.pending_verifications}
//                             </p>
//                             <p className="text-sm text-gray-600">En attente</p>
//                         </div>
//                     </div>

//                     {/* Tabs de navigation */}
//                     <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow">
//                         {groups.map((group) => {
//                             const Icon = group.icon;
//                             return (
//                                 <button
//                                     key={group.key}
//                                     onClick={() => setActiveTab(group.key)}
//                                     className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
//                                         activeTab === group.key
//                                             ? 'bg-emerald-600 text-white shadow-md'
//                                             : 'text-gray-600 hover:bg-gray-100'
//                                     }`}
//                                 >
//                                     <Icon className="h-4 w-4" />
//                                     {group.label}
//                                 </button>
//                             );
//                         })}
//                     </div>

//                     {/* Contenu des paramètres */}
//                     <div className="rounded-xl bg-white p-8 shadow">
//                         <div className="space-y-6">
//                             {settings[activeTab as keyof Settings] &&
//                                 Object.entries(
//                                     settings[
//                                         activeTab as keyof Settings
//                                     ] as any,
//                                 ).map(([key, setting]) => (
//                                     <div
//                                         key={key}
//                                         className="border-b border-gray-200 pb-6 last:border-b-0"
//                                     >
//                                         {renderField(setting as Setting, activeTab)}
//                                     </div>
//                                 ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </AdminLayout>
//     );
// }

/**
 * platform-settings.tsx
 * Page de paramétrage global de la plateforme Pharmacopee
 * Route : GET /admin/settings  → PlatformSettingsController@index
 *
 * Dépendances :
 *  - @inertiajs/react  (router, usePage)
 *  - lucide-react      (icônes)
 *  - Tailwind CSS
 */

import AdminLayout from '@/layouts/admin-layout';
import { router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    ChevronRight,
    Download,
    FileText,
    Globe,
    Info,
    Lock,
    RefreshCw,
    Save,
    Server,
    Settings,
    Shield,
    ToggleLeft,
    ToggleRight,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface SettingItem {
    key: string;
    value: string;
    type: 'text' | 'number' | 'boolean' | 'json' | 'textarea' | 'email';
    group: string;
    description: string;
    is_public: boolean;
}

interface GroupedSettings {
    [group: string]: {
        [key: string]: SettingItem;
    };
}

interface PlatformStats {
    total_users: number;
    total_practitioners: number;
    verified_practitioners: number;
    pending_verifications: number;
    total_posts: number;
    total_messages: number;
    new_users_today: number;
    posts_today: number;
}

interface SystemInfo {
    php_version: string;
    laravel_version: string;
    cache_driver: string;
    queue_driver: string;
    server_time: string;
}

interface PageProps {
    settings: GroupedSettings;
    stats: PlatformStats;
    systemInfo: SystemInfo;
    auth: { user: any };
    [key: string]: any;
}

// ─────────────────────────────────────────
// CONFIGURATION DES ONGLETS
// ─────────────────────────────────────────

const TAB_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    general: {
        label: 'Général',
        icon: <Globe className="w-4 h-4" />,
        color: 'emerald',
    },
    users: {
        label: 'Utilisateurs',
        icon: <Users className="w-4 h-4" />,
        color: 'blue',
    },
    content: {
        label: 'Contenu',
        icon: <FileText className="w-4 h-4" />,
        color: 'violet',
    },
    notifications: {
        label: 'Notifications',
        icon: <Bell className="w-4 h-4" />,
        color: 'amber',
    },
    security: {
        label: 'Sécurité',
        icon: <Shield className="w-4 h-4" />,
        color: 'red',
    },
};

// ─────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────

export default function PlatformSettings() {
    const { settings, stats, systemInfo, auth } = usePage<PageProps>().props;

    // Flash messages via Inertia
    const flash = (usePage<any>().props as any).flash ?? {};

    // Onglet actif
    const [activeTab, setActiveTab] = useState<string>('general');

    // Valeurs locales (copie éditable des settings)
    const [localSettings, setLocalSettings] = useState<GroupedSettings>(settings ?? {});

    // État de sauvegarde
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

    // Toast notification interne
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync settings quand Inertia rafraîchit la page
    useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    // Toast automatique depuis flash Inertia
    useEffect(() => {
        if (flash?.success) showToast('success', flash.success);
        if (flash?.error) showToast('error', flash.error);
    }, [flash]);

    // ──────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    };

    const getSettingValue = (group: string, key: string): string =>
        localSettings?.[group]?.[key]?.value ?? '';

    const getSettingType = (group: string, key: string): string =>
        localSettings?.[group]?.[key]?.type ?? 'text';

    const updateLocal = (group: string, key: string, value: string) => {
        setLocalSettings((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: {
                    ...prev[group][key],
                    value,
                },
            },
        }));
    };

    // ──────────────────────────────────────
    // TOGGLE RAPIDE (sans sauvegarder tout le groupe)
    // ──────────────────────────────────────

    const handleToggle = (group: string, key: string) => {
        const current = getSettingValue(group, key);
        const newVal = current === '1' ? '0' : '1';
        updateLocal(group, key, newVal);

        // Sauvegarde immédiate via PUT /admin/settings
        router.put(
            '/admin/settings',
            { key, value: newVal },
            {
                preserveScroll: true,
                onError: () => showToast('error', 'Erreur lors de la mise à jour.'),
            },
        );
    };

    // ──────────────────────────────────────
    // SAUVEGARDE PAR GROUPE (bouton Enregistrer)
    // ──────────────────────────────────────

    const handleSaveGroup = () => {
        setSaving(true);

        const groupData = localSettings[activeTab] ?? {};
        const payload: Record<string, string> = {};

        Object.entries(groupData).forEach(([key, item]) => {
            payload[key] = item.value;
        });

        router.post(
            '/admin/settings/batch',
            { settings: payload },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
                onError: () => showToast('error', 'Erreur lors de la sauvegarde.'),
            },
        );
    };

    // ──────────────────────────────────────
    // RESET
    // ──────────────────────────────────────

    const handleReset = () => {
        if (!confirm('Réinitialiser TOUS les paramètres aux valeurs par défaut ?')) return;
        setResetting(true);
        router.post('/admin/settings/reset', {}, {
            preserveScroll: true,
            onFinish: () => setResetting(false),
        });
    };

    // ──────────────────────────────────────
    // EXPORT
    // ──────────────────────────────────────

    const handleExport = () => {
        window.open('/admin/settings/export', '_blank');
    };

    // ──────────────────────────────────────
    // RENDER CHAMP SELON SON TYPE
    // ──────────────────────────────────────

    const renderField = (group: string, key: string, item: SettingItem) => {
        const value = item.value;
        const type  = item.type;

        if (type === 'boolean') {
            const isOn = value === '1';
            return (
                <button
                    type="button"
                    onClick={() => handleToggle(group, key)}
                    className="flex-shrink-0 focus:outline-none"
                    aria-label={isOn ? 'Désactiver' : 'Activer'}
                    title={isOn ? 'Activer' : 'Désactiver'}
                >
                    {isOn ? (
                        <ToggleRight className="w-9 h-9 text-emerald-500 transition-colors" />
                    ) : (
                        <ToggleLeft className="w-9 h-9 text-slate-400 transition-colors" />
                    )}
                </button>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    value={value}
                    onChange={(e) => updateLocal(group, key, e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800
                               focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none
                               resize-none transition-all"
                />
            );
        }

        const inputType = type === 'email' ? 'email' : type === 'number' ? 'number' : 'text';

        return (
            <input
                type={inputType}
                value={value}
                onChange={(e) => updateLocal(group, key, e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800
                           focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none
                           transition-all max-w-xs"
            />
        );
    };

    // ──────────────────────────────────────
    // CALCUL MODE MAINTENANCE
    // ──────────────────────────────────────

    const isMaintenanceOn =
        getSettingValue('general', 'maintenance_mode') === '1';

    // ─────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
                {/* ── TOAST ── */}
                {toast && (
                    <div
                        className={`animate-slide-in fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium shadow-xl transition-all ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                    >
                        {toast.type === 'success' ? '✅' : '❌'}
                        {toast.message}
                    </div>
                )}

                {/* ── BANNIÈRE MAINTENANCE ── */}
                {isMaintenanceOn && (
                    <div className="flex items-center gap-3 bg-amber-500 px-6 py-3 text-sm font-semibold text-white">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        <span>
                            ⚠️ Mode maintenance <strong>ACTIVÉ</strong> — Les
                            utilisateurs voient une page de maintenance.
                        </span>
                        <button
                            onClick={() =>
                                handleToggle('general', 'maintenance_mode')
                            }
                            className="ml-auto rounded-lg bg-white px-4 py-1 text-xs font-bold text-amber-600 transition-colors hover:bg-amber-100"
                        >
                            Désactiver
                        </button>
                    </div>
                )}

                <div className="mx-auto max-w-7xl px-4 py-8">
                    {/* ── EN-TÊTE ── */}
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                                <span>Administration</span>
                                <ChevronRight className="h-3 w-3" />
                                <span className="font-medium text-slate-600">
                                    Paramétrage
                                </span>
                            </div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                                <Settings className="h-6 w-6 text-emerald-600" />
                                Paramètres de la plateforme
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Configuration globale de Pharmacopee —
                                modifications appliquées en temps réel.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                            >
                                <Download className="h-4 w-4" />
                                Exporter
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={resetting}
                                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`}
                                />
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* ── STATISTIQUES RAPIDES ── */}
                    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <StatCard
                            label="Utilisateurs"
                            value={stats?.total_users ?? 0}
                            sub={`+${stats?.new_users_today ?? 0} aujourd'hui`}
                            color="blue"
                            icon={<Users className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Tradipraticiens"
                            value={stats?.total_practitioners ?? 0}
                            sub={`${stats?.verified_practitioners ?? 0} vérifiés`}
                            color="emerald"
                            icon={<Shield className="h-5 w-5" />}
                        />
                        <StatCard
                            label="Publications"
                            value={stats?.total_posts ?? 0}
                            sub={`+${stats?.posts_today ?? 0} aujourd'hui`}
                            color="violet"
                            icon={<FileText className="h-5 w-5" />}
                        />
                        <StatCard
                            label="En attente"
                            value={stats?.pending_verifications ?? 0}
                            sub="vérifications"
                            color="amber"
                            icon={<AlertTriangle className="h-5 w-5" />}
                        />
                    </div>

                    {/* ── CONTENU PRINCIPAL (Tabs + Formulaire) ── */}
                    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                        {/* Tabs navigation */}
                        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50">
                            {Object.entries(TAB_CONFIG).map(
                                ([group, config]) => {
                                    const isActive = activeTab === group;
                                    const exists = !!localSettings?.[group];
                                    if (!exists) return null;

                                    return (
                                        <button
                                            key={group}
                                            onClick={() => setActiveTab(group)}
                                            className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                                                isActive
                                                    ? 'border-emerald-500 bg-white text-emerald-700'
                                                    : 'border-transparent text-slate-500 hover:bg-white/60 hover:text-slate-700'
                                            }`}
                                        >
                                            {config.icon}
                                            {config.label}
                                        </button>
                                    );
                                },
                            )}

                            {/* Onglet Système */}
                            <button
                                onClick={() => setActiveTab('__system__')}
                                className={`ml-auto flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                                    activeTab === '__system__'
                                        ? 'border-slate-500 bg-white text-slate-700'
                                        : 'border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-600'
                                }`}
                            >
                                <Server className="h-4 w-4" />
                                Système
                            </button>
                        </div>

                        {/* Contenu de l'onglet actif */}
                        <div className="p-6">
                            {/* ── ONGLET SYSTÈME ── */}
                            {activeTab === '__system__' && (
                                <SystemInfoPanel systemInfo={systemInfo} />
                            )}

                            {/* ── ONGLETS PARAMÈTRES ── */}
                            {activeTab !== '__system__' &&
                                localSettings?.[activeTab] && (
                                    <>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                localSettings[activeTab],
                                            ).map(([key, item]) => (
                                                <SettingRow
                                                    key={key}
                                                    group={activeTab}
                                                    settingKey={key}
                                                    item={item}
                                                    renderField={renderField}
                                                />
                                            ))}
                                        </div>

                                        {/* Bouton Sauvegarder */}
                                        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                                            <p className="flex items-center gap-1 text-xs text-slate-400">
                                                <Info className="h-3.5 w-3.5" />
                                                Les toggles sont sauvegardés
                                                automatiquement. Utilisez le
                                                bouton pour les champs
                                                texte/nombre.
                                            </p>
                                            <button
                                                onClick={handleSaveGroup}
                                                disabled={saving}
                                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Save
                                                    className={`h-4 w-4 ${saving ? 'animate-pulse' : ''}`}
                                                />
                                                {saving
                                                    ? 'Enregistrement…'
                                                    : 'Enregistrer'}
                                            </button>
                                        </div>
                                    </>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// ─────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────

/** Carte stat */
function StatCard({
    label, value, sub, color, icon,
}: {
    label: string; value: number; sub: string;
    color: 'blue' | 'emerald' | 'violet' | 'amber'; icon: React.ReactNode;
}) {
    const colorMap = {
        blue:    'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        violet:  'bg-violet-50 text-violet-600 border-violet-100',
        amber:   'bg-amber-50 text-amber-600 border-amber-100',
    };

    return (
        <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-70">{label}</span>
                <span className="opacity-60">{icon}</span>
            </div>
            <div className="text-2xl font-bold">{value.toLocaleString('fr-FR')}</div>
            <div className="text-xs opacity-60 mt-0.5">{sub}</div>
        </div>
    );
}

/** Ligne d'un paramètre */
function SettingRow({
    group, settingKey, item, renderField,
}: {
    group: string;
    settingKey: string;
    item: SettingItem;
    renderField: (g: string, k: string, i: SettingItem) => React.ReactNode;
}) {
    const isBool = item.type === 'boolean';
    const isOn   = item.value === '1';

    return (
        <div
            className={`flex items-start justify-between gap-4 rounded-xl px-4 py-4 transition-colors
                ${isBool && isOn
                    ? 'bg-emerald-50/60 border border-emerald-100'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
        >
            {/* Libellé + description */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                        {formatKey(settingKey)}
                    </span>
                    {!item.is_public && (
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" /> Admin
                        </span>
                    )}
                </div>
                {item.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                )}
                <code className="text-[10px] text-slate-300 font-mono">{settingKey}</code>
            </div>

            {/* Champ */}
            <div className="flex-shrink-0">
                {renderField(group, settingKey, item)}
            </div>
        </div>
    );
}

/** Panneau informations système */
function SystemInfoPanel({ systemInfo }: { systemInfo: SystemInfo }) {
    if (!systemInfo) return null;
    const rows = [
        { label: 'Version PHP',     value: systemInfo.php_version },
        { label: 'Laravel',         value: systemInfo.laravel_version },
        { label: 'Driver cache',    value: systemInfo.cache_driver },
        { label: 'Driver queue',    value: systemInfo.queue_driver },
        { label: 'Heure serveur',   value: systemInfo.server_time },
    ];

    return (
        <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-500" />
                Informations système
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rows.map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-slate-500">{label}</span>
                        <code className="text-sm font-mono text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {value}
                        </code>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────

/** Transforme une clé snake_case en libellé lisible */
function formatKey(key: string): string {
    const labels: Record<string, string> = {
        maintenance_mode:            '🔧 Mode maintenance',
        allow_registration:          '🔓 Inscriptions ouvertes',
        email_verification_required: '📧 Vérification email obligatoire',
        auto_approve_practitioners:  '⚡ Approbation automatique des praticiens',
        min_age_registration:        '🔞 Âge minimum d\'inscription',
        max_post_length:             '📝 Longueur max d\'un post (caractères)',
        max_images_per_post:         '🖼️ Images max par post',
        max_image_size:              '📦 Taille max d\'une image (Ko)',
        moderation_enabled:          '🛡️ Modération du contenu',
        email_notifications_enabled: '📧 Notifications par email',
        push_notifications_enabled:  '🔔 Notifications push',
        max_login_attempts:          '🔐 Tentatives de connexion max',
        session_timeout:             '⏱️ Expiration de session (min)',
        two_factor_enabled:          '🔑 Authentification à deux facteurs',
        app_name:                    '🏷️ Nom de la plateforme',
        app_description:             '📄 Description de la plateforme',
        contact_email:               '✉️ Email de contact',
    };
    return labels[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}