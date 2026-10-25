import HeadingSmall from '@/components/heading-small';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable, show } from '@/routes/two-factor';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import {
    ShieldBan,
    ShieldCheck,
    Smartphone,
    AlertCircle,
    CheckCircle2,
    Lock,
    Key,
    Info,
} from 'lucide-react';
import { useState } from 'react';

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Authentification à deux facteurs',
        href: show.url(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();

    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            showRecentMessages={false}
            showCreatePostWidget={false}
            showLeftSidebar={false}
        >
            <Head title="Authentification à deux facteurs" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <HeadingSmall
                        title="Authentification à deux facteurs (2FA)"
                        description="Renforcez la sécurité de votre compte avec une couche de protection supplémentaire"
                    />

                    {/* Informations sur la 2FA */}
                    <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <Lock className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-emerald-900">
                                    Pourquoi activer l'authentification à deux
                                    facteurs ?
                                </h3>
                                <ul className="space-y-1 text-sm text-emerald-700">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>
                                            Protection contre les accès non
                                            autorisés même si votre mot de passe
                                            est compromis
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>
                                            Code unique généré sur votre
                                            appareil mobile
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                        <span>
                                            Compatible avec Google
                                            Authenticator, Authy et autres
                                            applications TOTP
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* État de la 2FA */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        {twoFactorEnabled ? (
                            <div className="space-y-6">
                                {/* Status activé */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                            <ShieldCheck className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Authentification à deux
                                                    facteurs activée
                                                </h3>
                                                <Badge className="bg-emerald-600">
                                                    Activée
                                                </Badge>
                                            </div>
                                            <p className="max-w-2xl text-sm text-gray-600">
                                                Votre compte est protégé par
                                                l'authentification à deux
                                                facteurs. Vous serez invité à
                                                saisir un code de sécurité lors
                                                de la connexion.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200" />

                                {/* Codes de récupération */}
                                <div>
                                    <div className="mb-4 flex items-center gap-2">
                                        <Key className="h-5 w-5 text-gray-600" />
                                        <h4 className="text-base font-semibold text-gray-900">
                                            Codes de récupération
                                        </h4>
                                    </div>
                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />
                                </div>

                                <div className="h-px bg-gray-200" />

                                {/* Désactiver */}
                                <div>
                                    <h4 className="mb-3 text-sm font-medium text-gray-900">
                                        Désactiver l'authentification à deux
                                        facteurs
                                    </h4>
                                    <p className="mb-4 text-sm text-gray-600">
                                        Vous pouvez désactiver la 2FA à tout
                                        moment, mais cela réduira la sécurité de
                                        votre compte.
                                    </p>
                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                <ShieldBan className="mr-2 h-4 w-4" />
                                                {processing
                                                    ? 'Désactivation...'
                                                    : 'Désactiver la 2FA'}
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Status désactivé */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                            <AlertCircle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Authentification à deux
                                                    facteurs désactivée
                                                </h3>
                                                <Badge
                                                    variant="destructive"
                                                    className="bg-red-600"
                                                >
                                                    Désactivée
                                                </Badge>
                                            </div>
                                            <p className="max-w-2xl text-sm text-gray-600">
                                                Activez l'authentification à
                                                deux facteurs pour ajouter une
                                                couche de sécurité
                                                supplémentaire à votre compte.
                                                Un code unique sera requis à
                                                chaque connexion.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200" />

                                {/* Instructions */}
                                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                    <div className="flex gap-3">
                                        <Smartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium text-blue-900">
                                                Comment activer la 2FA ?
                                            </h4>
                                            <ol className="list-inside list-decimal space-y-2 text-sm text-blue-700">
                                                <li>
                                                    Installez une application
                                                    d'authentification (Google
                                                    Authenticator, Authy, etc.)
                                                </li>
                                                <li>
                                                    Cliquez sur "Activer la 2FA"
                                                    ci-dessous
                                                </li>
                                                <li>
                                                    Scannez le QR code avec
                                                    votre application
                                                </li>
                                                <li>
                                                    Entrez le code généré pour
                                                    confirmer l'activation
                                                </li>
                                                <li>
                                                    Sauvegardez vos codes de
                                                    récupération en lieu sûr
                                                </li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>

                                {/* Activer */}
                                <div>
                                    {hasSetupData ? (
                                        <Button
                                            onClick={() =>
                                                setShowSetupModal(true)
                                            }
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Continuer la configuration
                                        </Button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={() =>
                                                setShowSetupModal(true)
                                            }
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    {processing
                                                        ? 'Activation...'
                                                        : 'Activer la 2FA'}
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Note de sécurité */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <Info className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-amber-900">
                                    Important
                                </h4>
                                <p className="mt-1 text-sm text-amber-700">
                                    Conservez vos codes de récupération dans un
                                    endroit sûr. Vous en aurez besoin si vous
                                    perdez l'accès à votre application
                                    d'authentification.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de configuration */}
                <TwoFactorSetupModal
                    isOpen={showSetupModal}
                    onClose={() => setShowSetupModal(false)}
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                    qrCodeSvg={qrCodeSvg}
                    manualSetupKey={manualSetupKey}
                    clearSetupData={clearSetupData}
                    fetchSetupData={fetchSetupData}
                    errors={errors}
                />
            </SettingsLayout>
        </AppLayout>
    );
}

// import InputError from '@/components/input-error';
// import { Button } from '@/components/ui/button';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
// } from '@/components/ui/dialog';
// import {
//     InputOTP,
//     InputOTPGroup,
//     InputOTPSlot,
// } from '@/components/ui/input-otp';
// import { useClipboard } from '@/hooks/use-clipboard';
// import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
// import { confirm } from '@/routes/two-factor';
// import { Form } from '@inertiajs/react';
// import { REGEXP_ONLY_DIGITS } from 'input-otp';
// import {
//     Check,
//     Copy,
//     Loader2,
//     ScanLine,
//     Smartphone,
//     Shield,
//     ArrowLeft,
//     ArrowRight,
//     CheckCircle2,
//     Info,
//     KeyRound,
// } from 'lucide-react';
// import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import AlertError from '@/components/alert-error';

// // Icône animée de scan
// function AnimatedScanIcon() {
//     return (
//         <div className="mb-4 rounded-full border border-emerald-200 bg-white p-1 shadow-lg">
//             <div className="relative overflow-hidden rounded-full border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 p-3">
//                 <div className="absolute inset-0 grid grid-cols-6 opacity-20">
//                     {Array.from({ length: 6 }, (_, i) => (
//                         <div
//                             key={`col-${i + 1}`}
//                             className="border-r border-emerald-300 last:border-r-0"
//                         />
//                     ))}
//                 </div>
//                 <div className="absolute inset-0 grid grid-rows-6 opacity-20">
//                     {Array.from({ length: 6 }, (_, i) => (
//                         <div
//                             key={`row-${i + 1}`}
//                             className="border-b border-emerald-300 last:border-b-0"
//                         />
//                     ))}
//                 </div>
//                 <ScanLine className="relative z-20 h-7 w-7 text-emerald-600" />
//             </div>
//         </div>
//     );
// }

// // Indicateur de progression (étapes)
// function StepIndicator({
//     currentStep,
//     totalSteps,
// }: {
//     currentStep: number;
//     totalSteps: number;
// }) {
//     return (
//         <div className="mb-6 flex items-center justify-center gap-2">
//             {Array.from({ length: totalSteps }, (_, i) => (
//                 <div
//                     key={i}
//                     className={`h-1.5 rounded-full transition-all duration-300 ${
//                         i < currentStep
//                             ? 'w-8 bg-emerald-600'
//                             : i === currentStep
//                               ? 'w-12 bg-emerald-600'
//                               : 'w-8 bg-gray-200'
//                     }`}
//                 />
//             ))}
//         </div>
//     );
// }

// // Étape 1: Scanner le QR Code
// function TwoFactorSetupStep({
//     qrCodeSvg,
//     manualSetupKey,
//     buttonText,
//     onNextStep,
//     errors,
// }: {
//     qrCodeSvg: string | null;
//     manualSetupKey: string | null;
//     buttonText: string;
//     onNextStep: () => void;
//     errors: string[];
// }) {
//     const [copiedText, copy] = useClipboard();
//     const [showManualSetup, setShowManualSetup] = useState(false);
//     const isCopied = copiedText === manualSetupKey;

//     return (
//         <>
//             {errors?.length ? (
//                 <AlertError errors={errors} />
//             ) : (
//                 <div className="w-full space-y-6">
//                     {/* Instructions avec icône */}
//                     <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
//                         <div className="flex gap-3">
//                             <Smartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
//                             <div className="flex-1">
//                                 <h4 className="mb-2 text-sm font-semibold text-blue-900">
//                                     Étape 1 : Scannez le QR code
//                                 </h4>
//                                 <ol className="space-y-1.5 text-sm text-blue-700">
//                                     <li className="flex items-start gap-2">
//                                         <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-900">
//                                             1
//                                         </span>
//                                         <span>
//                                             Ouvrez votre application
//                                             d'authentification
//                                         </span>
//                                     </li>
//                                     <li className="flex items-start gap-2">
//                                         <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-900">
//                                             2
//                                         </span>
//                                         <span>
//                                             Scannez le QR code ci-dessous
//                                         </span>
//                                     </li>
//                                     <li className="flex items-start gap-2">
//                                         <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-900">
//                                             3
//                                         </span>
//                                         <span>
//                                             Le compte sera ajouté
//                                             automatiquement
//                                         </span>
//                                     </li>
//                                 </ol>
//                             </div>
//                         </div>
//                     </div>

//                     {/* QR Code */}
//                     <div className="flex justify-center">
//                         <div className="relative">
//                             <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg">
//                                 <div className="aspect-square w-64">
//                                     {qrCodeSvg ? (
//                                         <div
//                                             dangerouslySetInnerHTML={{
//                                                 __html: qrCodeSvg,
//                                             }}
//                                             className="h-full w-full"
//                                         />
//                                     ) : (
//                                         <div className="flex h-full w-full items-center justify-center">
//                                             <div className="text-center">
//                                                 <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />
//                                                 <p className="text-sm text-gray-600">
//                                                     Génération du QR code...
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                             {/* Badge décoratif */}
//                             {qrCodeSvg && (
//                                 <div className="absolute -top-3 -right-3 rounded-full bg-emerald-600 p-2 shadow-lg">
//                                     <Shield className="h-4 w-4 text-white" />
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Bouton d'action principal */}
//                     <Button
//                         className="w-full bg-emerald-600 py-6 text-base font-medium hover:bg-emerald-700"
//                         onClick={onNextStep}
//                         disabled={!qrCodeSvg}
//                     >
//                         {buttonText}
//                         <ArrowRight className="ml-2 h-5 w-5" />
//                     </Button>

//                     {/* Séparateur avec option alternative */}
//                     <div className="relative flex items-center py-2">
//                         <div className="flex-1 border-t border-gray-300" />
//                         <button
//                             onClick={() => setShowManualSetup(!showManualSetup)}
//                             className="mx-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-600"
//                         >
//                             <KeyRound className="h-4 w-4" />
//                             {showManualSetup
//                                 ? 'Masquer'
//                                 : 'Configuration manuelle'}
//                         </button>
//                         <div className="flex-1 border-t border-gray-300" />
//                     </div>

//                     {/* Configuration manuelle (repliable) */}
//                     {showManualSetup && (
//                         <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
//                             <div className="flex items-center gap-2">
//                                 <Info className="h-4 w-4 text-gray-600" />
//                                 <p className="text-sm font-medium text-gray-900">
//                                     Impossible de scanner ? Entrez ce code
//                                     manuellement
//                                 </p>
//                             </div>

//                             <div className="flex items-stretch overflow-hidden rounded-lg border-2 border-gray-300 bg-white">
//                                 {!manualSetupKey ? (
//                                     <div className="flex w-full items-center justify-center p-4">
//                                         <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <input
//                                             type="text"
//                                             readOnly
//                                             value={manualSetupKey}
//                                             className="flex-1 bg-transparent px-4 py-3 font-mono text-sm text-gray-900 outline-none"
//                                         />
//                                         <button
//                                             onClick={() => copy(manualSetupKey)}
//                                             className={`flex items-center gap-2 border-l-2 border-gray-300 px-4 transition ${
//                                                 isCopied
//                                                     ? 'bg-emerald-100 text-emerald-700'
//                                                     : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
//                                             }`}
//                                         >
//                                             {isCopied ? (
//                                                 <>
//                                                     <Check className="h-4 w-4" />
//                                                     <span className="text-sm font-medium">
//                                                         Copié
//                                                     </span>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <Copy className="h-4 w-4" />
//                                                     <span className="text-sm font-medium">
//                                                         Copier
//                                                     </span>
//                                                 </>
//                                             )}
//                                         </button>
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </>
//     );
// }

// // Étape 2: Vérification du code
// function TwoFactorVerificationStep({
//     onClose,
//     onBack,
// }: {
//     onClose: () => void;
//     onBack: () => void;
// }) {
//     const [code, setCode] = useState<string>('');
//     const pinInputContainerRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         setTimeout(() => {
//             pinInputContainerRef.current?.querySelector('input')?.focus();
//         }, 100);
//     }, []);

//     return (
//         <Form
//             {...confirm.form()}
//             onSuccess={() => onClose()}
//             resetOnError
//             resetOnSuccess
//         >
//             {({
//                 processing,
//                 errors,
//             }: {
//                 processing: boolean;
//                 errors?: { confirmTwoFactorAuthentication?: { code?: string } };
//             }) => (
//                 <div className="w-full space-y-6">
//                     {/* Instructions */}
//                     <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
//                         <div className="flex gap-3">
//                             <Smartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
//                             <div className="flex-1">
//                                 <h4 className="mb-2 text-sm font-semibold text-emerald-900">
//                                     Étape 2 : Entrez le code de vérification
//                                 </h4>
//                                 <p className="text-sm text-emerald-700">
//                                     Ouvrez votre application d'authentification
//                                     et entrez le code à 6 chiffres qui s'affiche
//                                     pour TradipraNet.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Zone de saisie du code */}
//                     <div ref={pinInputContainerRef} className="space-y-4 py-4">
//                         <div className="flex flex-col items-center gap-4">
//                             <InputOTP
//                                 id="otp"
//                                 name="code"
//                                 maxLength={OTP_MAX_LENGTH}
//                                 onChange={setCode}
//                                 disabled={processing}
//                                 pattern={REGEXP_ONLY_DIGITS}
//                             >
//                                 <InputOTPGroup className="gap-3">
//                                     {Array.from(
//                                         { length: OTP_MAX_LENGTH },
//                                         (_, index) => (
//                                             <InputOTPSlot
//                                                 key={index}
//                                                 index={index}
//                                                 className="h-14 w-12 border-2 text-lg font-semibold"
//                                             />
//                                         ),
//                                     )}
//                                 </InputOTPGroup>
//                             </InputOTP>

//                             {/* Message d'erreur */}
//                             <InputError
//                                 message={
//                                     errors?.confirmTwoFactorAuthentication?.code
//                                 }
//                             />

//                             {/* Indicateur de progression */}
//                             {code.length > 0 &&
//                                 code.length < OTP_MAX_LENGTH && (
//                                     <p className="text-sm text-gray-500">
//                                         {code.length} / {OTP_MAX_LENGTH}{' '}
//                                         chiffres
//                                     </p>
//                                 )}

//                             {/* Message de succès potentiel */}
//                             {code.length === OTP_MAX_LENGTH && !processing && (
//                                 <div className="flex items-center gap-2 text-sm text-emerald-600">
//                                     <CheckCircle2 className="h-4 w-4" />
//                                     <span>Code complet</span>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Boutons d'action */}
//                     <div className="flex gap-3">
//                         <Button
//                             type="button"
//                             variant="outline"
//                             className="flex-1 border-2 py-6"
//                             onClick={onBack}
//                             disabled={processing}
//                         >
//                             <ArrowLeft className="mr-2 h-4 w-4" />
//                             Retour
//                         </Button>
//                         <Button
//                             type="submit"
//                             className="flex-1 bg-emerald-600 py-6 text-base font-medium hover:bg-emerald-700"
//                             disabled={
//                                 processing || code.length < OTP_MAX_LENGTH
//                             }
//                         >
//                             {processing ? (
//                                 <>
//                                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                                     Vérification...
//                                 </>
//                             ) : (
//                                 <>
//                                     <CheckCircle2 className="mr-2 h-5 w-5" />
//                                     Confirmer
//                                 </>
//                             )}
//                         </Button>
//                     </div>

//                     {/* Note d'aide */}
//                     <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
//                         <div className="flex gap-2">
//                             <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
//                             <p className="text-xs text-amber-700">
//                                 Le code change toutes les 30 secondes. Si le
//                                 code ne fonctionne pas, attendez le prochain
//                                 code.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </Form>
//     );
// }

// // Étape de succès
// function SuccessStep({ onClose }: { onClose: () => void }) {
//     return (
//         <div className="w-full space-y-6 py-4 text-center">
//             <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
//                 <CheckCircle2 className="h-10 w-10 text-emerald-600" />
//             </div>

//             <div>
//                 <h3 className="mb-2 text-xl font-semibold text-gray-900">
//                     Authentification activée avec succès !
//                 </h3>
//                 <p className="text-gray-600">
//                     Votre compte est maintenant protégé par l'authentification à
//                     deux facteurs.
//                 </p>
//             </div>

//             <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
//                 <p className="text-sm text-emerald-700">
//                     À partir de maintenant, vous devrez entrer un code de votre
//                     application d'authentification à chaque connexion.
//                 </p>
//             </div>

//             <Button
//                 onClick={onClose}
//                 className="w-full bg-emerald-600 py-6 text-base hover:bg-emerald-700"
//             >
//                 Terminer
//             </Button>
//         </div>
//     );
// }

// // Props du composant principal
// interface TwoFactorSetupModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     requiresConfirmation: boolean;
//     twoFactorEnabled: boolean;
//     qrCodeSvg: string | null;
//     manualSetupKey: string | null;
//     clearSetupData: () => void;
//     fetchSetupData: () => Promise<void>;
//     errors: string[];
// }

// // Composant principal
// export default function TwoFactorSetupModal({
//     isOpen,
//     onClose,
//     requiresConfirmation,
//     twoFactorEnabled,
//     qrCodeSvg,
//     manualSetupKey,
//     clearSetupData,
//     fetchSetupData,
//     errors,
// }: TwoFactorSetupModalProps) {
//     const [currentStep, setCurrentStep] = useState<
//         'scan' | 'verify' | 'success'
//     >('scan');

//     // Configuration du modal selon l'état
//     const modalConfig = useMemo<{
//         title: string;
//         description: string;
//         buttonText: string;
//         step: number;
//         totalSteps: number;
//     }>(() => {
//         if (currentStep === 'success' || twoFactorEnabled) {
//             return {
//                 title: 'Configuration terminée',
//                 description:
//                     'Votre authentification à deux facteurs est maintenant active',
//                 buttonText: 'Fermer',
//                 step: 2,
//                 totalSteps: 2,
//             };
//         }

//         if (currentStep === 'verify') {
//             return {
//                 title: 'Vérification du code',
//                 description: 'Confirmez que tout fonctionne correctement',
//                 buttonText: 'Continuer',
//                 step: 1,
//                 totalSteps: 2,
//             };
//         }

//         return {
//             title: "Activer l'authentification à deux facteurs",
//             description:
//                 'Sécurisez votre compte avec une protection supplémentaire',
//             buttonText: 'Continuer',
//             step: 0,
//             totalSteps: 2,
//         };
//     }, [twoFactorEnabled, currentStep]);

//     const handleModalNextStep = useCallback(() => {
//         if (requiresConfirmation) {
//             setCurrentStep('verify');
//             return;
//         }

//         setCurrentStep('success');
//         setTimeout(() => {
//             clearSetupData();
//             onClose();
//         }, 2000);
//     }, [requiresConfirmation, clearSetupData, onClose]);

//     const handleBack = useCallback(() => {
//         setCurrentStep('scan');
//     }, []);

//     const resetModalState = useCallback(() => {
//         setCurrentStep('scan');
//         if (twoFactorEnabled) {
//             clearSetupData();
//         }
//     }, [twoFactorEnabled, clearSetupData]);

//     useEffect(() => {
//         if (!isOpen) {
//             resetModalState();
//             return;
//         }

//         if (!qrCodeSvg) {
//             fetchSetupData();
//         }
//     }, [isOpen, qrCodeSvg, fetchSetupData, resetModalState]);

//     return (
//         <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//             <DialogContent className="max-w-lg">
//                 <DialogHeader className="space-y-3 text-center">
//                     <div className="flex justify-center">
//                         <AnimatedScanIcon />
//                     </div>
//                     <DialogTitle className="text-2xl">
//                         {modalConfig.title}
//                     </DialogTitle>
//                     <DialogDescription className="text-base">
//                         {modalConfig.description}
//                     </DialogDescription>
//                 </DialogHeader>

//                 {/* Indicateur de progression */}
//                 {!twoFactorEnabled && currentStep !== 'success' && (
//                     <StepIndicator
//                         currentStep={modalConfig.step}
//                         totalSteps={modalConfig.totalSteps}
//                     />
//                 )}

//                 {/* Contenu selon l'étape */}
//                 <div className="px-1">
//                     {currentStep === 'success' || twoFactorEnabled ? (
//                         <SuccessStep onClose={onClose} />
//                     ) : currentStep === 'verify' ? (
//                         <TwoFactorVerificationStep
//                             onClose={() => {
//                                 setCurrentStep('success');
//                                 setTimeout(() => {
//                                     onClose();
//                                 }, 2000);
//                             }}
//                             onBack={handleBack}
//                         />
//                     ) : (
//                         <TwoFactorSetupStep
//                             qrCodeSvg={qrCodeSvg}
//                             manualSetupKey={manualSetupKey}
//                             buttonText={modalConfig.buttonText}
//                             onNextStep={handleModalNextStep}
//                             errors={errors}
//                         />
//                     )}
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }