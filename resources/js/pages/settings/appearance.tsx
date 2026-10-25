// import { Head } from '@inertiajs/react';
// import { Sun } from 'lucide-react';

// import AppearanceTabs from '@/components/appearance-tabs';
// import HeadingSmall from '@/components/heading-small';
// import { type BreadcrumbItem } from '@/types';

// import AppLayout from '@/layouts/app-layout';
// import { edit as editAppearance } from '@/routes/appearance';

// const breadcrumbs: BreadcrumbItem[] = [
//     {
//         title: "Paramètres d'apparence",
//         href: editAppearance().url,
//     },
// ];

// export default function Appearance() {
//     return (
//         <AppLayout show showRecentMessages={false} showCreatePostWidget={false}>
//             <Head title="Paramètres d'apparence" />

//             <div className="mx-auto max-w-5xl space-y-6">
//                 {/* Header */}
//                 <div className="rounded-xl bg-white p-6 shadow">
//                     <HeadingSmall
//                         title="Paramètres d'apparence"
//                         description="Personnalisez l'apparence de votre interface"
//                     />
//                 </div>

//                 {/* Contenu principal */}
//                 <div className="rounded-xl bg-white p-6 shadow">
//                     <div className="space-y-6">
//                         {/* Section Thème */}
//                         <div>
//                             <h3 className="mb-4 text-lg font-semibold text-gray-900">
//                                 Thème de l'interface
//                             </h3>
//                             <p className="mb-6 text-sm text-gray-600">
//                                 Choisissez le thème qui vous convient le mieux
//                             </p>

//                             <AppearanceTabs />
//                         </div>

//                         {/* Informations supplémentaires */}
//                         <div className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
//                             <div className="flex gap-3">
//                                 <div className="flex-shrink-0">
//                                     <Sun className="h-5 w-5 text-emerald-600" />
//                                 </div>
//                                 <div>
//                                     <h4 className="text-sm font-medium text-emerald-900">
//                                         À propos des thèmes
//                                     </h4>
//                                     <p className="mt-1 text-sm text-emerald-700">
//                                         Le thème clair est optimisé pour la
//                                         journée, le thème sombre pour les
//                                         environnements peu éclairés, et le mode
//                                         système s'adapte automatiquement à vos
//                                         préférences système.
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }

import { Head } from '@inertiajs/react';
import { Info, Monitor, Moon, Sun } from 'lucide-react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Paramètres d'apparence",
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            showRecentMessages={false}
            showCreatePostWidget={false}
            showLeftSidebar={false}
        >
            <Head title="Paramètres d'apparence" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <HeadingSmall
                        title="Paramètres d'apparence"
                        description="Personnalisez l'apparence de votre interface"
                    />

                    {/* Aperçu des thèmes */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border-2 border-gray-200 bg-white p-4 text-center transition hover:border-emerald-500">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                <Sun className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">
                                Thème clair
                            </h3>
                            <p className="mt-1 text-xs text-gray-600">
                                Optimisé pour la journée
                            </p>
                        </div>

                        <div className="rounded-xl border-2 border-gray-200 bg-gray-900 p-4 text-center transition hover:border-emerald-500">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
                                <Moon className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-white">
                                Thème sombre
                            </h3>
                            <p className="mt-1 text-xs text-gray-400">
                                Parfait pour la nuit
                            </p>
                        </div>

                        <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-900 p-4 text-center transition hover:border-emerald-500">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                                <Monitor className="h-6 w-6 text-gray-700" />
                            </div>
                            <h3 className="font-semibold text-gray-900">
                                Système
                            </h3>
                            <p className="mt-1 text-xs text-gray-600">
                                S'adapte automatiquement
                            </p>
                        </div>
                    </div>

                    {/* Sélection du thème */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Thème de l'interface
                        </h3>
                        <p className="mb-6 text-sm text-gray-600">
                            Choisissez le thème qui vous convient le mieux
                        </p>

                        <AppearanceTabs />
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <Info className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="mb-2 text-sm font-semibold text-emerald-900">
                                    À propos des thèmes
                                </h4>
                                <div className="space-y-2 text-sm text-emerald-700">
                                    <p>
                                        <strong>Thème clair :</strong> Interface
                                        lumineuse optimisée pour une utilisation
                                        en journée ou dans des environnements
                                        bien éclairés.
                                    </p>
                                    <p>
                                        <strong>Thème sombre :</strong>{' '}
                                        Interface sombre qui réduit la fatigue
                                        oculaire dans les environnements peu
                                        éclairés et économise la batterie sur
                                        les écrans OLED.
                                    </p>
                                    <p>
                                        <strong>Mode système :</strong> S'adapte
                                        automatiquement aux préférences de votre
                                        système d'exploitation pour une
                                        expérience fluide.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conseils d'accessibilité */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <Sun className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-blue-900">
                                    Conseil d'accessibilité
                                </h4>
                                <p className="mt-1 text-sm text-blue-700">
                                    Le mode sombre peut être plus confortable
                                    pour les personnes sensibles à la lumière.
                                    Testez les différents thèmes pour trouver
                                    celui qui vous convient le mieux.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
