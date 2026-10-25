// login.tsx
import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { bgGradient, textColor } from '@/components/assets/assets';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Leaf,
    LoaderCircle,
    Shield,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    settings: { app_name: string };    
}

export default function Login({ status, canResetPassword, settings }: LoginProps) {
    return (
        <>
            <Head title="Se connecter" />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white">
                {/* Back Button */}
                <div className="absolute top-8 left-8">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
                        {/* <span>Retour à l'accueil</span> */}
                    </Link>
                </div>

                <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-6xl">
                        <div className="grid gap-8 overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
                            {/* Left Side - Branding */}
                            <div
                                className={`relative hidden lg:flex ${bgGradient} flex-col justify-between p-12`}
                            >
                                <div>
                                    <div className="mb-8 inline-block rounded-full bg-white/20 p-3 backdrop-blur-sm">
                                        <Leaf className="h-8 w-8 text-white" />
                                    </div>

                                    <h2 className="mb-4 text-4xl font-bold text-white">
                                        Bienvenue sur
                                        <br />
                                        {settings.app_name}
                                    </h2>

                                    <p className="mb-8 text-lg text-white/90">
                                        La plateforme qui connecte la sagesse
                                        ancestrale aux soins modernes
                                    </p>

                                    {/* Features List */}
                                    <div className="space-y-4">
                                        {[
                                            'Praticiens certifiés et vérifiés',
                                            'Consultations sécurisées',
                                            'Suivi personnalisé de vos soins',
                                            'Communauté bienveillante',
                                        ].map((feature, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3"
                                            >
                                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-white" />
                                                <span className="text-white/90">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-8">
                                    <div>
                                        <div className="text-3xl font-bold text-white">
                                            500+
                                        </div>
                                        <div className="text-sm text-white/80">
                                            Praticiens
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-white">
                                            10k+
                                        </div>
                                        <div className="text-sm text-white/80">
                                            Patients
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-white">
                                            98%
                                        </div>
                                        <div className="text-sm text-white/80">
                                            Satisfaction
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-white/20 pt-3 text-lg text-white/50">
                                    <div className="flex flex-wrap justify-center gap-x-10 gap-y-0">
                                        <Link
                                            href="/about"
                                            className="hover:text-white"
                                        >
                                            À propos
                                        </Link>
                                        <Link
                                            href="/help"
                                            className="hover:text-white"
                                        >
                                            Aide
                                        </Link>
                                        <Link
                                            href="/privacy"
                                            className="hover:text-white"
                                        >
                                            Confidentialité
                                        </Link>
                                        <Link
                                            href="/terms"
                                            className="hover:text-white"
                                        >
                                            Conditions
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Login Form */}
                            <div className="p-8 sm:p-12">
                                <div className="mx-auto max-w-md">
                                    {/* Mobile Logo */}
                                    <div className="mb-8 flex justify-center lg:hidden">
                                        <div
                                            className={`inline-block rounded-full ${bgGradient} p-3`}
                                        >
                                            <Leaf className="h-8 w-8 text-white" />
                                        </div>
                                    </div>

                                    <div className="mb-8 text-center lg:text-left">
                                        <h1 className="mb-2 text-3xl font-bold text-gray-900">
                                            Connexion
                                        </h1>
                                        <p className="text-gray-600">
                                            Accédez à votre espace personnel
                                        </p>
                                    </div>

                                    {/* Status Message */}
                                    {status && (
                                        <div className="mb-6 rounded-lg bg-green-50 p-4">
                                            <p className="text-sm text-green-800">
                                                {status}
                                            </p>
                                        </div>
                                    )}

                                    {/* Login Form */}
                                    <Form
                                        {...AuthenticatedSessionController.store.form()}
                                        resetOnSuccess={['password']}
                                        className="space-y-6"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                {/* Email Field */}
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="email"
                                                        className="text-sm font-medium text-gray-700"
                                                    >
                                                        Adresse e-mail
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        required
                                                        autoFocus
                                                        autoComplete="email"
                                                        placeholder="votre.email@example.com"
                                                        className="h-12 rounded-lg border-gray-300 transition focus:border-[#8B4513] focus:ring-[#8B4513]"
                                                    />
                                                    <InputError
                                                        message={errors.email}
                                                    />
                                                </div>

                                                {/* Password Field */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label
                                                            htmlFor="password"
                                                            className="text-sm font-medium text-gray-700"
                                                        >
                                                            Mot de passe
                                                        </Label>
                                                        {canResetPassword && (
                                                            <Link
                                                                href={request()}
                                                                className={`text-sm ${textColor} hover:underline`}
                                                            >
                                                                Mot de passe
                                                                oublié ?
                                                            </Link>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        required
                                                        autoComplete="current-password"
                                                        placeholder="••••••••"
                                                        className="h-12 rounded-lg border-gray-300 transition focus:border-[#8B4513] focus:ring-[#8B4513]"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.password
                                                        }
                                                    />
                                                </div>

                                                {/* Remember Me */}
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id="remember"
                                                        name="remember"
                                                        className="border-gray-300"
                                                    />
                                                    <Label
                                                        htmlFor="remember"
                                                        className="text-sm text-gray-700"
                                                    >
                                                        Se souvenir de moi
                                                    </Label>
                                                </div>

                                                {/* Submit Button */}
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className={`h-12 w-full ${bgGradient} text-lg font-semibold transition hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100`}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                                            Connexion...
                                                        </>
                                                    ) : (
                                                        'Se connecter'
                                                    )}
                                                </Button>

                                                {/* Divider */}
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-300"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="bg-white px-2 text-gray-500">
                                                            Nouveau sur
                                                            Pharmacopée ?
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Register Link */}
                                                <div className="text-center">
                                                    <Link
                                                        href={register()}
                                                        className={`inline-flex items-center gap-2 font-medium ${textColor} hover:underline`}
                                                    >
                                                        Créer un compte
                                                        <Shield className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </Form>

                                    {/* Trust Indicators */}
                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <p className="mb-3 text-center text-xs text-gray-500">
                                            Vos données sont sécurisées
                                        </p>
                                        <div className="flex items-center justify-center gap-4 text-gray-400">
                                            <Shield className="h-5 w-5" />
                                            <span className="text-xs">
                                                Chiffrement SSL
                                            </span>
                                            <span className="text-xs">•</span>
                                            <span className="text-xs">
                                                Conformité RGPD
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
