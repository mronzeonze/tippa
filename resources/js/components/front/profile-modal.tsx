import { ProfileModalProps } from '@/types/profile';
import { router } from '@inertiajs/react';
import { Loader2, Pencil, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { bgGradient } from '../assets/assets';

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
const ProfileModal = ({ user, setShowEdit, onUpdate }: ProfileModalProps) => {
    // États pour le formulaire
    const [editForm, setEditForm] = useState({
        full_name: user.full_name,
        username: user.username,
        bio: user.bio || '',
        location: user.location || '',
        profile_picture: null as File | null,
        cover_photo: null as File | null,
    });

    // État de chargement
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Previews des images
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // Image par défaut
    const defaultProfilePicture =
        'http://localhost:8000/storage/images/default-avatar.jpg';

    // Gérer la soumission du formulaire
    const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation basique
        if (!editForm.full_name.trim()) {
            toast.error('Le nom complet est requis');
            return;
        }

        if (!editForm.username.trim()) {
            toast.error("Le nom d'utilisateur est requis");
            return;
        }

        setIsSubmitting(true);

        // Créer FormData pour envoyer les fichiers
        const formData = new FormData();
        formData.append('full_name', editForm.full_name);
        formData.append('username', editForm.username);
        formData.append('bio', editForm.bio);
        formData.append('location', editForm.location);
        formData.append('_method', 'PUT'); // Pour Laravel

        if (editForm.profile_picture) {
            formData.append('profile_picture', editForm.profile_picture);
        }

        if (editForm.cover_photo) {
            formData.append('cover_photo', editForm.cover_photo);
        }

        // Envoyer avec Inertia
        router.post('/profile', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil mis à jour avec succès !');
                setShowEdit(false);
                if (onUpdate) onUpdate();
            },
            onError: (errors) => {
                console.error('Profile update errors:', errors);
                const errorMessage = Object.values(errors)[0] as string;
                toast.error(
                    errorMessage || 'Échec de la mise à jour du profil',
                );
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Gérer le changement de photo de profil
    const handleProfilePictureChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditForm({ ...editForm, profile_picture: file });
            setProfilePreview(URL.createObjectURL(file));
        }
    };

    // Gérer le changement de photo de couverture
    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditForm({ ...editForm, cover_photo: file });
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    // Fermer le modal
    const handleClose = () => {
        if (isSubmitting) return;
        setShowEdit(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-8 w-full max-w-2xl">
                <div className="relative rounded-xl bg-white p-6 shadow-xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Modifier le profil
                        </h1>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Formulaire */}
                    <form className="space-y-6" onSubmit={handleSaveProfile}>
                        {/* Photo de profil */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Photo de profil
                            </label>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="group relative">
                                    <img
                                        src={
                                            profilePreview ||
                                            user.profile_picture ||
                                            defaultProfilePicture
                                        }
                                        alt="Profile"
                                        className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-200"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                defaultProfilePicture;
                                        }}
                                    />
                                    <label
                                        htmlFor="profile_picture"
                                        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/40"
                                    >
                                        <Pencil className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="profile_picture"
                                        accept="image/jpeg,image/jpg,image/png,image/gif"
                                        hidden
                                        disabled={isSubmitting}
                                        onChange={handleProfilePictureChange}
                                    />
                                    <label
                                        htmlFor="profile_picture"
                                        className="inline-block cursor-pointer rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-500 hover:text-emerald-600"
                                    >
                                        Changer l'image
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        JPG, PNG ou GIF. Max 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Photo de couverture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Photo de couverture
                            </label>
                            <div className="mt-2">
                                <div className="group relative">
                                    <div className="h-40 overflow-hidden rounded-lg">
                                        {coverPreview || user.cover_photo ? (
                                            <img
                                                src={
                                                    coverPreview ||
                                                    user.cover_photo ||
                                                    ''
                                                }
                                                alt="Cover"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className={`h-full w-full ${bgGradient}`}
                                            />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="cover_photo"
                                        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/0 transition group-hover:bg-black/40"
                                    >
                                        <Pencil className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />
                                    </label>
                                </div>
                                <input
                                    type="file"
                                    id="cover_photo"
                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                    hidden
                                    disabled={isSubmitting}
                                    onChange={handleCoverPhotoChange}
                                />
                                <label
                                    htmlFor="cover_photo"
                                    className="mt-2 inline-block cursor-pointer rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-500 hover:text-emerald-600"
                                >
                                    Changer de couverture
                                </label>
                                <p className="mt-1 text-xs text-gray-500">
                                    JPG, PNG ou GIF. Max 5MB.
                                </p>
                            </div>
                        </div>

                        {/* Nom complet */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nom & Prénom (s){' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-lg border border-gray-300 p-3 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                placeholder="Enter your full name"
                                value={editForm.full_name}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        full_name: e.target.value,
                                    })
                                }
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nom d'utilisateur{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative mt-1">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                                    @
                                </span>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 p-3 pl-8 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                    placeholder="Entrez votre nom d'utilisateur"
                                    value={editForm.username}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            username: e.target.value,
                                        })
                                    }
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Bio
                            </label>
                            <textarea
                                rows={4}
                                className="mt-1 w-full rounded-lg border border-gray-300 p-3 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                placeholder="Parlez-nous de vous..."
                                value={editForm.bio}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        bio: e.target.value,
                                    })
                                }
                                disabled={isSubmitting}
                                maxLength={500}
                            />
                            <p className="mt-1 text-right text-xs text-gray-500">
                                {editForm.bio.length}/500 caractères
                            </p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Lieu de résidence
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-lg border border-gray-300 p-3 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                placeholder="D'où venez-vous ?"
                                value={editForm.location}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        location: e.target.value,
                                    })
                                }
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex justify-end gap-3 border-t pt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="rounded-lg border-2 border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 rounded-lg ${bgGradient} px-6 py-2 text-sm font-medium text-white transition hover:from-emerald-600 hover:to-green-700 disabled:opacity-50`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Chargement...
                                    </>
                                ) : (
                                    'Enregistrer les modifications'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
