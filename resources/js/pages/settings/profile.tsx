// import DeleteUser from '@/components/delete-user';
// import HeadingSmall from '@/components/heading-small';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import AppLayout from '@/layouts/app-layout';
// import SettingsLayout from '@/layouts/settings/layout';
// import { edit } from '@/routes/profile';
// import { formDataToObject } from '@/src/utils/forms';
// import { type BreadcrumbItem, type SharedData } from '@/types';
// import { Head, Link, router, usePage } from '@inertiajs/react';
// import Switch from '@mui/material/Switch';
// import {
//     Briefcase,
//     Check,
//     CheckCircle,
//     Clock,
//     DollarSign,
//     Globe,
//     GraduationCap,
//     Loader2,
//     MapPin,
//     PlusCircle,
//     Settings as SettingsIcon,
//     User,
//     X,
// } from 'lucide-react';
// import { useState } from 'react';
// import toast from 'react-hot-toast';

// const breadcrumbs: BreadcrumbItem[] = [
//     {
//         title: 'Paramètres de compte',
//         href: edit().url,
//     },
// ];

// interface Specialization {
//     id: number;
//     name: string;
//     slug: string;
//     description?: string;
//     icon?: string;
// }

// interface ProfileSettingsProps {
//     user?: any;
//     specializations: Specialization[];
//     userSpecializationIds: number[];
//     completion_percentage?: number;
//     missing_fields?: string[];
//     is_practitioner?: boolean;
//     mustVerifyEmail: boolean;
//     status?: string;
// }

// export default function ProfileSettings({
//     mustVerifyEmail,
//     specializations,
//     userSpecializationIds,
//     status,
// }: ProfileSettingsProps) {
//     const {
//         auth,
//         user,
//         completion_percentage,
//         missing_fields,
//         is_practitioner,
//     } = usePage<SharedData & ProfileSettingsProps>().props;

//     const [activeSection, setActiveSection] = useState<string>('personal');
//     const [onlineConsultationAvailable, setOnlineConsultationAvailable] =
//         useState(user.online_consultation_available || false);
//     const [homeConsultationAvailable, setHomeConsultationAvailable] = useState(
//         user.home_consultation_available || false,
//     );
//     const [acceptsEmergency, setAcceptsEmergency] = useState(
//         user.accepts_emergency || false,
//     );

//     // Specialization states
//     const [selectedSpecializations, setSelectedSpecializations] = useState<
//         number[]
//     >(userSpecializationIds || []);
//     const [proficiencyLevels, setProficiencyLevels] = useState<
//         Record<number, string>
//     >(() => {
//         const levels: Record<number, string> = {};
//         userSpecializationIds.forEach((id) => {
//             levels[id] = 'intermediate';
//         });
//         return levels;
//     });

//     // Training states
//     const [trainings, setTrainings] = useState(user.trainings || []);
//     const [degrees, setDegrees] = useState(user.degrees || []);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // Preferences states
//     const [preferences, setPreferences] = useState({
//         preferred_language: user.preferred_language || 'fr',
//         email_notifications_enabled: user.email_notifications_enabled ?? true,
//         push_notifications_enabled: user.push_notifications_enabled ?? true,
//         message_notifications_enabled:
//             user.message_notifications_enabled ?? true,
//         is_searchable: user.is_searchable ?? true,
//         is_private: user.is_private || false,
//         show_phone_on_profile: user.show_phone_on_profile ?? true,
//     });

//     const sections = [
//         {
//             id: 'personal',
//             label: 'Informations personnelles',
//             icon: User,
//             available: true,
//         },
//         {
//             id: 'location',
//             label: 'Localisation',
//             icon: MapPin,
//             available: true,
//         },
//         {
//             id: 'professional',
//             label: 'Informations professionnelles',
//             icon: Briefcase,
//             available: is_practitioner,
//         },
//         {
//             id: 'specialisation',
//             label: 'Spécialisation',
//             icon: Briefcase,
//             available: is_practitioner,
//         },
//         {
//             id: 'pricing',
//             label: 'Tarifs',
//             icon: DollarSign,
//             available: is_practitioner,
//         },
//         {
//             id: 'availability',
//             label: 'Disponibilités',
//             icon: Clock,
//             available: is_practitioner,
//         },
//         {
//             id: 'trainings',
//             label: 'Formations',
//             icon: GraduationCap,
//             available: is_practitioner,
//         },
//         {
//             id: 'social',
//             label: 'Réseaux sociaux',
//             icon: Globe,
//             available: true,
//         },
//         {
//             id: 'preferences',
//             label: 'Préférences',
//             icon: SettingsIcon,
//             available: true,
//         },
//     ].filter((section) => section.available);

//     const proficiencyOptions = [
//         {
//             value: 'beginner',
//             label: 'Débutant',
//             color: 'bg-blue-100 text-blue-700',
//         },
//         {
//             value: 'intermediate',
//             label: 'Intermédiaire',
//             color: 'bg-green-100 text-green-700',
//         },
//         {
//             value: 'advanced',
//             label: 'Avancé',
//             color: 'bg-orange-100 text-orange-700',
//         },
//         {
//             value: 'expert',
//             label: 'Expert',
//             color: 'bg-purple-100 text-purple-700',
//         },
//     ];

//     // Handlers
//     const toggleSpecialization = (id: number) => {
//         setSelectedSpecializations((prev) => {
//             if (prev.includes(id)) {
//                 const newLevels = { ...proficiencyLevels };
//                 delete newLevels[id];
//                 setProficiencyLevels(newLevels);
//                 return prev.filter((specId) => specId !== id);
//             } else {
//                 setProficiencyLevels((prev) => ({
//                     ...prev,
//                     [id]: 'intermediate',
//                 }));
//                 return [...prev, id];
//             }
//         });
//     };

//     const updateProficiencyLevel = (id: number, level: string) => {
//         setProficiencyLevels((prev) => ({ ...prev, [id]: level }));
//     };

//     const handlePersonalInfoUpdate = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);
//         const data = formDataToObject(formData);
//         router.post('/profile/update-personal-info', data, {
//             preserveScroll: true,
//             onSuccess: () => toast.success('Informations mises à jour'),
//         });
//     };

//     const handleLocationUpdate = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);
//         const data = formDataToObject(formData);
//         router.post('/profile/update-location', data, {
//             preserveScroll: true,
//             onSuccess: () => toast.success('Localisation mise à jour'),
//         });
//     };

//     const handleProfessionalUpdate = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);
//         const data = formDataToObject(formData);
//         router.post('/profile/update-professional-info', data, {
//             preserveScroll: true,
//             onSuccess: () =>
//                 toast.success('Informations professionnelles mises à jour'),
//         });
//     };

//     const handleSpecializationUpdate = (
//         e: React.FormEvent<HTMLFormElement>,
//     ) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);
//         const data = formDataToObject(formData);
//         router.post('/profile/update-specialization', data, {
//             preserveScroll: true,
//             onSuccess: () => toast.success('Spécialisations mises à jour'),
//         });
//     };

//     const handlePricingUpdate = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);
//         const data = formDataToObject(formData);
//         router.post('/profile/update-pricing', data, {
//             preserveScroll: true,
//             onSuccess: () => toast.success('Tarifs mis à jour'),
//         });
//     };

//     const handleSocialMediaUpdate = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);
//         const data = formDataToObject(formData);
//         router.post('/profile/update-social-media', data, {
//             preserveScroll: true,
//             onSuccess: () => toast.success('Réseaux sociaux mis à jour'),
//         });
//     };

//     const handleAvailabilityUpdate = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);

//         const availabilitySchedule = [
//             'Lundi',
//             'Mardi',
//             'Mercredi',
//             'Jeudi',
//             'Vendredi',
//             'Samedi',
//             'Dimanche',
//         ].map((day, index) => {
//             const active =
//                 formData.get(`availability[${index}][active]`) === 'on';
//             const startTime = formData.get(
//                 `availability[${index}][start_time]`,
//             ) as string;
//             const endTime = formData.get(
//                 `availability[${index}][end_time]`,
//             ) as string;

//             return {
//                 day: day,
//                 open: active,
//                 slots:
//                     active && startTime && endTime
//                         ? [{ start: startTime, end: endTime }]
//                         : [],
//             };
//         });

//         const data_save = {
//             availability_schedule: availabilitySchedule,
//             consultation_duration_minutes: formData.get(
//                 'consultation_duration_minutes',
//             ),
//             accepts_emergencies: acceptsEmergency,
//             online_consultation_available: onlineConsultationAvailable,
//             home_consultation_available: homeConsultationAvailable,
//         };

//         router.post('/profile/update-availability', data_save, {
//             preserveScroll: true,
//             onSuccess: () => toast.success('Disponibilités mises à jour'),
//             onError: (errors) => {
//                 console.error('Validation errors:', errors);
//                 toast.error('Erreur lors de la mise à jour');
//             },
//         });
//     };

//     const updatePreference = (key: string, value: boolean | string) => {
//         setPreferences((prev) => ({ ...prev, [key]: value }));
//     };

//     const handlePreferenceUpdate = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         router.post('/profile/update-preferences', preferences, {
//             preserveScroll: true,
//             onSuccess: () => toast.success('Préférences mises à jour'),
//         });
//     };

//     const addTraining = () => {
//         setTrainings([
//             ...trainings,
//             { title: '', institution: '', year: '', certificate_url: '' },
//         ]);
//     };

//     const removeTraining = (index: number) => {
//         setTrainings(trainings.filter((_: any, i: number) => i !== index));
//     };

//     const updateTraining = (index: number, field: string, value: any) => {
//         const updatedTrainings = [...trainings];
//         updatedTrainings[index][field] = value;
//         setTrainings(updatedTrainings);
//     };

//     const addDegree = () => {
//         setDegrees([...degrees, { title: '', institution: '', year: '' }]);
//     };

//     const removeDegree = (index: number) => {
//         setDegrees(degrees.filter((_: any, i: number) => i !== index));
//     };

//     const updateDegree = (index: number, field: string, value: any) => {
//         const updatedDegrees = [...degrees];
//         updatedDegrees[index][field] = value;
//         setDegrees(updatedDegrees);
//     };

//     const handleTrainingsUpdate = async (
//         e: React.FormEvent<HTMLFormElement>,
//     ) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         router.post(
//             '/profile/update-trainings',
//             {
//                 trainings: trainings.filter((t: any) => t.title.trim() !== ''),
//                 degrees: degrees.filter((d: any) => d.title.trim() !== ''),
//             },
//             {
//                 preserveScroll: true,
//                 onSuccess: () =>
//                     toast.success('Formations mises à jour avec succès'),
//                 onError: (errors) => {
//                     toast.error('Erreur lors de la mise à jour');
//                     console.error(errors);
//                 },
//                 onFinish: () => setIsSubmitting(false),
//             },
//         );
//     };

//     return (
//         <AppLayout
//             breadcrumbs={breadcrumbs}
//             showRecentMessages={false}
//             showCreatePostWidget={false}
//             showLeftSidebar={false}
//         >
//             <Head title="Paramètres de compte" />

//             <SettingsLayout>
//                 <div className="space-y-6">
//                     {/* Barre de progression du profil */}
//                     {completion_percentage !== undefined && (
//                         <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-6">
//                             <div className="mb-3 flex items-center justify-between">
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900">
//                                         Complétion du profil
//                                     </h3>
//                                     <p className="text-sm text-gray-600">
//                                         {completion_percentage}% complété
//                                     </p>
//                                 </div>
//                                 {completion_percentage === 100 && (
//                                     <CheckCircle className="h-8 w-8 text-emerald-600" />
//                                 )}
//                             </div>

//                             <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
//                                 <div
//                                     className="absolute h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
//                                     style={{
//                                         width: `${completion_percentage}%`,
//                                     }}
//                                 />
//                             </div>

//                             {missing_fields && missing_fields.length > 0 && (
//                                 <div className="mt-4">
//                                     <p className="mb-2 text-sm text-gray-700">
//                                         Champs à remplir pour un profil complet
//                                         :
//                                     </p>
//                                     <div className="flex flex-wrap gap-2">
//                                         {missing_fields.map((field) => (
//                                             <span
//                                                 key={field}
//                                                 className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
//                                             >
//                                                 {field}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Navigation des sections */}
//                     <div className="rounded-xl border border-gray-200 bg-white p-4">
//                         <div className="flex gap-2 overflow-x-auto pb-2">
//                             {sections.map((section) => {
//                                 const Icon = section.icon;
//                                 return (
//                                     <button
//                                         key={section.id}
//                                         onClick={() =>
//                                             setActiveSection(section.id)
//                                         }
//                                         className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium whitespace-nowrap transition-all ${
//                                             activeSection === section.id
//                                                 ? 'bg-emerald-600 text-white shadow-md'
//                                                 : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
//                                         }`}
//                                     >
//                                         <Icon className="h-4 w-4" />
//                                         <span className="text-sm">
//                                             {section.label}
//                                         </span>
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     </div>

//                     {/* Contenu des sections */}
//                     <div className="rounded-xl border border-gray-200 bg-white p-6">
//                         {/* Section : Informations personnelles */}
//                         {activeSection === 'personal' && (
//                             <div className="space-y-6">
//                                 <HeadingSmall
//                                     title="Informations personnelles"
//                                     description="Mise à jour de vos informations de base"
//                                 />

//                                 <form
//                                     onSubmit={handlePersonalInfoUpdate}
//                                     className="space-y-6"
//                                 >
//                                     <div className="grid gap-4 md:grid-cols-2">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="full_name">
//                                                 Nom complet *
//                                             </Label>
//                                             <Input
//                                                 id="full_name"
//                                                 name="full_name"
//                                                 defaultValue={user.full_name}
//                                                 required
//                                                 placeholder="Votre nom complet"
//                                             />
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="username">
//                                                 Nom d'utilisateur *
//                                             </Label>
//                                             <Input
//                                                 id="username"
//                                                 name="username"
//                                                 defaultValue={user.username}
//                                                 required
//                                                 placeholder="@votre_username"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="grid gap-2">
//                                         <Label htmlFor="bio">Biographie</Label>
//                                         <Textarea
//                                             id="bio"
//                                             name="bio"
//                                             defaultValue={user?.bio || ''}
//                                             rows={4}
//                                             placeholder="Parlez-nous de vous..."
//                                             maxLength={500}
//                                         />
//                                         <p className="text-xs text-gray-500">
//                                             {user?.bio?.length || 0}/500
//                                             caractères
//                                         </p>
//                                     </div>

//                                     <div className="grid gap-4 md:grid-cols-3">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="phone">
//                                                 Téléphone mobile *
//                                             </Label>
//                                             <Input
//                                                 id="phone"
//                                                 name="phone"
//                                                 type="tel"
//                                                 defaultValue={user.phone}
//                                                 required
//                                                 placeholder="+226 XX XX XX XX"
//                                             />
//                                         </div>
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="phone_secondary">
//                                                 Téléphone bureau
//                                             </Label>
//                                             <Input
//                                                 id="phone_secondary"
//                                                 name="phone_secondary"
//                                                 type="tel"
//                                                 defaultValue={
//                                                     user.phone_secondary
//                                                 }
//                                                 placeholder="+226 XX XX XX XX"
//                                             />
//                                         </div>
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="whatsapp">
//                                                 WhatsApp
//                                             </Label>
//                                             <Input
//                                                 id="whatsapp"
//                                                 name="whatsapp"
//                                                 type="tel"
//                                                 defaultValue={user.whatsapp}
//                                                 placeholder="+226 XX XX XX XX"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="grid gap-4 md:grid-cols-4">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="email">
//                                                 Email *
//                                             </Label>
//                                             <Input
//                                                 id="email"
//                                                 name="email"
//                                                 type="email"
//                                                 defaultValue={user.email}
//                                                 required
//                                             />
//                                             {mustVerifyEmail &&
//                                                 !user.email_verified_at && (
//                                                     <p className="text-sm text-muted-foreground">
//                                                         Email non vérifié.{' '}
//                                                         <Link
//                                                             href="/email/verification-notification"
//                                                             as="button"
//                                                             className="text-emerald-600 underline hover:text-emerald-700"
//                                                         >
//                                                             Renvoyer l'email de
//                                                             vérification
//                                                         </Link>
//                                                     </p>
//                                                 )}
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="date_of_birth">
//                                                 Date de naissance
//                                             </Label>
//                                             <Input
//                                                 id="date_of_birth"
//                                                 name="date_of_birth"
//                                                 type="date"
//                                                 defaultValue={
//                                                     user.date_of_birth
//                                                         ? user.date_of_birth.split(
//                                                               'T',
//                                                           )[0]
//                                                         : ''
//                                                 }
//                                             />
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="gender">
//                                                 Genre
//                                             </Label>
//                                             <select
//                                                 id="gender"
//                                                 name="gender"
//                                                 defaultValue={user.gender}
//                                                 className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
//                                             >
//                                                 <option value="">
//                                                     Sélectionner
//                                                 </option>
//                                                 <option value="male">
//                                                     Homme
//                                                 </option>
//                                                 <option value="female">
//                                                     Femme
//                                                 </option>
//                                             </select>
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="nationality">
//                                                 Nationalité
//                                             </Label>
//                                             <Input
//                                                 id="nationality"
//                                                 name="nationality"
//                                                 defaultValue={user.nationality}
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-4">
//                                         <Button
//                                             type="submit"
//                                             className="bg-emerald-600 hover:bg-emerald-700"
//                                         >
//                                             Enregistrer les modifications
//                                         </Button>
//                                     </div>
//                                 </form>
//                             </div>
//                         )}

//                         {/* Section : Localisation */}
//                         {activeSection === 'location' && (
//                             <div className="space-y-6">
//                                 <HeadingSmall
//                                     title="Localisation"
//                                     description="Votre localisation géographique"
//                                 />

//                                 <form
//                                     onSubmit={handleLocationUpdate}
//                                     className="space-y-6"
//                                 >
//                                     <div className="grid gap-4 md:grid-cols-2">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="location">
//                                                 Localisation générale *
//                                             </Label>
//                                             <Input
//                                                 id="location"
//                                                 name="location"
//                                                 defaultValue={user.location}
//                                                 required
//                                                 placeholder="Ex: Ouagadougou, Burkina Faso"
//                                             />
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="region">
//                                                 Région
//                                             </Label>
//                                             <Input
//                                                 id="region"
//                                                 name="region"
//                                                 defaultValue={user.region}
//                                                 placeholder="Ex: Centre"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="grid gap-4 md:grid-cols-2">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="city">Ville</Label>
//                                             <Input
//                                                 id="city"
//                                                 name="city"
//                                                 defaultValue={user.city}
//                                                 placeholder="Ex: Ouagadougou"
//                                             />
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="district">
//                                                 Quartier
//                                             </Label>
//                                             <Input
//                                                 id="district"
//                                                 name="district"
//                                                 defaultValue={user.district}
//                                                 placeholder="Ex: Gounghin"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="grid gap-2">
//                                         <Label htmlFor="address">
//                                             Adresse complète
//                                         </Label>
//                                         <Textarea
//                                             id="address"
//                                             name="address"
//                                             defaultValue={user.address}
//                                             rows={3}
//                                             placeholder="Adresse détaillée..."
//                                         />
//                                     </div>

//                                     <Button type="submit">
//                                         Enregistrer la localisation
//                                     </Button>
//                                 </form>
//                             </div>
//                         )}

//                         {/* Section : Specialisation */}
//                         {activeSection === 'specialisation' &&
//                             is_practitioner && (
//                                 <div className="space-y-6">
//                                     <HeadingSmall
//                                         title="Informations professionnelles"
//                                         description="Vos compétences et spécialités"
//                                     />

//                                     <form
//                                         onSubmit={handleSpecializationUpdate}
//                                         className="space-y-6"
//                                     >
//                                         <div className="space-y-4">
//                                             <div>
//                                                 <Label className="text-base font-semibold">
//                                                     Spécialisations
//                                                 </Label>
//                                                 <p className="text-sm text-gray-600">
//                                                     Sélectionnez vos domaines
//                                                     d'expertise et indiquez
//                                                     votre niveau
//                                                 </p>
//                                             </div>

//                                             {/* Grille de spécialisations */}
//                                             <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//                                                 {specializations.map((spec) => {
//                                                     const isSelected =
//                                                         selectedSpecializations.includes(
//                                                             spec.id,
//                                                         );

//                                                     return (
//                                                         <div
//                                                             key={spec.id}
//                                                             className={`rounded-lg border-2 p-4 transition-all ${
//                                                                 isSelected
//                                                                     ? 'border-green-500 bg-green-50'
//                                                                     : 'border-gray-200 hover:border-gray-300'
//                                                             }`}
//                                                         >
//                                                             <div className="flex items-start gap-3">
//                                                                 {/* Checkbox de sélection */}
//                                                                 <button
//                                                                     type="button"
//                                                                     onClick={() =>
//                                                                         toggleSpecialization(
//                                                                             spec.id,
//                                                                         )
//                                                                     }
//                                                                     className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${
//                                                                         isSelected
//                                                                             ? 'border-green-500 bg-green-500'
//                                                                             : 'border-gray-300'
//                                                                     }`}
//                                                                 >
//                                                                     {isSelected && (
//                                                                         <Check className="h-3 w-3 text-white" />
//                                                                     )}
//                                                                 </button>

//                                                                 <div className="flex-1">
//                                                                     {/* Nom de la spécialisation */}
//                                                                     <div className="flex items-center gap-2">
//                                                                         {spec.icon && (
//                                                                             <span className="text-xl">
//                                                                                 {
//                                                                                     spec.icon
//                                                                                 }
//                                                                             </span>
//                                                                         )}
//                                                                         <h4 className="font-medium text-gray-900">
//                                                                             {
//                                                                                 spec.name
//                                                                             }
//                                                                         </h4>
//                                                                     </div>

//                                                                     {/* Description */}
//                                                                     {spec.description && (
//                                                                         <p className="mt-1 text-xs text-gray-600">
//                                                                             {
//                                                                                 spec.description
//                                                                             }
//                                                                         </p>
//                                                                     )}

//                                                                     {/* Sélecteur de niveau si sélectionné */}
//                                                                     {isSelected && (
//                                                                         <div className="mt-3">
//                                                                             <Label className="text-xs text-gray-700">
//                                                                                 Niveau
//                                                                                 de
//                                                                                 maîtrise
//                                                                             </Label>
//                                                                             <div className="mt-2 flex flex-wrap gap-2">
//                                                                                 {proficiencyOptions.map(
//                                                                                     (
//                                                                                         option,
//                                                                                     ) => (
//                                                                                         <button
//                                                                                             key={
//                                                                                                 option.value
//                                                                                             }
//                                                                                             type="button"
//                                                                                             onClick={() =>
//                                                                                                 updateProficiencyLevel(
//                                                                                                     spec.id,
//                                                                                                     option.value,
//                                                                                                 )
//                                                                                             }
//                                                                                             className={`rounded-full px-3 py-1 text-xs font-medium transition ${
//                                                                                                 proficiencyLevels[
//                                                                                                     spec
//                                                                                                         .id
//                                                                                                 ] ===
//                                                                                                 option.value
//                                                                                                     ? option.color
//                                                                                                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                                                                                             }`}
//                                                                                         >
//                                                                                             {
//                                                                                                 option.label
//                                                                                             }
//                                                                                         </button>
//                                                                                     ),
//                                                                                 )}
//                                                                             </div>
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                             </div>

//                                                             {/* Champs cachés pour la soumission */}
//                                                             {isSelected && (
//                                                                 <>
//                                                                     <input
//                                                                         type="hidden"
//                                                                         name={`specialization_ids[]`}
//                                                                         value={
//                                                                             spec.id
//                                                                         }
//                                                                     />
//                                                                     <input
//                                                                         type="hidden"
//                                                                         name={`proficiency_levels[]`}
//                                                                         value={
//                                                                             proficiencyLevels[
//                                                                                 spec
//                                                                                     .id
//                                                                             ]
//                                                                         }
//                                                                     />
//                                                                 </>
//                                                             )}
//                                                         </div>
//                                                     );
//                                                 })}
//                                             </div>

//                                             {/* Résumé des sélections */}
//                                             {selectedSpecializations.length >
//                                                 0 && (
//                                                 <div className="rounded-lg bg-blue-50 p-4">
//                                                     <p className="mb-2 text-sm font-medium text-blue-900">
//                                                         Vos spécialisations (
//                                                         {
//                                                             selectedSpecializations.length
//                                                         }
//                                                         )
//                                                     </p>
//                                                     <div className="flex flex-wrap gap-2">
//                                                         {selectedSpecializations.map(
//                                                             (specId) => {
//                                                                 const spec =
//                                                                     specializations.find(
//                                                                         (s) =>
//                                                                             s.id ===
//                                                                             specId,
//                                                                     );
//                                                                 const level =
//                                                                     proficiencyLevels[
//                                                                         specId
//                                                                     ];
//                                                                 const levelLabel =
//                                                                     proficiencyOptions.find(
//                                                                         (o) =>
//                                                                             o.value ===
//                                                                             level,
//                                                                     )?.label;

//                                                                 return (
//                                                                     <Badge
//                                                                         key={
//                                                                             specId
//                                                                         }
//                                                                         variant="secondary"
//                                                                         className="gap-1"
//                                                                     >
//                                                                         {
//                                                                             spec?.name
//                                                                         }{' '}
//                                                                         •{' '}
//                                                                         {
//                                                                             levelLabel
//                                                                         }
//                                                                     </Badge>
//                                                                 );
//                                                             },
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             )}
//                                             <Button type="submit">
//                                                 Enregistrer les informations
//                                             </Button>
//                                         </div>
//                                     </form>
//                                 </div>
//                             )}

//                         {/* Section : Informations professionnelles (tradipraticiens uniquement) */}
//                         {activeSection === 'professional' &&
//                             is_practitioner && (
//                                 <div className="space-y-6">
//                                     <HeadingSmall
//                                         title="Informations professionnelles"
//                                         description="Vos compétences et spécialités"
//                                     />

//                                     <form
//                                         onSubmit={handleProfessionalUpdate}
//                                         className="space-y-6"
//                                     >
//                                         <div className="grid gap-4 md:grid-cols-3">
//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="years_of_experience">
//                                                     Années d'expérience
//                                                 </Label>
//                                                 <Input
//                                                     id="years_of_experience"
//                                                     name="years_of_experience"
//                                                     type="number"
//                                                     min="0"
//                                                     defaultValue={
//                                                         user.years_of_experience
//                                                     }
//                                                     placeholder="Ex: 10"
//                                                 />
//                                             </div>

//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="certification_number">
//                                                     Numéro de certification
//                                                 </Label>
//                                                 <Input
//                                                     id="certification_number"
//                                                     name="certification_number"
//                                                     defaultValue={
//                                                         user.certification_number
//                                                     }
//                                                     placeholder="Numéro officiel"
//                                                 />
//                                             </div>

//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="intervention_radius_km">
//                                                     Rayon d'intervention (km)
//                                                 </Label>
//                                                 <Input
//                                                     id="intervention_radius_km"
//                                                     name="intervention_radius_km"
//                                                     type="number"
//                                                     min="0"
//                                                     defaultValue={
//                                                         user.intervention_radius_km
//                                                     }
//                                                     placeholder="Ex: 50"
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div className="grid gap-4 md:grid-cols-2">
//                                             {/* <div className="grid gap-2">
//                                         <Label htmlFor="specialties">
//                                             Spécialités
//                                         </Label>
//                                         <Textarea
//                                             id="specialties"
//                                             name="specialties"
//                                             defaultValue={user.specialties}
//                                             rows={2}
//                                             placeholder="Ex: Phytothérapie, Massage traditionnel..."
//                                         />
//                                         <p className="text-xs text-gray-500">
//                                             Séparez les langues par des virgules
//                                         </p>
//                                     </div> */}

//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="languages">
//                                                     Langues parlées
//                                                 </Label>
//                                                 <Textarea
//                                                     id="languages"
//                                                     name="languages"
//                                                     defaultValue={
//                                                         Array.isArray(
//                                                             user.languages,
//                                                         )
//                                                             ? user.languages.join(
//                                                                   ', ',
//                                                               )
//                                                             : user.languages ||
//                                                               ''
//                                                     }
//                                                     rows={2}
//                                                     placeholder="Ex: Français, Mooré, Dioula"
//                                                 />
//                                                 <p className="text-xs text-gray-500">
//                                                     Séparez les langues par des
//                                                     virgules
//                                                 </p>
//                                             </div>
//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="treatment_methods">
//                                                     Méthodes de traitement
//                                                 </Label>
//                                                 <Textarea
//                                                     id="treatment_methods"
//                                                     name="treatment_methods"
//                                                     defaultValue={
//                                                         Array.isArray(
//                                                             user.treatment_methods,
//                                                         )
//                                                             ? user.treatment_methods.join(
//                                                                   ', ',
//                                                               )
//                                                             : user.treatment_methods ||
//                                                               ''
//                                                     }
//                                                     rows={3}
//                                                     placeholder="Ex: Phytothérapie, Massage, Acupuncture"
//                                                 />
//                                                 <p className="text-xs text-gray-500">
//                                                     Séparez les méthodes par des
//                                                     virgules
//                                                 </p>
//                                             </div>

//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="professional_affiliations">
//                                                     Affiliations
//                                                     professionnelles
//                                                 </Label>
//                                                 <Textarea
//                                                     id="professional_affiliations"
//                                                     name="professional_affiliations"
//                                                     defaultValue={
//                                                         Array.isArray(
//                                                             user.professional_affiliations,
//                                                         )
//                                                             ? user.professional_affiliations.join(
//                                                                   ', ',
//                                                               )
//                                                             : user.professional_affiliations ||
//                                                               ''
//                                                     }
//                                                     rows={3}
//                                                     placeholder="Ex: Association des Tradipraticiens du Burkina"
//                                                 />
//                                                 <p className="text-xs text-gray-500">
//                                                     Séparez les affiliations par
//                                                     des virgules
//                                                 </p>
//                                             </div>
//                                         </div>

//                                         <Button type="submit">
//                                             Enregistrer les informations
//                                         </Button>
//                                     </form>
//                                 </div>
//                             )}

//                         {/* Section : Réseaux sociaux */}
//                         {activeSection === 'social' && (
//                             <div className="space-y-6">
//                                 <HeadingSmall
//                                     title="Réseaux sociaux"
//                                     description="Vos liens de réseaux sociaux"
//                                 />

//                                 <form
//                                     onSubmit={handleSocialMediaUpdate}
//                                     className="space-y-4"
//                                 >
//                                     <div className="grid gap-4 md:grid-cols-3">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="website">
//                                                 Site web
//                                             </Label>
//                                             <Input
//                                                 id="website"
//                                                 name="website"
//                                                 type="url"
//                                                 defaultValue={user.website}
//                                                 placeholder="https://votresite.com"
//                                             />
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="facebook_url">
//                                                 Facebook
//                                             </Label>
//                                             <Input
//                                                 id="facebook_url"
//                                                 name="facebook_url"
//                                                 type="url"
//                                                 defaultValue={user.facebook_url}
//                                                 placeholder="https://facebook.com/..."
//                                             />
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="instagram_url">
//                                                 Instagram
//                                             </Label>
//                                             <Input
//                                                 id="instagram_url"
//                                                 name="instagram_url"
//                                                 type="url"
//                                                 defaultValue={
//                                                     user.instagram_url
//                                                 }
//                                                 placeholder="https://instagram.com/..."
//                                             />
//                                         </div>
//                                     </div>
//                                     <div className="grid gap-4 md:grid-cols-3">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="youtube_url">
//                                                 YouTube
//                                             </Label>
//                                             <Input
//                                                 id="youtube_url"
//                                                 name="youtube_url"
//                                                 type="url"
//                                                 defaultValue={user.youtube_url}
//                                                 placeholder="https://youtube.com/..."
//                                             />
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="tiktok_url">
//                                                 Tiktok
//                                             </Label>
//                                             <Input
//                                                 id="tiktok_url"
//                                                 name="tiktok_url"
//                                                 type="url"
//                                                 defaultValue={user.tiktok_url}
//                                                 placeholder="https://tiktok.com/..."
//                                             />
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="linkedin_url">
//                                                 LinkedIn
//                                             </Label>
//                                             <Input
//                                                 id="linkedin_url"
//                                                 name="linkedin_url"
//                                                 type="url"
//                                                 defaultValue={user.linkedin_url}
//                                                 placeholder="https://linkedin.com/..."
//                                             />
//                                         </div>
//                                     </div>

//                                     <Button type="submit">
//                                         Enregistrer les réseaux sociaux
//                                     </Button>
//                                 </form>
//                             </div>
//                         )}

//                         {/* Section : Tarifs (tradipraticiens uniquement) */}
//                         {activeSection === 'pricing' && is_practitioner && (
//                             <div className="space-y-6">
//                                 <HeadingSmall
//                                     title="Tarifs"
//                                     description="Vos tarifs de consultation"
//                                 />

//                                 <form
//                                     onSubmit={handlePricingUpdate}
//                                     className="space-y-6"
//                                 >
//                                     <div className="grid gap-4 md:grid-cols-3">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="consultation_price_min">
//                                                 Prix consultation minimal (FCFA)
//                                                 *
//                                             </Label>
//                                             <Input
//                                                 id="consultation_price_min"
//                                                 name="consultation_price_min"
//                                                 type="number"
//                                                 min="0"
//                                                 step="100"
//                                                 defaultValue={
//                                                     user.consultation_price_min
//                                                 }
//                                                 required
//                                                 placeholder="Ex: 1000"
//                                             />
//                                         </div>
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="consultation_price_max">
//                                                 Prix consultation maximal (FCFA)
//                                                 *
//                                             </Label>
//                                             <Input
//                                                 id="consultation_price_max"
//                                                 name="consultation_price_max"
//                                                 type="number"
//                                                 min="0"
//                                                 step="100"
//                                                 defaultValue={
//                                                     user.consultation_price_max
//                                                 }
//                                                 required
//                                                 placeholder="Ex: 10000"
//                                             />
//                                         </div>
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="currency">
//                                                 Devise
//                                             </Label>
//                                             <select
//                                                 id="currency"
//                                                 name="currency"
//                                                 defaultValue={
//                                                     user.currency || 'FCFA'
//                                                 }
//                                                 className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
//                                             >
//                                                 <option value="FCFA">
//                                                     FCFA
//                                                 </option>
//                                                 <option value="EUR">
//                                                     Euro (€)
//                                                 </option>
//                                                 <option value="USD">
//                                                     Dollar ($)
//                                                 </option>
//                                             </select>
//                                         </div>
//                                     </div>

//                                     <div className="grid gap-4 md:grid-cols-2">
//                                         <div className="grid gap-2">
//                                             <Label htmlFor="payment_methods">
//                                                 Modes de paiement acceptés
//                                             </Label>
//                                             <div className="space-y-2">
//                                                 <label className="flex items-center gap-2">
//                                                     <input
//                                                         type="checkbox"
//                                                         name="payment_methods[]" // ✅ Important : [] pour array
//                                                         value="cash"
//                                                         defaultChecked={
//                                                             Array.isArray(
//                                                                 user.payment_methods,
//                                                             )
//                                                                 ? user.payment_methods.includes(
//                                                                       'cash',
//                                                                   )
//                                                                 : false
//                                                         }
//                                                         className="rounded border-gray-300"
//                                                     />
//                                                     <span className="text-sm">
//                                                         Espèces
//                                                     </span>
//                                                 </label>

//                                                 <label className="flex items-center gap-2">
//                                                     <input
//                                                         type="checkbox"
//                                                         name="payment_methods[]"
//                                                         value="mobile_money"
//                                                         defaultChecked={
//                                                             Array.isArray(
//                                                                 user.payment_methods,
//                                                             )
//                                                                 ? user.payment_methods.includes(
//                                                                       'mobile_money',
//                                                                   )
//                                                                 : false
//                                                         }
//                                                         className="rounded border-gray-300"
//                                                     />
//                                                     <span className="text-sm">
//                                                         Mobile Money
//                                                     </span>
//                                                 </label>

//                                                 <label className="flex items-center gap-2">
//                                                     <input
//                                                         type="checkbox"
//                                                         name="payment_methods[]"
//                                                         value="bank_transfer"
//                                                         defaultChecked={
//                                                             Array.isArray(
//                                                                 user.payment_methods,
//                                                             )
//                                                                 ? user.payment_methods.includes(
//                                                                       'bank_transfer',
//                                                                   )
//                                                                 : false
//                                                         }
//                                                         className="rounded border-gray-300"
//                                                     />
//                                                     <span className="text-sm">
//                                                         Virement bancaire
//                                                     </span>
//                                                 </label>

//                                                 <label className="flex items-center gap-2">
//                                                     <input
//                                                         type="checkbox"
//                                                         name="payment_methods[]"
//                                                         value="credit_card"
//                                                         defaultChecked={
//                                                             Array.isArray(
//                                                                 user.payment_methods,
//                                                             )
//                                                                 ? user.payment_methods.includes(
//                                                                       'credit_card',
//                                                                   )
//                                                                 : false
//                                                         }
//                                                         className="rounded border-gray-300"
//                                                     />
//                                                     <span className="text-sm">
//                                                         Carte bancaire
//                                                     </span>
//                                                 </label>
//                                             </div>
//                                         </div>

//                                         <div className="grid gap-2">
//                                             <Label htmlFor="pricing_notes">
//                                                 Notes sur les tarifs
//                                             </Label>
//                                             <Textarea
//                                                 id="pricing_notes"
//                                                 name="pricing_notes"
//                                                 defaultValue={
//                                                     user.pricing_notes
//                                                 }
//                                                 rows={3}
//                                                 placeholder="Informations supplémentaires sur vos tarifs..."
//                                             />
//                                         </div>
//                                     </div>

//                                     <Button type="submit">
//                                         Enregistrer les tarifs
//                                     </Button>
//                                 </form>
//                             </div>
//                         )}

//                         {/* Section : Disponibilités (tradipraticiens uniquement) */}
//                         {activeSection === 'availability' &&
//                             is_practitioner && (
//                                 <div className="space-y-6">
//                                     <HeadingSmall
//                                         title="Disponibilités"
//                                         description="Vos horaires de disponibilité"
//                                     />

//                                     <form
//                                         onSubmit={handleAvailabilityUpdate}
//                                         className="space-y-6"
//                                     >
//                                         <div className="grid gap-4">
//                                             {[
//                                                 'Lundi',
//                                                 'Mardi',
//                                                 'Mercredi',
//                                                 'Jeudi',
//                                                 'Vendredi',
//                                                 'Samedi',
//                                                 'Dimanche',
//                                             ].map((day, index) => (
//                                                 <div
//                                                     key={day}
//                                                     className="rounded-lg border border-gray-200 p-4"
//                                                 >
//                                                     <div className="mb-3 flex items-center justify-between">
//                                                         <label className="flex items-center gap-2">
//                                                             <input
//                                                                 type="checkbox"
//                                                                 name={`availability[${index}][active]`}
//                                                                 defaultChecked={
//                                                                     user
//                                                                         .availability_schedule?.[
//                                                                         index
//                                                                     ]?.open ||
//                                                                     false
//                                                                 }
//                                                                 className="rounded border-gray-300"
//                                                             />
//                                                             <span className="font-medium">
//                                                                 {day}
//                                                             </span>
//                                                         </label>
//                                                     </div>
//                                                     <div className="grid gap-4 md:grid-cols-2">
//                                                         <div className="grid gap-2">
//                                                             <Label
//                                                                 htmlFor={`availability_${index}_start`}
//                                                             >
//                                                                 Heure de début
//                                                             </Label>
//                                                             <Input
//                                                                 id={`availability_${index}_start`}
//                                                                 name={`availability[${index}][start_time]`}
//                                                                 type="time"
//                                                                 defaultValue={
//                                                                     user
//                                                                         .availability_schedule?.[
//                                                                         index
//                                                                     ]
//                                                                         ?.slots?.[0]
//                                                                         ?.start ||
//                                                                     ''
//                                                                 }
//                                                             />
//                                                         </div>
//                                                         <div className="grid gap-2">
//                                                             <Label
//                                                                 htmlFor={`availability_${index}_end`}
//                                                             >
//                                                                 Heure de fin
//                                                             </Label>
//                                                             <Input
//                                                                 id={`availability_${index}_end`}
//                                                                 name={`availability[${index}][end_time]`}
//                                                                 type="time"
//                                                                 defaultValue={
//                                                                     user
//                                                                         .availability_schedule?.[
//                                                                         index
//                                                                     ]
//                                                                         ?.slots?.[0]
//                                                                         ?.end ||
//                                                                     ''
//                                                                 }
//                                                             />
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         <div className="grid gap-4 md:grid-cols-4">
//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="online_consultation_available">
//                                                     Consultation en ligne
//                                                 </Label>
//                                                 <Switch
//                                                     id="online_consultation_available"
//                                                     checked={
//                                                         onlineConsultationAvailable
//                                                     }
//                                                     onChange={(e) =>
//                                                         setOnlineConsultationAvailable(
//                                                             e.target.checked,
//                                                         )
//                                                     }
//                                                 />
//                                             </div>

//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="home_consultation_available">
//                                                     Consultation à domicile
//                                                 </Label>
//                                                 <Switch
//                                                     id="home_consultation_available"
//                                                     checked={
//                                                         homeConsultationAvailable
//                                                     }
//                                                     onChange={(e) =>
//                                                         setHomeConsultationAvailable(
//                                                             e.target.checked,
//                                                         )
//                                                     }
//                                                 />
//                                             </div>
//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="accepts_emergencies">
//                                                     Accepte les urgences
//                                                 </Label>
//                                                 <Switch
//                                                     id="accepts_emergencies"
//                                                     checked={acceptsEmergency}
//                                                     onChange={(e) =>
//                                                         setAcceptsEmergency(
//                                                             e.target.checked,
//                                                         )
//                                                     }
//                                                 />
//                                             </div>

//                                             <div className="grid gap-2">
//                                                 <Label htmlFor="consultation_duration_minutes">
//                                                     Durée (min)
//                                                 </Label>
//                                                 <Input
//                                                     id="consultation_duration_minutes"
//                                                     name="consultation_duration_minutes"
//                                                     type="number"
//                                                     min="15"
//                                                     max="480"
//                                                     step="15"
//                                                     defaultValue={
//                                                         user.consultation_duration_minutes ||
//                                                         60
//                                                     }
//                                                 />
//                                             </div>
//                                         </div>

//                                         <Button type="submit">
//                                             Enregistrer les disponibilités
//                                         </Button>
//                                     </form>
//                                 </div>
//                             )}

//                         {/* Section : Formations (tradipraticiens uniquement) */}
//                         {activeSection === 'trainings' && is_practitioner && (
//                             <div className="space-y-6">
//                                 <HeadingSmall
//                                     title="Formations et Diplômes"
//                                     description="Ajoutez vos formations et diplômes professionnels"
//                                 />

//                                 <form
//                                     onSubmit={handleTrainingsUpdate}
//                                     className="space-y-6"
//                                 >
//                                     {/* Formations */}
//                                     <div className="space-y-4">
//                                         <div className="flex items-center justify-between">
//                                             <Label className="text-base font-semibold">
//                                                 Formations professionnelles
//                                             </Label>
//                                             <Button
//                                                 type="button"
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={addTraining}
//                                             >
//                                                 <PlusCircle className="mr-2 h-4 w-4" />
//                                                 Ajouter une formation
//                                             </Button>
//                                         </div>

//                                         {trainings.map(
//                                             (training: any, index: number) => (
//                                                 <div
//                                                     key={index}
//                                                     className="relative space-y-3 rounded-lg border p-4"
//                                                 >
//                                                     <Button
//                                                         type="button"
//                                                         variant="ghost"
//                                                         size="icon"
//                                                         className="absolute top-2 right-2"
//                                                         onClick={() =>
//                                                             removeTraining(
//                                                                 index,
//                                                             )
//                                                         }
//                                                     >
//                                                         <X className="h-4 w-4" />
//                                                     </Button>

//                                                     <div className="grid gap-4 md:grid-cols-2">
//                                                         <div className="grid gap-2">
//                                                             <Label
//                                                                 htmlFor={`training-title-${index}`}
//                                                             >
//                                                                 Titre de la
//                                                                 formation *
//                                                             </Label>
//                                                             <Input
//                                                                 id={`training-title-${index}`}
//                                                                 name={`trainings[${index}][title]`}
//                                                                 value={
//                                                                     training.title
//                                                                 }
//                                                                 onChange={(e) =>
//                                                                     updateTraining(
//                                                                         index,
//                                                                         'title',
//                                                                         e.target
//                                                                             .value,
//                                                                     )
//                                                                 }
//                                                                 placeholder="Ex: Phytothérapie avancée"
//                                                                 required
//                                                             />
//                                                         </div>

//                                                         <div className="grid gap-2">
//                                                             <Label
//                                                                 htmlFor={`training-institution-${index}`}
//                                                             >
//                                                                 Institution
//                                                             </Label>
//                                                             <Input
//                                                                 id={`training-institution-${index}`}
//                                                                 name={`trainings[${index}][institution]`}
//                                                                 value={
//                                                                     training.institution ||
//                                                                     ''
//                                                                 }
//                                                                 onChange={(e) =>
//                                                                     updateTraining(
//                                                                         index,
//                                                                         'institution',
//                                                                         e.target
//                                                                             .value,
//                                                                     )
//                                                                 }
//                                                                 placeholder="Ex: Centre de formation..."
//                                                             />
//                                                         </div>
//                                                     </div>

//                                                     <div className="grid gap-4 md:grid-cols-2">
//                                                         <div className="grid gap-2">
//                                                             <Label
//                                                                 htmlFor={`training-year-${index}`}
//                                                             >
//                                                                 Année
//                                                             </Label>
//                                                             <Input
//                                                                 id={`training-year-${index}`}
//                                                                 name={`trainings[${index}][year]`}
//                                                                 type="number"
//                                                                 min="1900"
//                                                                 max={new Date().getFullYear()}
//                                                                 value={
//                                                                     training.year ||
//                                                                     ''
//                                                                 }
//                                                                 onChange={(e) =>
//                                                                     updateTraining(
//                                                                         index,
//                                                                         'year',
//                                                                         e.target
//                                                                             .value,
//                                                                     )
//                                                                 }
//                                                                 placeholder="2020"
//                                                             />
//                                                         </div>

//                                                         <div className="grid gap-2">
//                                                             <Label
//                                                                 htmlFor={`training-certificate-${index}`}
//                                                             >
//                                                                 Lien du
//                                                                 certificat
//                                                             </Label>
//                                                             <Input
//                                                                 id={`training-certificate-${index}`}
//                                                                 name={`trainings[${index}][certificate_url]`}
//                                                                 type="url"
//                                                                 value={
//                                                                     training.certificate_url ||
//                                                                     ''
//                                                                 }
//                                                                 onChange={(e) =>
//                                                                     updateTraining(
//                                                                         index,
//                                                                         'certificate_url',
//                                                                         e.target
//                                                                             .value,
//                                                                     )
//                                                                 }
//                                                                 placeholder="https://..."
//                                                             />
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ),
//                                         )}

//                                         {trainings.length === 0 && (
//                                             <p className="py-4 text-center text-sm text-muted-foreground">
//                                                 Aucune formation ajoutée.
//                                                 Cliquez sur "Ajouter une
//                                                 formation" pour commencer.
//                                             </p>
//                                         )}
//                                     </div>

//                                     {/* Diplômes */}
//                                     <div className="space-y-4">
//                                         <div className="flex items-center justify-between">
//                                             <Label className="text-base font-semibold">
//                                                 Diplômes
//                                             </Label>
//                                             <Button
//                                                 type="button"
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={addDegree}
//                                             >
//                                                 <PlusCircle className="mr-2 h-4 w-4" />
//                                                 Ajouter un diplôme
//                                             </Button>
//                                         </div>

//                                         {degrees.map(
//                                             (degree: any, index: number) => (
//                                                 <div
//                                                     key={index}
//                                                     className="relative space-y-3 rounded-lg border p-4"
//                                                 >
//                                                     <Button
//                                                         type="button"
//                                                         variant="ghost"
//                                                         size="icon"
//                                                         className="absolute top-2 right-2"
//                                                         onClick={() =>
//                                                             removeDegree(index)
//                                                         }
//                                                     >
//                                                         <X className="h-4 w-4" />
//                                                     </Button>

//                                                     <div className="grid gap-4 md:grid-cols-2">
//                                                         <div className="grid gap-2">
//                                                             <Label
//                                                                 htmlFor={`degree-title-${index}`}
//                                                             >
//                                                                 Titre du diplôme
//                                                                 *
//                                                             </Label>
//                                                             <Input
//                                                                 id={`degree-title-${index}`}
//                                                                 name={`degrees[${index}][title]`}
//                                                                 value={
//                                                                     degree.title
//                                                                 }
//                                                                 onChange={(e) =>
//                                                                     updateDegree(
//                                                                         index,
//                                                                         'title',
//                                                                         e.target
//                                                                             .value,
//                                                                     )
//                                                                 }
//                                                                 placeholder="Ex: Diplôme en médecine traditionnelle"
//                                                                 required
//                                                             />
//                                                         </div>

//                                                         <div className="grid gap-2">
//                                                             <Label
//                                                                 htmlFor={`degree-institution-${index}`}
//                                                             >
//                                                                 Institution
//                                                             </Label>
//                                                             <Input
//                                                                 id={`degree-institution-${index}`}
//                                                                 name={`degrees[${index}][institution]`}
//                                                                 value={
//                                                                     degree.institution ||
//                                                                     ''
//                                                                 }
//                                                                 onChange={(e) =>
//                                                                     updateDegree(
//                                                                         index,
//                                                                         'institution',
//                                                                         e.target
//                                                                             .value,
//                                                                     )
//                                                                 }
//                                                                 placeholder="Ex: Université..."
//                                                             />
//                                                         </div>
//                                                     </div>

//                                                     <div className="grid gap-2">
//                                                         <Label
//                                                             htmlFor={`degree-year-${index}`}
//                                                         >
//                                                             Année
//                                                         </Label>
//                                                         <Input
//                                                             id={`degree-year-${index}`}
//                                                             name={`degrees[${index}][year]`}
//                                                             type="number"
//                                                             min="1900"
//                                                             max={new Date().getFullYear()}
//                                                             value={
//                                                                 degree.year ||
//                                                                 ''
//                                                             }
//                                                             onChange={(e) =>
//                                                                 updateDegree(
//                                                                     index,
//                                                                     'year',
//                                                                     e.target
//                                                                         .value,
//                                                                 )
//                                                             }
//                                                             placeholder="2015"
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             ),
//                                         )}

//                                         {degrees.length === 0 && (
//                                             <p className="py-4 text-center text-sm text-muted-foreground">
//                                                 Aucun diplôme ajouté. Cliquez
//                                                 sur "Ajouter un diplôme" pour
//                                                 commencer.
//                                             </p>
//                                         )}
//                                     </div>

//                                     <Button
//                                         type="submit"
//                                         disabled={isSubmitting}
//                                     >
//                                         {isSubmitting ? (
//                                             <>
//                                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                                 Enregistrement...
//                                             </>
//                                         ) : (
//                                             'Enregistrer les formations'
//                                         )}
//                                     </Button>
//                                 </form>
//                             </div>
//                         )}
//                         {/* Section : Préférences */}
//                         {activeSection === 'preferences' && (
//                             <div className="space-y-6">
//                                 <HeadingSmall
//                                     title="Préférences du compte"
//                                     description="Paramètres généraux de votre compte"
//                                 />

//                                 <form
//                                     onSubmit={handlePreferenceUpdate}
//                                     className="space-y-6"
//                                 >
//                                     <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
//                                         <div>
//                                             <p className="font-medium">
//                                                 Compte privé
//                                             </p>
//                                             <p className="text-sm text-gray-500">
//                                                 Les utilisateurs doivent
//                                                 demander à vous suivre
//                                             </p>
//                                         </div>
//                                         <input
//                                             type="checkbox"
//                                             checked={preferences.is_private}
//                                             onChange={(e) =>
//                                                 updatePreference(
//                                                     'is_private',
//                                                     e.target.checked,
//                                                 )
//                                             }
//                                             className="h-5 w-5 rounded border-gray-300"
//                                         />
//                                     </label>

//                                     <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
//                                         <div>
//                                             <p className="font-medium">
//                                                 Visible dans les recherches
//                                             </p>
//                                             <p className="text-sm text-gray-500">
//                                                 Apparaître dans les résultats de
//                                                 recherche
//                                             </p>
//                                         </div>
//                                         <input
//                                             type="checkbox"
//                                             checked={preferences.is_searchable}
//                                             onChange={(e) =>
//                                                 updatePreference(
//                                                     'is_searchable',
//                                                     e.target.checked,
//                                                 )
//                                             }
//                                             className="h-5 w-5 rounded border-gray-300"
//                                         />
//                                     </label>
//                                     <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
//                                         <div>
//                                             <p className="font-medium">
//                                                 Afficher le numéro de téléphone
//                                             </p>
//                                             <p className="text-sm text-gray-500">
//                                                 Rendre votre numéro visible sur
//                                                 votre profil
//                                             </p>
//                                         </div>
//                                         <input
//                                             type="checkbox"
//                                             name="show_phone_on_profile"
//                                             checked={
//                                                 preferences.show_phone_on_profile
//                                             }
//                                             onChange={(e) =>
//                                                 updatePreference(
//                                                     'show_phone_on_profile',
//                                                     e.target.checked,
//                                                 )
//                                             }
//                                             className="h-5 w-5 rounded border-gray-300"
//                                         />
//                                     </label>
//                                     <div className="space-y-4">
//                                         <h3 className="text-sm font-semibold">
//                                             Notifications
//                                         </h3>

//                                         <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
//                                             <div>
//                                                 <p className="font-medium">
//                                                     Notifications email
//                                                 </p>
//                                                 <p className="text-sm text-gray-500">
//                                                     Recevoir des emails pour les
//                                                     activités importantes
//                                                 </p>
//                                             </div>
//                                             <input
//                                                 type="checkbox"
//                                                 name="email_notifications_enabled"
//                                                 checked={
//                                                     preferences.email_notifications_enabled
//                                                 }
//                                                 onChange={(e) =>
//                                                     updatePreference(
//                                                         'email_notifications_enabled',
//                                                         e.target.checked,
//                                                     )
//                                                 }
//                                                 className="h-5 w-5 rounded border-gray-300"
//                                             />
//                                         </label>

//                                         <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
//                                             <div>
//                                                 <p className="font-medium">
//                                                     Notifications push
//                                                 </p>
//                                                 <p className="text-sm text-gray-500">
//                                                     Recevoir des notifications
//                                                     sur votre appareil
//                                                 </p>
//                                             </div>
//                                             <input
//                                                 type="checkbox"
//                                                 name="push_notifications_enabled"
//                                                 checked={
//                                                     preferences.push_notifications_enabled
//                                                 }
//                                                 onChange={(e) =>
//                                                     updatePreference(
//                                                         'push_notifications_enabled',
//                                                         e.target.checked,
//                                                     )
//                                                 }
//                                                 className="h-5 w-5 rounded border-gray-300"
//                                             />
//                                         </label>

//                                         <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
//                                             <div>
//                                                 <p className="font-medium">
//                                                     Notifications de messages
//                                                 </p>
//                                                 <p className="text-sm text-gray-500">
//                                                     Être notifié des nouveaux
//                                                     messages
//                                                 </p>
//                                             </div>
//                                             <input
//                                                 type="checkbox"
//                                                 name="message_notifications_enabled"
//                                                 checked={
//                                                     preferences.message_notifications_enabled
//                                                 }
//                                                 onChange={(e) =>
//                                                     updatePreference(
//                                                         'message_notifications_enabled',
//                                                         e.target.checked,
//                                                     )
//                                                 }
//                                                 className="h-5 w-5 rounded border-gray-300"
//                                             />
//                                         </label>
//                                     </div>
//                                     <div className="grid gap-2">
//                                         <Label htmlFor="preferred_language">
//                                             Langue préférée
//                                         </Label>
//                                         <select
//                                             value={
//                                                 preferences.preferred_language
//                                             }
//                                             onChange={(e) =>
//                                                 updatePreference(
//                                                     'preferred_language',
//                                                     e.target.value,
//                                                 )
//                                             }
//                                             className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
//                                         >
//                                             <option value="fr">Français</option>
//                                             <option value="en">English</option>
//                                             <option value="mooré">Mooré</option>
//                                             <option value="dioula">
//                                                 Dioula
//                                             </option>
//                                         </select>
//                                     </div>
//                                     <Button type="submit">
//                                         Enregistrer les préférences
//                                     </Button>
//                                 </form>
//                             </div>
//                         )}
//                     </div>

//                     {/* Delete User */}
//                     <div className="rounded-xl border border-gray-200 bg-white p-6">
//                         <DeleteUser />
//                     </div>
//                 </div>
//             </SettingsLayout>
//         </AppLayout>
//     );
// }
import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { formDataToObject } from '@/src/utils/forms';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Switch from '@mui/material/Switch';
import {
    Briefcase,
    Check,
    CheckCircle,
    Clock,
    DollarSign,
    Globe,
    GraduationCap,
    Loader2,
    MapPin,
    PlusCircle,
    Settings as SettingsIcon,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres de compte',
        href: edit().url,
    },
];

interface Specialization {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
}

interface ProfileSettingsProps {
    user?: any;
    specializations: Specialization[];
    userSpecializationIds: number[];
    completion_percentage?: number;
    missing_fields?: string[];
    is_practitioner?: boolean;
    mustVerifyEmail: boolean;
    status?: string;
}

export default function ProfileSettings({
    mustVerifyEmail,
    specializations,
    userSpecializationIds,
    status,
}: ProfileSettingsProps) {
    const {
        auth,
        user,
        completion_percentage,
        missing_fields,
        is_practitioner,
    } = usePage<SharedData & ProfileSettingsProps>().props;

    const [activeSection, setActiveSection] = useState<string>('personal');
    const [onlineConsultationAvailable, setOnlineConsultationAvailable] =
        useState(user.online_consultation_available || false);
    const [homeConsultationAvailable, setHomeConsultationAvailable] = useState(
        user.home_consultation_available || false,
    );
    const [acceptsEmergency, setAcceptsEmergency] = useState(
        user.accepts_emergency || false,
    );

    // Specialization states
    const [selectedSpecializations, setSelectedSpecializations] = useState<
        number[]
    >(userSpecializationIds || []);
    const [proficiencyLevels, setProficiencyLevels] = useState<
        Record<number, string>
    >(() => {
        const levels: Record<number, string> = {};
        userSpecializationIds.forEach((id) => {
            levels[id] = 'intermediate';
        });
        return levels;
    });

    // Training states
    const [trainings, setTrainings] = useState(user.trainings || []);
    const [degrees, setDegrees] = useState(user.degrees || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Preferences states
    const [preferences, setPreferences] = useState({
        preferred_language: user.preferred_language || 'fr',
        email_notifications_enabled: user.email_notifications_enabled ?? true,
        push_notifications_enabled: user.push_notifications_enabled ?? true,
        message_notifications_enabled:
            user.message_notifications_enabled ?? true,
        is_searchable: user.is_searchable ?? true,
        is_private: user.is_private || false,
        show_phone_on_profile: user.show_phone_on_profile ?? true,
    });

    const sections = [
        {
            id: 'personal',
            label: 'Informations personnelles',
            icon: User,
            available: true,
        },
        {
            id: 'location',
            label: 'Localisation',
            icon: MapPin,
            available: true,
        },
        {
            id: 'professional',
            label: 'Informations professionnelles',
            icon: Briefcase,
            available: is_practitioner,
        },
        {
            id: 'specialisation',
            label: 'Spécialisation',
            icon: Briefcase,
            available: is_practitioner,
        },
        {
            id: 'pricing',
            label: 'Tarifs',
            icon: DollarSign,
            available: is_practitioner,
        },
        {
            id: 'availability',
            label: 'Disponibilités',
            icon: Clock,
            available: is_practitioner,
        },
        {
            id: 'trainings',
            label: 'Formations',
            icon: GraduationCap,
            available: is_practitioner,
        },
        {
            id: 'social',
            label: 'Réseaux sociaux',
            icon: Globe,
            available: true,
        },
        {
            id: 'preferences',
            label: 'Préférences',
            icon: SettingsIcon,
            available: true,
        },
    ].filter((section) => section.available);

    const proficiencyOptions = [
        {
            value: 'beginner',
            label: 'Débutant',
            color: 'bg-blue-100 text-blue-700',
        },
        {
            value: 'intermediate',
            label: 'Intermédiaire',
            color: 'bg-green-100 text-green-700',
        },
        {
            value: 'advanced',
            label: 'Avancé',
            color: 'bg-orange-100 text-orange-700',
        },
        {
            value: 'expert',
            label: 'Expert',
            color: 'bg-purple-100 text-purple-700',
        },
    ];

    // Handlers
    const toggleSpecialization = (id: number) => {
        setSelectedSpecializations((prev) => {
            if (prev.includes(id)) {
                const newLevels = { ...proficiencyLevels };
                delete newLevels[id];
                setProficiencyLevels(newLevels);
                return prev.filter((specId) => specId !== id);
            } else {
                setProficiencyLevels((prev) => ({
                    ...prev,
                    [id]: 'intermediate',
                }));
                return [...prev, id];
            }
        });
    };

    const updateProficiencyLevel = (id: number, level: string) => {
        setProficiencyLevels((prev) => ({ ...prev, [id]: level }));
    };

    const handlePersonalInfoUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = formDataToObject(formData);
        router.post('/profile/update-personal-info', data, {
            preserveScroll: true,
            onSuccess: () => toast.success('Informations mises à jour'),
        });
    };

    const handleLocationUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = formDataToObject(formData);
        router.post('/profile/update-location', data, {
            preserveScroll: true,
            onSuccess: () => toast.success('Localisation mise à jour'),
        });
    };

    const handleProfessionalUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = formDataToObject(formData);
        router.post('/profile/update-professional-info', data, {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('Informations professionnelles mises à jour'),
        });
    };

    const handleSpecializationUpdate = (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = formDataToObject(formData);
        router.post('/profile/update-specialization', data, {
            preserveScroll: true,
            onSuccess: () => toast.success('Spécialisations mises à jour'),
        });
    };

    const handlePricingUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = formDataToObject(formData);
        router.post('/profile/update-pricing', data, {
            preserveScroll: true,
            onSuccess: () => toast.success('Tarifs mis à jour'),
        });
    };

    const handleSocialMediaUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = formDataToObject(formData);
        router.post('/profile/update-social-media', data, {
            preserveScroll: true,
            onSuccess: () => toast.success('Réseaux sociaux mis à jour'),
        });
    };

    const handleAvailabilityUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const availabilitySchedule = [
            'Lundi',
            'Mardi',
            'Mercredi',
            'Jeudi',
            'Vendredi',
            'Samedi',
            'Dimanche',
        ].map((day, index) => {
            const active =
                formData.get(`availability[${index}][active]`) === 'on';
            const startTime = formData.get(
                `availability[${index}][start_time]`,
            ) as string;
            const endTime = formData.get(
                `availability[${index}][end_time]`,
            ) as string;

            return {
                day: day,
                open: active,
                slots:
                    active && startTime && endTime
                        ? [{ start: startTime, end: endTime }]
                        : [],
            };
        });

        const data_save = {
            availability_schedule: availabilitySchedule,
            consultation_duration_minutes: formData.get(
                'consultation_duration_minutes',
            ),
            accepts_emergencies: acceptsEmergency,
            online_consultation_available: onlineConsultationAvailable,
            home_consultation_available: homeConsultationAvailable,
        };

        router.post('/profile/update-availability', data_save, {
            preserveScroll: true,
            onSuccess: () => toast.success('Disponibilités mises à jour'),
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Erreur lors de la mise à jour');
            },
        });
    };

    const updatePreference = (key: string, value: boolean | string) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    };

    const handlePreferenceUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.post('/profile/update-preferences', preferences, {
            preserveScroll: true,
            onSuccess: () => toast.success('Préférences mises à jour'),
        });
    };

    const addTraining = () => {
        setTrainings([
            ...trainings,
            { title: '', institution: '', year: '', certificate_url: '' },
        ]);
    };

    const removeTraining = (index: number) => {
        setTrainings(trainings.filter((_: any, i: number) => i !== index));
    };

    const updateTraining = (index: number, field: string, value: any) => {
        const updatedTrainings = [...trainings];
        updatedTrainings[index][field] = value;
        setTrainings(updatedTrainings);
    };

    const addDegree = () => {
        setDegrees([...degrees, { title: '', institution: '', year: '' }]);
    };

    const removeDegree = (index: number) => {
        setDegrees(degrees.filter((_: any, i: number) => i !== index));
    };

    const updateDegree = (index: number, field: string, value: any) => {
        const updatedDegrees = [...degrees];
        updatedDegrees[index][field] = value;
        setDegrees(updatedDegrees);
    };

    const handleTrainingsUpdate = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            '/profile/update-trainings',
            {
                trainings: trainings.filter((t: any) => t.title.trim() !== ''),
                degrees: degrees.filter((d: any) => d.title.trim() !== ''),
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Formations mises à jour avec succès'),
                onError: (errors) => {
                    toast.error('Erreur lors de la mise à jour');
                    console.error(errors);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <AppLayout
            showRecentMessages={false}
            showCreatePostWidget={false}
            showLeftSidebar={false}
            showRightSidebar={false}
        >
            <Head title="Paramètres de compte" />
            <SettingsLayout>
                {/* Container principal avec largeur contrôlée */}
                <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    {/* Header de la page */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Paramètres du compte
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Gérez vos informations personnelles et
                            professionnelles
                        </p>
                    </div>

                    {/* Barre de progression du profil */}
                    {completion_percentage !== undefined && (
                        <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Complétion du profil
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {completion_percentage}% complété
                                    </p>
                                </div>
                                {completion_percentage === 100 && (
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                )}
                            </div>

                            <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="absolute h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                                    style={{
                                        width: `${completion_percentage}%`,
                                    }}
                                />
                            </div>

                            {missing_fields && missing_fields.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-sm text-gray-700">
                                        Champs à remplir pour un profil complet
                                        :
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {missing_fields.map((field) => (
                                            <span
                                                key={field}
                                                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                                            >
                                                {field}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation des sections - Responsive avec scroll horizontal */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() =>
                                            setActiveSection(section.id)
                                        }
                                        className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                                            activeSection === section.id
                                                ? 'bg-emerald-600 text-white shadow-md'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="whitespace-nowrap">
                                            {section.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contenu des sections - Avec padding responsive */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
                        {/* Section : Informations personnelles */}
                        {activeSection === 'personal' && (
                            <div className="space-y-6">
                                <HeadingSmall
                                    title="Informations personnelles"
                                    description="Mise à jour de vos informations de base"
                                />

                                <form
                                    onSubmit={handlePersonalInfoUpdate}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="full_name">
                                                Nom complet *
                                            </Label>
                                            <Input
                                                id="full_name"
                                                name="full_name"
                                                defaultValue={user.full_name}
                                                required
                                                placeholder="Votre nom complet"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="username">
                                                Nom d'utilisateur *
                                            </Label>
                                            <Input
                                                id="username"
                                                name="username"
                                                defaultValue={user.username}
                                                required
                                                placeholder="@votre_username"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Biographie</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            defaultValue={user?.bio || ''}
                                            rows={4}
                                            placeholder="Parlez-nous de vous..."
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-gray-500">
                                            {user?.bio?.length || 0}/500
                                            caractères
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                Téléphone mobile *
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                defaultValue={user.phone}
                                                required
                                                placeholder="+226 XX XX XX XX"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone_secondary">
                                                Téléphone bureau
                                            </Label>
                                            <Input
                                                id="phone_secondary"
                                                name="phone_secondary"
                                                type="tel"
                                                defaultValue={
                                                    user.phone_secondary
                                                }
                                                placeholder="+226 XX XX XX XX"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="whatsapp">
                                                WhatsApp
                                            </Label>
                                            <Input
                                                id="whatsapp"
                                                name="whatsapp"
                                                type="tel"
                                                defaultValue={user.whatsapp}
                                                placeholder="+226 XX XX XX XX"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">
                                                Email *
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={user.email}
                                                required
                                            />
                                            {mustVerifyEmail &&
                                                !user.email_verified_at && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Email non vérifié.{' '}
                                                        <Link
                                                            href="/email/verification-notification"
                                                            as="button"
                                                            className="text-emerald-600 underline hover:text-emerald-700"
                                                        >
                                                            Renvoyer l'email
                                                        </Link>
                                                    </p>
                                                )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="date_of_birth">
                                                Date de naissance
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                name="date_of_birth"
                                                type="date"
                                                defaultValue={
                                                    user.date_of_birth
                                                        ? user.date_of_birth.split(
                                                              'T',
                                                          )[0]
                                                        : ''
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="gender">
                                                Genre
                                            </Label>
                                            <select
                                                id="gender"
                                                name="gender"
                                                defaultValue={user.gender}
                                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            >
                                                <option value="">
                                                    Sélectionner
                                                </option>
                                                <option value="male">
                                                    Homme
                                                </option>
                                                <option value="female">
                                                    Femme
                                                </option>
                                            </select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="nationality">
                                                Nationalité
                                            </Label>
                                            <Input
                                                id="nationality"
                                                name="nationality"
                                                defaultValue={user.nationality}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="submit"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            Enregistrer
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Les autres sections suivent le même pattern... */}
                        {/* Je vais inclure seulement quelques exemples pour la brièveté */}

                        {/* Section : Localisation */}
                        {activeSection === 'location' && (
                            <div className="space-y-6">
                                <HeadingSmall
                                    title="Localisation"
                                    description="Votre localisation géographique"
                                />

                                <form
                                    onSubmit={handleLocationUpdate}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="location">
                                                Localisation générale *
                                            </Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                defaultValue={user.location}
                                                required
                                                placeholder="Ex: Ouagadougou, Burkina Faso"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="region">
                                                Région
                                            </Label>
                                            <Input
                                                id="region"
                                                name="region"
                                                defaultValue={user.region}
                                                placeholder="Ex: Centre"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="city">Ville</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                defaultValue={user.city}
                                                placeholder="Ex: Ouagadougou"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="district">
                                                Quartier
                                            </Label>
                                            <Input
                                                id="district"
                                                name="district"
                                                defaultValue={user.district}
                                                placeholder="Ex: Gounghin"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="address">
                                            Adresse complète
                                        </Label>
                                        <Textarea
                                            id="address"
                                            name="address"
                                            defaultValue={user.address}
                                            rows={3}
                                            placeholder="Adresse détaillée..."
                                        />
                                    </div>

                                    <Button type="submit">
                                        Enregistrer la localisation
                                    </Button>
                                </form>
                            </div>
                        )}
                        
                        {/* Section : Specialisation */}
                        {activeSection === 'specialisation' &&
                            is_practitioner && (
                                <div className="space-y-6">
                                    <HeadingSmall
                                        title="Informations professionnelles"
                                        description="Vos compétences et spécialités"
                                    />

                                    <form
                                        onSubmit={handleSpecializationUpdate}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-base font-semibold">
                                                    Spécialisations
                                                </Label>
                                                <p className="text-sm text-gray-600">
                                                    Sélectionnez vos domaines
                                                    d'expertise et indiquez
                                                    votre niveau
                                                </p>
                                            </div>

                                            {/* Grille de spécialisations */}
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {specializations.map((spec) => {
                                                    const isSelected =
                                                        selectedSpecializations.includes(
                                                            spec.id,
                                                        );

                                                    return (
                                                        <div
                                                            key={spec.id}
                                                            className={`rounded-lg border-2 p-4 transition-all ${
                                                                isSelected
                                                                    ? 'border-green-500 bg-green-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {/* Checkbox de sélection */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleSpecialization(
                                                                            spec.id,
                                                                        )
                                                                    }
                                                                    className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                                                                        isSelected
                                                                            ? 'border-green-500 bg-green-500'
                                                                            : 'border-gray-300'
                                                                    }`}
                                                                >
                                                                    {isSelected && (
                                                                        <Check className="h-3 w-3 text-white" />
                                                                    )}
                                                                </button>

                                                                <div className="flex-1">
                                                                    {/* Nom de la spécialisation */}
                                                                    <div className="flex items-center gap-2">
                                                                        {spec.icon && (
                                                                            <span className="text-xl">
                                                                                {
                                                                                    spec.icon
                                                                                }
                                                                            </span>
                                                                        )}
                                                                        <h4 className="font-medium text-gray-900">
                                                                            {
                                                                                spec.name
                                                                            }
                                                                        </h4>
                                                                    </div>

                                                                    {/* Description */}
                                                                    {spec.description && (
                                                                        <p className="mt-1 text-xs text-gray-600">
                                                                            {
                                                                                spec.description
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    {/* Sélecteur de niveau si sélectionné */}
                                                                    {isSelected && (
                                                                        <div className="mt-3">
                                                                            <Label className="text-xs text-gray-700">
                                                                                Niveau
                                                                                de
                                                                                maîtrise
                                                                            </Label>
                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                                {proficiencyOptions.map(
                                                                                    (
                                                                                        option,
                                                                                    ) => (
                                                                                        <button
                                                                                            key={
                                                                                                option.value
                                                                                            }
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                                updateProficiencyLevel(
                                                                                                    spec.id,
                                                                                                    option.value,
                                                                                                )
                                                                                            }
                                                                                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                                                                                proficiencyLevels[
                                                                                                    spec
                                                                                                        .id
                                                                                                ] ===
                                                                                                option.value
                                                                                                    ? option.color
                                                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                                            }`}
                                                                                        >
                                                                                            {
                                                                                                option.label
                                                                                            }
                                                                                        </button>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Champs cachés pour la soumission */}
                                                            {isSelected && (
                                                                <>
                                                                    <input
                                                                        type="hidden"
                                                                        name={`specialization_ids[]`}
                                                                        value={
                                                                            spec.id
                                                                        }
                                                                    />
                                                                    <input
                                                                        type="hidden"
                                                                        name={`proficiency_levels[]`}
                                                                        value={
                                                                            proficiencyLevels[
                                                                                spec
                                                                                    .id
                                                                            ]
                                                                        }
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Résumé des sélections */}
                                            {selectedSpecializations.length >
                                                0 && (
                                                <div className="rounded-lg bg-blue-50 p-4">
                                                    <p className="mb-2 text-sm font-medium text-blue-900">
                                                        Vos spécialisations (
                                                        {
                                                            selectedSpecializations.length
                                                        }
                                                        )
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedSpecializations.map(
                                                            (specId) => {
                                                                const spec =
                                                                    specializations.find(
                                                                        (s) =>
                                                                            s.id ===
                                                                            specId,
                                                                    );
                                                                const level =
                                                                    proficiencyLevels[
                                                                        specId
                                                                    ];
                                                                const levelLabel =
                                                                    proficiencyOptions.find(
                                                                        (o) =>
                                                                            o.value ===
                                                                            level,
                                                                    )?.label;

                                                                return (
                                                                    <Badge
                                                                        key={
                                                                            specId
                                                                        }
                                                                        variant="secondary"
                                                                        className="gap-1"
                                                                    >
                                                                        {
                                                                            spec?.name
                                                                        }{' '}
                                                                        •{' '}
                                                                        {
                                                                            levelLabel
                                                                        }
                                                                    </Badge>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <Button type="submit">
                                                Enregistrer les informations
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                        {/* Section : Informations professionnelles (tradipraticiens uniquement) */}
                        {activeSection === 'professional' &&
                            is_practitioner && (
                                <div className="space-y-6">
                                    <HeadingSmall
                                        title="Informations professionnelles"
                                        description="Vos compétences et spécialités"
                                    />

                                    <form
                                        onSubmit={handleProfessionalUpdate}
                                        className="space-y-6"
                                    >
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="grid gap-2">
                                                <Label htmlFor="years_of_experience">
                                                    Années d'expérience
                                                </Label>
                                                <Input
                                                    id="years_of_experience"
                                                    name="years_of_experience"
                                                    type="number"
                                                    min="0"
                                                    defaultValue={
                                                        user.years_of_experience
                                                    }
                                                    placeholder="Ex: 10"
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="certification_number">
                                                    Numéro de certification
                                                </Label>
                                                <Input
                                                    id="certification_number"
                                                    name="certification_number"
                                                    defaultValue={
                                                        user.certification_number
                                                    }
                                                    placeholder="Numéro officiel"
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="intervention_radius_km">
                                                    Rayon d'intervention (km)
                                                </Label>
                                                <Input
                                                    id="intervention_radius_km"
                                                    name="intervention_radius_km"
                                                    type="number"
                                                    min="0"
                                                    defaultValue={
                                                        user.intervention_radius_km
                                                    }
                                                    placeholder="Ex: 50"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            {/* <div className="grid gap-2">
                                        <Label htmlFor="specialties">
                                            Spécialités
                                        </Label>
                                        <Textarea
                                            id="specialties"
                                            name="specialties"
                                            defaultValue={user.specialties}
                                            rows={2}
                                            placeholder="Ex: Phytothérapie, Massage traditionnel..."
                                        />
                                        <p className="text-xs text-gray-500">
                                            Séparez les langues par des virgules
                                        </p>
                                    </div> */}

                                            <div className="grid gap-2">
                                                <Label htmlFor="languages">
                                                    Langues parlées
                                                </Label>
                                                <Textarea
                                                    id="languages"
                                                    name="languages"
                                                    defaultValue={
                                                        Array.isArray(
                                                            user.languages,
                                                        )
                                                            ? user.languages.join(
                                                                  ', ',
                                                              )
                                                            : user.languages ||
                                                              ''
                                                    }
                                                    rows={2}
                                                    placeholder="Ex: Français, Mooré, Dioula"
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Séparez les langues par des
                                                    virgules
                                                </p>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="treatment_methods">
                                                    Méthodes de traitement
                                                </Label>
                                                <Textarea
                                                    id="treatment_methods"
                                                    name="treatment_methods"
                                                    defaultValue={
                                                        Array.isArray(
                                                            user.treatment_methods,
                                                        )
                                                            ? user.treatment_methods.join(
                                                                  ', ',
                                                              )
                                                            : user.treatment_methods ||
                                                              ''
                                                    }
                                                    rows={3}
                                                    placeholder="Ex: Phytothérapie, Massage, Acupuncture"
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Séparez les méthodes par des
                                                    virgules
                                                </p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="professional_affiliations">
                                                    Affiliations
                                                    professionnelles
                                                </Label>
                                                <Textarea
                                                    id="professional_affiliations"
                                                    name="professional_affiliations"
                                                    defaultValue={
                                                        Array.isArray(
                                                            user.professional_affiliations,
                                                        )
                                                            ? user.professional_affiliations.join(
                                                                  ', ',
                                                              )
                                                            : user.professional_affiliations ||
                                                              ''
                                                    }
                                                    rows={3}
                                                    placeholder="Ex: Association des Tradipraticiens du Burkina"
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Séparez les affiliations par
                                                    des virgules
                                                </p>
                                            </div>
                                        </div>

                                        <Button type="submit">
                                            Enregistrer les informations
                                        </Button>
                                    </form>
                                </div>
                            )}

                        {/* Section : Réseaux sociaux */}
                        {activeSection === 'social' && (
                            <div className="space-y-6">
                                <HeadingSmall
                                    title="Réseaux sociaux"
                                    description="Vos liens de réseaux sociaux"
                                />

                                <form
                                    onSubmit={handleSocialMediaUpdate}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="website">
                                                Site web
                                            </Label>
                                            <Input
                                                id="website"
                                                name="website"
                                                type="url"
                                                defaultValue={user.website}
                                                placeholder="https://votresite.com"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="facebook_url">
                                                Facebook
                                            </Label>
                                            <Input
                                                id="facebook_url"
                                                name="facebook_url"
                                                type="url"
                                                defaultValue={user.facebook_url}
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="instagram_url">
                                                Instagram
                                            </Label>
                                            <Input
                                                id="instagram_url"
                                                name="instagram_url"
                                                type="url"
                                                defaultValue={
                                                    user.instagram_url
                                                }
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="youtube_url">
                                                YouTube
                                            </Label>
                                            <Input
                                                id="youtube_url"
                                                name="youtube_url"
                                                type="url"
                                                defaultValue={user.youtube_url}
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="tiktok_url">
                                                Tiktok
                                            </Label>
                                            <Input
                                                id="tiktok_url"
                                                name="tiktok_url"
                                                type="url"
                                                defaultValue={user.tiktok_url}
                                                placeholder="https://tiktok.com/..."
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="linkedin_url">
                                                LinkedIn
                                            </Label>
                                            <Input
                                                id="linkedin_url"
                                                name="linkedin_url"
                                                type="url"
                                                defaultValue={user.linkedin_url}
                                                placeholder="https://linkedin.com/..."
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit">
                                        Enregistrer les réseaux sociaux
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Section : Tarifs (tradipraticiens uniquement) */}
                        {activeSection === 'pricing' && is_practitioner && (
                            <div className="space-y-6">
                                <HeadingSmall
                                    title="Tarifs"
                                    description="Vos tarifs de consultation"
                                />

                                <form
                                    onSubmit={handlePricingUpdate}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="consultation_price_min">
                                                Prix consultation minimal (FCFA)
                                                *
                                            </Label>
                                            <Input
                                                id="consultation_price_min"
                                                name="consultation_price_min"
                                                type="number"
                                                min="0"
                                                step="100"
                                                defaultValue={
                                                    user.consultation_price_min
                                                }
                                                required
                                                placeholder="Ex: 1000"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="consultation_price_max">
                                                Prix consultation maximal (FCFA)
                                                *
                                            </Label>
                                            <Input
                                                id="consultation_price_max"
                                                name="consultation_price_max"
                                                type="number"
                                                min="0"
                                                step="100"
                                                defaultValue={
                                                    user.consultation_price_max
                                                }
                                                required
                                                placeholder="Ex: 10000"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="currency">
                                                Devise
                                            </Label>
                                            <select
                                                id="currency"
                                                name="currency"
                                                defaultValue={
                                                    user.currency || 'FCFA'
                                                }
                                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            >
                                                <option value="FCFA">
                                                    FCFA
                                                </option>
                                                <option value="EUR">
                                                    Euro (€)
                                                </option>
                                                <option value="USD">
                                                    Dollar ($)
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="payment_methods">
                                                Modes de paiement acceptés
                                            </Label>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="payment_methods[]" // ✅ Important : [] pour array
                                                        value="cash"
                                                        defaultChecked={
                                                            Array.isArray(
                                                                user.payment_methods,
                                                            )
                                                                ? user.payment_methods.includes(
                                                                      'cash',
                                                                  )
                                                                : false
                                                        }
                                                        className="rounded border-gray-300"
                                                    />
                                                    <span className="text-sm">
                                                        Espèces
                                                    </span>
                                                </label>

                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="payment_methods[]"
                                                        value="mobile_money"
                                                        defaultChecked={
                                                            Array.isArray(
                                                                user.payment_methods,
                                                            )
                                                                ? user.payment_methods.includes(
                                                                      'mobile_money',
                                                                  )
                                                                : false
                                                        }
                                                        className="rounded border-gray-300"
                                                    />
                                                    <span className="text-sm">
                                                        Mobile Money
                                                    </span>
                                                </label>

                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="payment_methods[]"
                                                        value="bank_transfer"
                                                        defaultChecked={
                                                            Array.isArray(
                                                                user.payment_methods,
                                                            )
                                                                ? user.payment_methods.includes(
                                                                      'bank_transfer',
                                                                  )
                                                                : false
                                                        }
                                                        className="rounded border-gray-300"
                                                    />
                                                    <span className="text-sm">
                                                        Virement bancaire
                                                    </span>
                                                </label>

                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name="payment_methods[]"
                                                        value="credit_card"
                                                        defaultChecked={
                                                            Array.isArray(
                                                                user.payment_methods,
                                                            )
                                                                ? user.payment_methods.includes(
                                                                      'credit_card',
                                                                  )
                                                                : false
                                                        }
                                                        className="rounded border-gray-300"
                                                    />
                                                    <span className="text-sm">
                                                        Carte bancaire
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="pricing_notes">
                                                Notes sur les tarifs
                                            </Label>
                                            <Textarea
                                                id="pricing_notes"
                                                name="pricing_notes"
                                                defaultValue={
                                                    user.pricing_notes
                                                }
                                                rows={3}
                                                placeholder="Informations supplémentaires sur vos tarifs..."
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit">
                                        Enregistrer les tarifs
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Section : Disponibilités (tradipraticiens uniquement) */}
                        {activeSection === 'availability' &&
                            is_practitioner && (
                                <div className="space-y-6">
                                    <HeadingSmall
                                        title="Disponibilités"
                                        description="Vos horaires de disponibilité"
                                    />

                                    <form
                                        onSubmit={handleAvailabilityUpdate}
                                        className="space-y-6"
                                    >
                                        <div className="grid gap-4">
                                            {[
                                                'Lundi',
                                                'Mardi',
                                                'Mercredi',
                                                'Jeudi',
                                                'Vendredi',
                                                'Samedi',
                                                'Dimanche',
                                            ].map((day, index) => (
                                                <div
                                                    key={day}
                                                    className="rounded-lg border border-gray-200 p-4"
                                                >
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                name={`availability[${index}][active]`}
                                                                defaultChecked={
                                                                    user
                                                                        .availability_schedule?.[
                                                                        index
                                                                    ]?.open ||
                                                                    false
                                                                }
                                                                className="rounded border-gray-300"
                                                            />
                                                            <span className="font-medium">
                                                                {day}
                                                            </span>
                                                        </label>
                                                    </div>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`availability_${index}_start`}
                                                            >
                                                                Heure de début
                                                            </Label>
                                                            <Input
                                                                id={`availability_${index}_start`}
                                                                name={`availability[${index}][start_time]`}
                                                                type="time"
                                                                defaultValue={
                                                                    user
                                                                        .availability_schedule?.[
                                                                        index
                                                                    ]
                                                                        ?.slots?.[0]
                                                                        ?.start ||
                                                                    ''
                                                                }
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`availability_${index}_end`}
                                                            >
                                                                Heure de fin
                                                            </Label>
                                                            <Input
                                                                id={`availability_${index}_end`}
                                                                name={`availability[${index}][end_time]`}
                                                                type="time"
                                                                defaultValue={
                                                                    user
                                                                        .availability_schedule?.[
                                                                        index
                                                                    ]
                                                                        ?.slots?.[0]
                                                                        ?.end ||
                                                                    ''
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="online_consultation_available">
                                                    Consultation en ligne
                                                </Label>
                                                <Switch
                                                    id="online_consultation_available"
                                                    checked={
                                                        onlineConsultationAvailable
                                                    }
                                                    onChange={(e) =>
                                                        setOnlineConsultationAvailable(
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="home_consultation_available">
                                                    Consultation à domicile
                                                </Label>
                                                <Switch
                                                    id="home_consultation_available"
                                                    checked={
                                                        homeConsultationAvailable
                                                    }
                                                    onChange={(e) =>
                                                        setHomeConsultationAvailable(
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="accepts_emergencies">
                                                    Accepte les urgences
                                                </Label>
                                                <Switch
                                                    id="accepts_emergencies"
                                                    checked={acceptsEmergency}
                                                    onChange={(e) =>
                                                        setAcceptsEmergency(
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="consultation_duration_minutes">
                                                    Durée (min)
                                                </Label>
                                                <Input
                                                    id="consultation_duration_minutes"
                                                    name="consultation_duration_minutes"
                                                    type="number"
                                                    min="15"
                                                    max="480"
                                                    step="15"
                                                    defaultValue={
                                                        user.consultation_duration_minutes ||
                                                        60
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit">
                                            Enregistrer les disponibilités
                                        </Button>
                                    </form>
                                </div>
                            )}

                        {/* Section : Formations (tradipraticiens uniquement) */}
                        {activeSection === 'trainings' && is_practitioner && (
                            <div className="space-y-6">
                                <HeadingSmall
                                    title="Formations et Diplômes"
                                    description="Ajoutez vos formations et diplômes professionnels"
                                />

                                <form
                                    onSubmit={handleTrainingsUpdate}
                                    className="space-y-6"
                                >
                                    {/* Formations */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">
                                                Formations professionnelles
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addTraining}
                                            >
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Ajouter une formation
                                            </Button>
                                        </div>

                                        {trainings.map(
                                            (training: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative space-y-3 rounded-lg border p-4"
                                                >
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 right-2"
                                                        onClick={() =>
                                                            removeTraining(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>

                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`training-title-${index}`}
                                                            >
                                                                Titre de la
                                                                formation *
                                                            </Label>
                                                            <Input
                                                                id={`training-title-${index}`}
                                                                name={`trainings[${index}][title]`}
                                                                value={
                                                                    training.title
                                                                }
                                                                onChange={(e) =>
                                                                    updateTraining(
                                                                        index,
                                                                        'title',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Ex: Phytothérapie avancée"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`training-institution-${index}`}
                                                            >
                                                                Institution
                                                            </Label>
                                                            <Input
                                                                id={`training-institution-${index}`}
                                                                name={`trainings[${index}][institution]`}
                                                                value={
                                                                    training.institution ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateTraining(
                                                                        index,
                                                                        'institution',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Ex: Centre de formation..."
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`training-year-${index}`}
                                                            >
                                                                Année
                                                            </Label>
                                                            <Input
                                                                id={`training-year-${index}`}
                                                                name={`trainings[${index}][year]`}
                                                                type="number"
                                                                min="1900"
                                                                max={new Date().getFullYear()}
                                                                value={
                                                                    training.year ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateTraining(
                                                                        index,
                                                                        'year',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="2020"
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`training-certificate-${index}`}
                                                            >
                                                                Lien du
                                                                certificat
                                                            </Label>
                                                            <Input
                                                                id={`training-certificate-${index}`}
                                                                name={`trainings[${index}][certificate_url]`}
                                                                type="url"
                                                                value={
                                                                    training.certificate_url ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateTraining(
                                                                        index,
                                                                        'certificate_url',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}

                                        {trainings.length === 0 && (
                                            <p className="py-4 text-center text-sm text-muted-foreground">
                                                Aucune formation ajoutée.
                                                Cliquez sur "Ajouter une
                                                formation" pour commencer.
                                            </p>
                                        )}
                                    </div>

                                    {/* Diplômes */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">
                                                Diplômes
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addDegree}
                                            >
                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                Ajouter un diplôme
                                            </Button>
                                        </div>

                                        {degrees.map(
                                            (degree: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative space-y-3 rounded-lg border p-4"
                                                >
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 right-2"
                                                        onClick={() =>
                                                            removeDegree(index)
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>

                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`degree-title-${index}`}
                                                            >
                                                                Titre du diplôme
                                                                *
                                                            </Label>
                                                            <Input
                                                                id={`degree-title-${index}`}
                                                                name={`degrees[${index}][title]`}
                                                                value={
                                                                    degree.title
                                                                }
                                                                onChange={(e) =>
                                                                    updateDegree(
                                                                        index,
                                                                        'title',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Ex: Diplôme en médecine traditionnelle"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`degree-institution-${index}`}
                                                            >
                                                                Institution
                                                            </Label>
                                                            <Input
                                                                id={`degree-institution-${index}`}
                                                                name={`degrees[${index}][institution]`}
                                                                value={
                                                                    degree.institution ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateDegree(
                                                                        index,
                                                                        'institution',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Ex: Université..."
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label
                                                            htmlFor={`degree-year-${index}`}
                                                        >
                                                            Année
                                                        </Label>
                                                        <Input
                                                            id={`degree-year-${index}`}
                                                            name={`degrees[${index}][year]`}
                                                            type="number"
                                                            min="1900"
                                                            max={new Date().getFullYear()}
                                                            value={
                                                                degree.year ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                updateDegree(
                                                                    index,
                                                                    'year',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="2015"
                                                        />
                                                    </div>
                                                </div>
                                            ),
                                        )}

                                        {degrees.length === 0 && (
                                            <p className="py-4 text-center text-sm text-muted-foreground">
                                                Aucun diplôme ajouté. Cliquez
                                                sur "Ajouter un diplôme" pour
                                                commencer.
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            'Enregistrer les formations'
                                        )}
                                    </Button>
                                </form>
                            </div>
                        )}
                        {/* Section : Préférences */}
                        {activeSection === 'preferences' && (
                            <div className="space-y-6">
                                <HeadingSmall
                                    title="Préférences du compte"
                                    description="Paramètres généraux de votre compte"
                                />

                                <form
                                    onSubmit={handlePreferenceUpdate}
                                    className="space-y-6"
                                >
                                    <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                        <div>
                                            <p className="font-medium">
                                                Compte privé
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Les utilisateurs doivent
                                                demander à vous suivre
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.is_private}
                                            onChange={(e) =>
                                                updatePreference(
                                                    'is_private',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-5 w-5 rounded border-gray-300"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                        <div>
                                            <p className="font-medium">
                                                Visible dans les recherches
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Apparaître dans les résultats de
                                                recherche
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.is_searchable}
                                            onChange={(e) =>
                                                updatePreference(
                                                    'is_searchable',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-5 w-5 rounded border-gray-300"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                        <div>
                                            <p className="font-medium">
                                                Afficher le numéro de téléphone
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Rendre votre numéro visible sur
                                                votre profil
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="show_phone_on_profile"
                                            checked={
                                                preferences.show_phone_on_profile
                                            }
                                            onChange={(e) =>
                                                updatePreference(
                                                    'show_phone_on_profile',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-5 w-5 rounded border-gray-300"
                                        />
                                    </label>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold">
                                            Notifications
                                        </h3>

                                        <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                            <div>
                                                <p className="font-medium">
                                                    Notifications email
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Recevoir des emails pour les
                                                    activités importantes
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="email_notifications_enabled"
                                                checked={
                                                    preferences.email_notifications_enabled
                                                }
                                                onChange={(e) =>
                                                    updatePreference(
                                                        'email_notifications_enabled',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 rounded border-gray-300"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                            <div>
                                                <p className="font-medium">
                                                    Notifications push
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Recevoir des notifications
                                                    sur votre appareil
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="push_notifications_enabled"
                                                checked={
                                                    preferences.push_notifications_enabled
                                                }
                                                onChange={(e) =>
                                                    updatePreference(
                                                        'push_notifications_enabled',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 rounded border-gray-300"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                                            <div>
                                                <p className="font-medium">
                                                    Notifications de messages
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Être notifié des nouveaux
                                                    messages
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                name="message_notifications_enabled"
                                                checked={
                                                    preferences.message_notifications_enabled
                                                }
                                                onChange={(e) =>
                                                    updatePreference(
                                                        'message_notifications_enabled',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-5 w-5 rounded border-gray-300"
                                            />
                                        </label>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="preferred_language">
                                            Langue préférée
                                        </Label>
                                        <select
                                            value={
                                                preferences.preferred_language
                                            }
                                            onChange={(e) =>
                                                updatePreference(
                                                    'preferred_language',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            <option value="fr">Français</option>
                                            <option value="en">English</option>
                                            <option value="mooré">Mooré</option>
                                            <option value="dioula">
                                                Dioula
                                            </option>
                                        </select>
                                    </div>
                                    <Button type="submit">
                                        Enregistrer les préférences
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Delete User - Bien séparé */}
                    <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm sm:p-6">
                        <DeleteUser />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
