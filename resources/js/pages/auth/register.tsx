import { bgGradient } from '@/components/assets/assets';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Leaf,
    LoaderCircle,
    Shield,
    Stethoscope,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface AppSettings {
    app_name: string;
}

interface Specialization {
    id: number;
    name: string;
    slug: string;
    description: string;
}

interface RegisterProps {
    specializations?: Specialization[];
    errors?: Record<string, string>;
    settings: AppSettings;
}

export default function Register({
    specializations = [],
    errors = {},
    settings,
}: RegisterProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [accountType, setAccountType] = useState('user');
    const [selectedSpecializations, setSelectedSpecializations] = useState<
        number[]
    >([]);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        location: '',
        years_of_experience: '',
        bio: '',
    });

    const totalSteps = accountType === 'user' ? 2 : 3;

    const accountTypes = [
        {
            value: 'user',
            label: 'Utilisateur',
            description: 'Je cherche des conseils en médecine traditionnelle',
            icon: User,
            color: 'blue',
            steps: 2,
        },
        {
            value: 'practitioner',
            label: 'Tradipraticien',
            description: 'Je pratique la médecine traditionnelle',
            icon: Stethoscope,
            color: 'green',
            steps: 3,
        },
        // {
        //     value: 'expert',
        //     label: 'Expert',
        //     description: 'Je suis un expert reconnu (certification requise)',
        //     icon: Award,
        //     color: 'purple',
        //     steps: 3,
        // },
    ];

    const updateFormData = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const goToNextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const dataToSend: any = {
            account_type: accountType,
            full_name: formData.full_name,
            username: formData.username || null,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
        };

        if (accountType === 'practitioner' || accountType === 'expert') {
            dataToSend.phone = formData.phone;
            dataToSend.location = formData.location;
            dataToSend.years_of_experience = formData.years_of_experience;
            dataToSend.bio = formData.bio || '';
            dataToSend.specialization_ids = selectedSpecializations;
        }

        router.post('/register', dataToSend, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                console.error('Erreurs:', errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const ProgressIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                    (step) => (
                        <div key={step} className="flex flex-1 items-center">
                            <div className="flex w-full flex-col items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                                        step < currentStep
                                            ? 'bg-green-500 text-white'
                                            : step === currentStep
                                              ? 'bg-[#8B4513] text-white ring-4 ring-[#8B4513]/20'
                                              : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {step < currentStep ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        step
                                    )}
                                </div>
                                <span className="mt-2 text-xs font-medium text-gray-600">
                                    {step === 1
                                        ? 'Type'
                                        : step === 2
                                          ? 'Infos'
                                          : 'Pro'}
                                </span>
                            </div>
                            {step < totalSteps && (
                                <div
                                    className={`mx-2 h-1 flex-1 transition-all ${
                                        step < currentStep
                                            ? 'bg-green-500'
                                            : 'bg-gray-200'
                                    }`}
                                />
                            )}
                        </div>
                    ),
                )}
            </div>
        </div>
    );

    return (
        <>
            <Head title="Créer un compte" />

            <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white">
                {/* Back Button */}
                <div className="absolute top-8 left-8 z-10">
                    <a
                        href="/"
                        className="group flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
                        {/* <span>Retour à l'accueil</span> */}
                    </a>
                </div>

                <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-6xl">
                        <div className="grid gap-8 overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
                            {/* Left Side - Branding */}
                            <div
                                className={`relative hidden flex-col justify-between p-12 lg:flex ${bgGradient}`}
                            >
                                <div>
                                    <div className="mb-8 inline-block rounded-full bg-white/20 p-3 backdrop-blur-sm">
                                        <Leaf className="h-8 w-8 text-white" />
                                    </div>

                                    <h2 className="mb-4 text-4xl font-bold text-white">
                                        Rejoignez
                                        <br />
                                        {settings.app_name}
                                    </h2>

                                    <p className="mb-8 text-lg text-white/90">
                                        Connectez-vous à une communauté dédiée à
                                        la médecine traditionnelle
                                    </p>

                                    {/* Features List */}
                                    <div className="space-y-4">
                                        {[
                                            'Inscription simple et rapide',
                                            'Accès à des milliers de praticiens',
                                            'Plateforme sécurisée et confidentielle',
                                            'Support 24/7 disponible',
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
                                            Utilisateurs
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

                            {/* Right Side - Registration Form */}
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
                                            Créer un compte
                                        </h1>
                                        <p className="text-gray-600">
                                            Rejoignez la communauté
                                            PharmacopéeAI
                                        </p>
                                    </div>

                                    <ProgressIndicator />

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        {/* ÉTAPE 1 : Type de compte */}
                                        {currentStep === 1 && (
                                            <div className="space-y-6">
                                                <Label className="text-lg font-semibold text-gray-900">
                                                    Choisissez votre type de
                                                    compte
                                                </Label>

                                                <div className="space-y-3">
                                                    {accountTypes.map(
                                                        (type) => {
                                                            const Icon =
                                                                type.icon;
                                                            const isSelected =
                                                                accountType ===
                                                                type.value;

                                                            return (
                                                                <button
                                                                    key={
                                                                        type.value
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setAccountType(
                                                                            type.value,
                                                                        )
                                                                    }
                                                                    className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                                                                        isSelected
                                                                            ? 'border-[#8B4513] bg-[#FFF8F0] shadow-md'
                                                                            : 'border-gray-200 hover:border-gray-300 hover:shadow'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`rounded-lg p-2 ${isSelected ? 'bg-[#8B4513]/10' : 'bg-gray-100'}`}
                                                                    >
                                                                        <Icon
                                                                            className={`h-6 w-6 ${isSelected ? 'text-[#8B4513]' : 'text-gray-600'}`}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-gray-900">
                                                                            {
                                                                                type.label
                                                                            }
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-gray-600">
                                                                            {
                                                                                type.description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B4513]">
                                                                            <Check className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                                {errors.account_type && (
                                                    <p className="text-sm text-red-600">
                                                        {errors.account_type}
                                                    </p>
                                                )}

                                                <Button
                                                    type="button"
                                                    onClick={goToNextStep}
                                                    className={`h-12 w-full ${bgGradient} text-lg font-semibold transition hover:scale-[1.02] hover:shadow-xl`}
                                                >
                                                    Continuer
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* ÉTAPE 2 : Informations de base */}
                                        {currentStep === 2 && (
                                            <div className="space-y-6">
                                                <Label className="text-lg font-semibold text-gray-900">
                                                    Informations de base
                                                </Label>

                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="full_name">
                                                            Nom complet *
                                                        </Label>
                                                        <Input
                                                            id="full_name"
                                                            type="text"
                                                            value={
                                                                formData.full_name
                                                            }
                                                            onChange={(e) =>
                                                                updateFormData(
                                                                    'full_name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Dr. Jean Dupont"
                                                            required
                                                            className="h-12 border-gray-300 focus:border-[#8B4513] focus:ring-[#8B4513]"
                                                        />
                                                        {errors.full_name && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {
                                                                    errors.full_name
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="username">
                                                            Nom d'utilisateur
                                                            (optionnel)
                                                        </Label>
                                                        <Input
                                                            id="username"
                                                            type="text"
                                                            value={
                                                                formData.username
                                                            }
                                                            onChange={(e) =>
                                                                updateFormData(
                                                                    'username',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="@jeandupont"
                                                            className="h-12 border-gray-300 focus:border-[#8B4513] focus:ring-[#8B4513]"
                                                        />
                                                        {errors.username && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {
                                                                    errors.username
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="email">
                                                            Email *
                                                        </Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={
                                                                formData.email
                                                            }
                                                            onChange={(e) =>
                                                                updateFormData(
                                                                    'email',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="email@example.com"
                                                            required
                                                            className="h-12 border-gray-300 focus:border-[#8B4513] focus:ring-[#8B4513]"
                                                        />
                                                        {errors.email && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {errors.email}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="password">
                                                            Mot de passe *
                                                        </Label>
                                                        <Input
                                                            id="password"
                                                            type="password"
                                                            value={
                                                                formData.password
                                                            }
                                                            onChange={(e) =>
                                                                updateFormData(
                                                                    'password',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="••••••••"
                                                            required
                                                            className="h-12 border-gray-300 focus:border-[#8B4513] focus:ring-[#8B4513]"
                                                        />
                                                        {errors.password && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {
                                                                    errors.password
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="password_confirmation">
                                                            Confirmer le mot de
                                                            passe *
                                                        </Label>
                                                        <Input
                                                            id="password_confirmation"
                                                            type="password"
                                                            value={
                                                                formData.password_confirmation
                                                            }
                                                            onChange={(e) =>
                                                                updateFormData(
                                                                    'password_confirmation',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="••••••••"
                                                            required
                                                            className="h-12 border-gray-300 focus:border-[#8B4513] focus:ring-[#8B4513]"
                                                        />
                                                        {errors.password_confirmation && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {
                                                                    errors.password_confirmation
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <Button
                                                        type="button"
                                                        onClick={
                                                            goToPreviousStep
                                                        }
                                                        variant="outline"
                                                        className="h-12 flex-1"
                                                    >
                                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                                        Retour
                                                    </Button>

                                                    {accountType === 'user' ? (
                                                        <Button
                                                            type="submit"
                                                            className={`h-12 flex-1 ${bgGradient}`}
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            {processing && (
                                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Créer mon compte
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            onClick={
                                                                goToNextStep
                                                            }
                                                            className={`h-12 flex-1 ${bgGradient}`}
                                                        >
                                                            Continuer
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* ÉTAPE 3 : Informations professionnelles */}
                                        {currentStep === 3 &&
                                            accountType === 'practitioner' && (
                                                <div className="space-y-6">
                                                    <div className="rounded-xl border-2 border-[#8B4513]/20 bg-[#FFF8F0] p-6">
                                                        <Label className="text-lg font-semibold text-gray-900">
                                                            Informations
                                                            professionnelles
                                                        </Label>

                                                        <div className="mt-6 space-y-4">
                                                            <div>
                                                                <Label htmlFor="phone">
                                                                    Téléphone *
                                                                </Label>
                                                                <Input
                                                                    id="phone"
                                                                    type="tel"
                                                                    value={
                                                                        formData.phone
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateFormData(
                                                                            'phone',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="+226 70 12 34 56"
                                                                    required
                                                                    className="h-12"
                                                                />
                                                                {errors.phone && (
                                                                    <p className="mt-1 text-sm text-red-600">
                                                                        {
                                                                            errors.phone
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <Label htmlFor="location">
                                                                    Localisation
                                                                    *
                                                                </Label>
                                                                <Input
                                                                    id="location"
                                                                    type="text"
                                                                    value={
                                                                        formData.location
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateFormData(
                                                                            'location',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Ouagadougou, Burkina Faso"
                                                                    required
                                                                    className="h-12"
                                                                />
                                                                {errors.location && (
                                                                    <p className="mt-1 text-sm text-red-600">
                                                                        {
                                                                            errors.location
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <Label htmlFor="years_of_experience">
                                                                    Années
                                                                    d'expérience
                                                                    *
                                                                </Label>
                                                                <Input
                                                                    id="years_of_experience"
                                                                    type="number"
                                                                    value={
                                                                        formData.years_of_experience
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateFormData(
                                                                            'years_of_experience',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="15"
                                                                    min="0"
                                                                    max="100"
                                                                    required
                                                                    className="h-12"
                                                                />
                                                                {errors.years_of_experience && (
                                                                    <p className="mt-1 text-sm text-red-600">
                                                                        {
                                                                            errors.years_of_experience
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <Label htmlFor="bio">
                                                                    Bio /
                                                                    Description
                                                                </Label>
                                                                <textarea
                                                                    id="bio"
                                                                    value={
                                                                        formData.bio
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateFormData(
                                                                            'bio',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    rows={3}
                                                                    className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20"
                                                                    placeholder="Décrivez votre expertise..."
                                                                />
                                                                {errors.bio && (
                                                                    <p className="mt-1 text-sm text-red-600">
                                                                        {
                                                                            errors.bio
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button
                                                            type="button"
                                                            onClick={
                                                                goToPreviousStep
                                                            }
                                                            variant="outline"
                                                            className="h-12 flex-1"
                                                        >
                                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                                            Retour
                                                        </Button>

                                                        <Button
                                                            type="submit"
                                                            className={`h-12 flex-1 ${bgGradient}`}
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            {processing && (
                                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Créer mon compte
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                        {/* Lien vers login */}
                                        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
                                            Vous avez déjà un compte ?{' '}
                                            <TextLink href={login()}>
                                                Se connecter
                                            </TextLink>
                                        </div>
                                    </form>

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
