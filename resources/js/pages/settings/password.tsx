// import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
// import InputError from '@/components/input-error';
// import AppLayout from '@/layouts/app-layout';
// import SettingsLayout from '@/layouts/settings/layout';
// import { type BreadcrumbItem } from '@/types';
// import { Transition } from '@headlessui/react';
// import { Form, Head } from '@inertiajs/react';
// import { useRef } from 'react';

// import HeadingSmall from '@/components/heading-small';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { edit } from '@/routes/password';

// const breadcrumbs: BreadcrumbItem[] = [
//     {
//         title: 'Password settings',
//         href: edit().url,
//     },
// ];

// export default function Password() {
//     const passwordInput = useRef<HTMLInputElement>(null);
//     const currentPasswordInput = useRef<HTMLInputElement>(null);

//     return (
//         <AppLayout breadcrumbs={breadcrumbs}>
//             <Head title="Password settings" />

//             <SettingsLayout>
//                 <div className="space-y-6">
//                     <HeadingSmall
//                         title="Update password"
//                         description="Ensure your account is using a long, random password to stay secure"
//                     />

//                     <Form
//                         {...PasswordController.update.form()}
//                         options={{
//                             preserveScroll: true,
//                         }}
//                         resetOnError={[
//                             'password',
//                             'password_confirmation',
//                             'current_password',
//                         ]}
//                         resetOnSuccess
//                         onError={(errors) => {
//                             if (errors.password) {
//                                 passwordInput.current?.focus();
//                             }

//                             if (errors.current_password) {
//                                 currentPasswordInput.current?.focus();
//                             }
//                         }}
//                         className="space-y-6"
//                     >
//                         {({ errors, processing, recentlySuccessful }) => (
//                             <>
//                                 <div className="grid gap-2">
//                                     <Label htmlFor="current_password">
//                                         Current password
//                                     </Label>

//                                     <Input
//                                         id="current_password"
//                                         ref={currentPasswordInput}
//                                         name="current_password"
//                                         type="password"
//                                         className="mt-1 block w-full"
//                                         autoComplete="current-password"
//                                         placeholder="Current password"
//                                     />

//                                     <InputError
//                                         message={errors.current_password}
//                                     />
//                                 </div>

//                                 <div className="grid gap-2">
//                                     <Label htmlFor="password">
//                                         New password
//                                     </Label>

//                                     <Input
//                                         id="password"
//                                         ref={passwordInput}
//                                         name="password"
//                                         type="password"
//                                         className="mt-1 block w-full"
//                                         autoComplete="new-password"
//                                         placeholder="New password"
//                                     />

//                                     <InputError message={errors.password} />
//                                 </div>

//                                 <div className="grid gap-2">
//                                     <Label htmlFor="password_confirmation">
//                                         Confirm password
//                                     </Label>

//                                     <Input
//                                         id="password_confirmation"
//                                         name="password_confirmation"
//                                         type="password"
//                                         className="mt-1 block w-full"
//                                         autoComplete="new-password"
//                                         placeholder="Confirm password"
//                                     />

//                                     <InputError
//                                         message={errors.password_confirmation}
//                                     />
//                                 </div>

//                                 <div className="flex items-center gap-4">
//                                     <Button
//                                         disabled={processing}
//                                         data-test="update-password-button"
//                                     >
//                                         Save password
//                                     </Button>

//                                     <Transition
//                                         show={recentlySuccessful}
//                                         enter="transition ease-in-out"
//                                         enterFrom="opacity-0"
//                                         leave="transition ease-in-out"
//                                         leaveTo="opacity-0"
//                                     >
//                                         <p className="text-sm text-neutral-600">
//                                             Saved
//                                         </p>
//                                     </Transition>
//                                 </div>
//                             </>
//                         )}
//                     </Form>
//                 </div>
//             </SettingsLayout>
//         </AppLayout>
//     );
// }

import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Lock, Shield } from 'lucide-react';
import { useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres de mot de passe',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            showRecentMessages={false}
            showCreatePostWidget={false}
            showLeftSidebar={false}
        >
            <Head title="Paramètres de mot de passe" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <HeadingSmall
                        title="Modifier le mot de passe"
                        description="Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester sécurisé"
                    />

                    {/* Conseils de sécurité */}
                    <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-blue-900">
                                    Conseils pour un mot de passe sécurisé
                                </h3>
                                <ul className="space-y-1 text-sm text-blue-700">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>
                                            Au moins 8 caractères avec
                                            majuscules, minuscules et chiffres
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>
                                            Évitez les mots du dictionnaire et
                                            les informations personnelles
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>
                                            Utilisez un mot de passe unique pour
                                            ce compte
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de modification */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <Form
                            {...PasswordController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }
                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-6"
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="current_password"
                                            className="flex items-center gap-2"
                                        >
                                            <Lock className="h-4 w-4 text-gray-600" />
                                            Mot de passe actuel
                                        </Label>
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type="password"
                                            className="mt-1 block w-full"
                                            autoComplete="current-password"
                                            placeholder="Entrez votre mot de passe actuel"
                                        />
                                        <InputError
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="h-px bg-gray-200" />

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="flex items-center gap-2"
                                        >
                                            <Lock className="h-4 w-4 text-gray-600" />
                                            Nouveau mot de passe
                                        </Label>
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type="password"
                                            className="mt-1 block w-full"
                                            autoComplete="new-password"
                                            placeholder="Entrez votre nouveau mot de passe"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirmer le nouveau mot de passe
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            className="mt-1 block w-full"
                                            autoComplete="new-password"
                                            placeholder="Confirmez votre nouveau mot de passe"
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                        <Button
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            {processing
                                                ? 'Enregistrement...'
                                                : 'Enregistrer le mot de passe'}
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <div className="flex items-center gap-2 text-sm text-emerald-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>
                                                    Mot de passe enregistré avec
                                                    succès
                                                </span>
                                            </div>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>

                    {/* Note de sécurité */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-amber-900">
                                    Note de sécurité
                                </h4>
                                <p className="mt-1 text-sm text-amber-700">
                                    Si vous pensez que votre compte a été
                                    compromis, changez immédiatement votre mot
                                    de passe et activez l'authentification à
                                    deux facteurs pour plus de sécurité.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
