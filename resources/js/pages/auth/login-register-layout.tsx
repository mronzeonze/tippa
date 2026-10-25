import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { bgGradient } from '@/components/assets/assets';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { request } from '@/routes/password';
import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function LoginRegisterLayout({ canResetPassword }: LoginProps) {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 font-sans">
            <style>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
        
        body {
          font-family: 'Montserrat', sans-serif;
        }
        
        .social-icon {
          border: 1px solid #ddd;
          border-radius: 50%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          margin: 0 5px;
          height: 40px;
          width: 40px;
          transition: all 0.3s ease;
          color: #666;
        }
        
        .social-icon:hover {
          border-color: #FF4B2B;
          color: #FF4B2B;
        }
      `}</style>

            {status && (
                <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                    {status}
                </div>
            )}

            <div
                className={`relative min-h-[600px] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-700`}
            >
                {/* Sign In Form */}
                <div
                    className={`absolute top-0 left-0 flex h-full w-1/2 items-center justify-center bg-white transition-all duration-700 ease-in-out ${isSignUp ? 'translate-x-full' : 'translate-x-0'} z-20`}
                >
                    <div className="flex w-full flex-col items-center justify-center px-12 text-center">
                        <h1 className="mb-5 text-3xl font-bold">Connexion</h1>
                        <Form
                            {...AuthenticatedSessionController.store.form()}
                            resetOnSuccess={['password']}
                            className="flex w-full flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email"></Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Mot de passe"
                                            />
                                            <div className="flex items-center">
                                                <Label htmlFor="password"></Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-sm"
                                                        tabIndex={5}
                                                    >
                                                        Mot de passe oublié?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember">
                                                Se souvenir de moi
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className={`mt-4 w-full ${bgGradient}`}
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            )}
                                            Se connecter
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* Sign Up Form */}
                <div
                    className={`absolute top-0 left-0 flex h-full w-1/2 items-center justify-center bg-white transition-all duration-700 ease-in-out ${isSignUp ? 'z-50 translate-x-full opacity-100' : 'z-10 translate-x-0 opacity-0'}`}
                >
                    <div className="flex w-full flex-col items-center justify-center px-12 text-center">
                        <h1 className="mb-5 text-3xl font-bold">
                            Créer un compte
                        </h1>

                        <div className="my-5 flex gap-3">
                            <a
                                href="#"
                                className="social-icon"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a
                                href="#"
                                className="social-icon"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-google-plus-g"></i>
                            </a>
                            <a
                                href="#"
                                className="social-icon"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                        </div>

                        <span className="mb-4 text-xs">
                            ou utilisez votre email pour l'inscription
                        </span>
                        <Form
                            {...RegisteredUserController.store.form()}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                            disableWhileProcessing
                            className="flex w-full flex-col"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="full_name"></Label>
                                            <Input
                                                id="full_name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="full_name"
                                                placeholder="Nom complet"
                                            />
                                            <InputError
                                                message={errors.full_name}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email"></Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password"></Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Mot de passe"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation"></Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Confirmer le mot de passe"
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className={`mt-2 w-full ${bgGradient}`}
                                            tabIndex={5}
                                            data-test="register-user-button"
                                        >
                                            {processing && (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            )}
                                            Créer un compte
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* Overlay Container */}
                <div
                    className={`absolute top-0 left-1/2 z-[100] h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}
                >
                    <div
                        className={`relative -left-full h-full w-[200%] ${bgGradient} bg-cover bg-no-repeat transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}
                    >
                        {/* Overlay Left */}
                        <div
                            className={`absolute top-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}
                        >
                            <h1 className="mb-5 text-3xl font-bold text-white">
                                Bienvenue!
                            </h1>
                            <p className="my-5 text-sm leading-5 font-light tracking-wide text-white">
                                Pour rester connecté avec nous, veuillez vous
                                connecter avec vos informations personnelles
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(false);
                                    // setStatus('');
                                }}
                                className="rounded-full border-2 border-white bg-transparent px-11 py-3 text-xs font-bold tracking-wider text-white uppercase transition-transform duration-75 hover:scale-95 active:scale-90"
                            >
                                Se connecter
                            </button>
                        </div>

                        {/* Overlay Right */}
                        <div
                            className={`absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-10 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}`}
                        >
                            <h1 className="mb-5 text-3xl font-bold text-white">
                                Bonjour, Ami!
                            </h1>
                            <p className="my-5 text-sm leading-5 font-light tracking-wide text-white">
                                Entrez vos informations personnelles et
                                commencez votre aventure avec nous
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(true);
                                    // setStatus('');
                                }}
                                className="rounded-full border-2 border-white bg-transparent px-11 py-3 text-xs font-bold tracking-wider text-white uppercase transition-transform duration-75 hover:scale-95 active:scale-90"
                            >
                                S'inscrire
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Font Awesome Icons */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
        </div>
    );
}
