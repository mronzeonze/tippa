// // Interface pour un utilisateur du système
// export interface User {
//     id: string; // Identifiant unique de l'utilisateur (UUID)
//     email: string; // Adresse email de l'utilisateur
//     full_name: string; // Nom complet de l'utilisateur
//     username: string; // Nom d'utilisateur unique (@username)
//     bio: string; // Biographie de l'utilisateur
//     role: 'user' | 'admin' | 'moderator' | 'super-admin'; // Rôle de l'utilisateur dans le système
//     profile_picture: string | null; // URL de la photo de profil (nullable)
//     cover_photo: string | null; // URL de la photo de couverture (nullable)
//     is_verified: boolean | null; // Indique si l'utilisateur est vérifié (optionnel)
//     location: string | null; // Localisation de l'utilisateur (nullable)
//     created_at: string | null; // Date de création du compte (nullable)
//     updated_at: string | null; // Date de la dernière mise à jour du compte (nullable)
//     email_verified_at: string | null; // Date de vérification de l'email (nullable)
//     account_type: 'user' | 'practitioner' | 'expert'; // Métier : user, practitioner, expert
//     is_banned: boolean; // Indique si l'utilisateur est banni
//     is_expert: boolean; // Indique si l'utilisateur est un expert
//     years_of_experience: number | null; // Années d'expérience (nullable)
//     specialties: string[]; // Spécialités de l'utilisateur (tableau de chaînes)
//     consultation_price_min: number | null; // Prix minimum des consultations (nullable)
//     consultation_price_max: number | null; // Prix maximum des consultations (nullable)
//     ratings_average: number | null; // Note moyenne des évaluations (nullable)
//     ratings_count: number | null; // Nombre total d'évaluations (nullable)
//     rating: number | null; // Note spécifique (nullable)
//     total_ratings: number | null; // Nombre total de notes (nullable)
//     languages: string[]; // Langues parlées par l'utilisateur (tableau de chaînes)
//     intervention_radius_km: number | null; // Rayon d'intervention en kilomètres (nullable)
//     phone: string | null; // Numéro de téléphone (nullable)
//     whatsapp: string | null; // Numéro WhatsApp (nullable)
//     facebook: string | null; // Lien Facebook (nullable)
//     twitter: string | null; // Lien Twitter (nullable)
//     instagram: string | null; // Lien Instagram (nullable)
//     currency: string | null; // Devise préférée (nullable)

import { Role } from "./role";

    
// }

/**
 * ═══════════════════════════════════════════════════════════════════════
 * INTERFACE USER - PLATEFORME TRADIPRATICIENS
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Interface TypeScript correspondant au modèle Laravel User.php
 * Définit la structure complète d'un utilisateur de la plateforme
 */

// ═══════════════════════════════════════════════════════════════════════
// TYPES AUXILIAIRES
// ═══════════════════════════════════════════════════════════════════════

export type AccountType = 'user' | 'practitioner' | 'expert';
export type UserRole = 'user' | 'moderator' | 'admin' | 'super-admin';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface DaySchedule {
    open: boolean;
    slots?: Array<{
        start: string;
        end: string;
    }>;
}

export interface AvailabilitySchedule {
    monday?: DaySchedule;
    tuesday?: DaySchedule;
    wednesday?: DaySchedule;
    thursday?: DaySchedule;
    friday?: DaySchedule;
    saturday?: DaySchedule;
    sunday?: DaySchedule;
}

// ═══════════════════════════════════════════════════════════════════════
// INTERFACE PRINCIPALE USER
// ═══════════════════════════════════════════════════════════════════════

export interface User {
    // ─────────────────────────────────────────────────────────────────────
    // 1. IDENTIFIANTS DE BASE
    // ─────────────────────────────────────────────────────────────────────
    id: string; // UUID
    email: string; // Email unique
    full_name: string; // Nom complet
    username: string; // Nom d'utilisateur (@username)

    // ─────────────────────────────────────────────────────────────────────
    // 2. TYPES ET STATUTS
    // ─────────────────────────────────────────────────────────────────────
    account_type: AccountType; // Type de compte (métier)
    roles: UserRole; // Rôle (permissions)
    role: Role; // Rôle (permissions)
    is_active: boolean; // Compte actif
    is_verified: boolean; // Profil vérifié par admin
    is_expert: boolean; // Statut expert
    is_banned: boolean; // Compte banni
    is_private: boolean; // Compte privé
    is_online: boolean; // Compte en ligne

    // ─────────────────────────────────────────────────────────────────────
    // 3. INFORMATIONS PERSONNELLES DE BASE
    // ─────────────────────────────────────────────────────────────────────
    bio: string | null; // Biographie
    profile_picture: string | null; // URL photo de profil
    cover_photo: string | null; // URL photo de couverture
    location: string | null; // Localisation générale
    phone: string | null; // Téléphone principal
    date_of_birth: string | null; // Date de naissance (format: YYYY-MM-DD)
    gender: Gender | null; // Genre
    nationality: string | null; // Nationalité

    // ─────────────────────────────────────────────────────────────────────
    // 4. LOCALISATION DÉTAILLÉE
    // ─────────────────────────────────────────────────────────────────────
    region: string | null; // Région
    city: string | null; // Ville
    district: string | null; // Quartier/District
    address: string | null; // Adresse complète

    // ─────────────────────────────────────────────────────────────────────
    // 5. INFORMATIONS PROFESSIONNELLES (Tradipraticiens)
    // ─────────────────────────────────────────────────────────────────────
    years_of_experience: number | null; // Années d'expérience
    certification_number: string | null; // Numéro de certification
    certification_document: string | null; // Document de certification (URL)
    verified_at: string | null; // Date de vérification
    verified_by: string | null; // ID de l'admin qui a vérifié
    verification_status: VerificationStatus; // Statut de vérification
    rejection_reason: string | null; // Raison du rejet (si rejeté)

    // ─────────────────────────────────────────────────────────────────────
    // 6. COMPÉTENCES ET SPÉCIALITÉS
    // ─────────────────────────────────────────────────────────────────────
    languages: string[]; // Langues parlées
    specialties: string[]; // Spécialités médicales
    treatment_methods: string[]; // Méthodes de traitement

    // ─────────────────────────────────────────────────────────────────────
    // 7. TARIFS ET CONSULTATIONS
    // ─────────────────────────────────────────────────────────────────────
    consultation_price_min: number | null; // Prix minimum
    consultation_price_max: number | null; // Prix maximum
    currency: string | null; // Devise (XOF, EUR, etc.)
    payment_methods: string[]; // Modes de paiement acceptés
    pricing_notes: string | null; // Notes sur les tarifs
    home_consultation_available: boolean; // Consultation à domicile
    online_consultation_available: boolean; // Consultation en ligne
    consultation_duration_minutes: number | null; // Durée moyenne consultation
    intervention_radius_km: number | null; // Rayon d'intervention

    // ─────────────────────────────────────────────────────────────────────
    // 8. FORMATIONS ET AFFILIATIONS
    // ─────────────────────────────────────────────────────────────────────
    trainings: Array<{
        // Formations suivies
        title: string;
        institution: string;
        year?: number;
        duration?: string;
    }> | null;

    degrees: Array<{
        // Diplômes
        title: string;
        institution: string;
        year: number;
    }> | null;

    professional_affiliations: Array<{
        // Affiliations professionnelles
        organization: string;
        membership_number?: string;
        since?: number;
    }> | null;

    // ─────────────────────────────────────────────────────────────────────
    // 9. DISPONIBILITÉS
    // ─────────────────────────────────────────────────────────────────────
    availability_schedule: AvailabilitySchedule | null; // Planning hebdomadaire
    closed_dates: string[] | null; // Dates de fermeture
    booking_advance_hours: number | null; // Heures d'avance pour RDV
    accepts_emergencies: boolean; // Accepte les urgences

    // ─────────────────────────────────────────────────────────────────────
    // 10. RÉSEAUX SOCIAUX ET CONTACTS
    // ─────────────────────────────────────────────────────────────────────
    phone_secondary: string | null; // Téléphone secondaire
    whatsapp: string | null; // Numéro WhatsApp
    website: string | null; // Site web
    facebook_url: string | null; // Facebook
    instagram_url: string | null; // Instagram
    youtube_url: string | null; // YouTube
    linkedin_url: string | null; // LinkedIn
    tiktok_url: string | null; // TikTok

    // ─────────────────────────────────────────────────────────────────────
    // 11. STATISTIQUES
    // ─────────────────────────────────────────────────────────────────────
    followers_count: number; // Nombre d'abonnés
    following_count: number; // Nombre d'abonnements
    posts_count: number; // Nombre de publications
    recipes_count: number; // Nombre de recettes
    rating: number; // Note moyenne (/5)
    total_ratings: number; // Nombre total d'évaluations

    // ─────────────────────────────────────────────────────────────────────
    // 12. PRÉFÉRENCES UTILISATEUR
    // ─────────────────────────────────────────────────────────────────────
    preferred_language: string | null; // Langue préférée
    email_notifications_enabled: boolean; // Notifications par email
    push_notifications_enabled: boolean; // Notifications push
    is_searchable: boolean; // Visible dans recherche
    show_phone_on_profile: boolean; // Afficher téléphone

    // ─────────────────────────────────────────────────────────────────────
    // 13. PROFIL ET TRACKING
    // ─────────────────────────────────────────────────────────────────────
    profile_completion_percentage: number; // % de complétion du profil
    profile_last_updated_at: string | null; // Dernière mise à jour profil
    is_profile_complete: boolean; // Profil complété (>80%)
    last_active_at: string | null; // Dernière activité

    // ─────────────────────────────────────────────────────────────────────
    // 14. SÉCURITÉ
    // ─────────────────────────────────────────────────────────────────────
    failed_login_attempts: number; // Tentatives échouées
    locked_until: string | null; // Compte verrouillé jusqu'à
    banned_at: string | null; // Date du bannissement
    banned_by: string | null; // ID de l'admin qui a banni
    ban_reason: string | null; // Raison du bannissement

    // ─────────────────────────────────────────────────────────────────────
    // 15. DATES SYSTÈME
    // ─────────────────────────────────────────────────────────────────────
    created_at: string | null; // Date de création
    updated_at: string | null; // Date de mise à jour
    email_verified_at: string | null; // Date de vérification email
    deleted_at?: string | null; // Date de suppression (soft delete)
}

// ═══════════════════════════════════════════════════════════════════════
// INTERFACES AUXILIAIRES POUR RELATIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Utilisateur avec statistiques de relation
 */
export interface UserWithRelationship extends User {
    is_following?: boolean;                      // Vous le suivez
    is_follower?: boolean;                       // Il vous suit
    is_connected?: boolean;                      // Connectés (amis)
    has_pending_request?: boolean;               // Demande en attente
    connection_status?: 'none' | 'pending' | 'accepted';
}

/**
 * Utilisateur simplifié (pour listes)
 */
export interface UserSummary {
    id: string;
    full_name: string;
    username: string;
    profile_picture: string | null;
    account_type: AccountType;
    is_verified: boolean;
    is_expert: boolean;
    rating?: number;
}

/**
 * Tradipraticien avec informations complètes
 */
export interface Practitioner extends User {
    account_type: 'practitioner' | 'expert';
    years_of_experience: number;
    specialties: string[];
    consultation_price_min: number;
    consultation_price_max: number;
    rating: number;
    total_ratings: number;
}

// ═══════════════════════════════════════════════════════════════════════
// TYPE GUARDS (Fonctions de vérification de type)
// ═══════════════════════════════════════════════════════════════════════

export function isPractitioner(user: User): user is Practitioner {
    return user.account_type === 'practitioner' || user.account_type === 'expert';
}

export function isAdmin(user: User): boolean {
    return user.roles === 'admin' || user.roles === 'super-admin';
}

export function isModerator(user: User): boolean {
    return user.roles === 'moderator' || user.roles === 'admin' || user.roles === 'super-admin';
}

export function isVerified(user: User): boolean {
    return user.is_verified === true;
}

export function isExpert(user: User): boolean {
    return user.is_expert === true;
}

// ═══════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Obtenir le label du type de compte
 */
export function getAccountTypeLabel(accountType: AccountType): string {
    const labels: Record<AccountType, string> = {
        'user': 'Utilisateur',
        'practitioner': 'Tradipraticien',
        'expert': 'Expert',
    };
    return labels[accountType];
}

/**
 * Obtenir le label du rôle
 */
export function getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
        'user': 'Utilisateur',
        'moderator': 'Modérateur',
        'admin': 'Administrateur',
        'super-admin': 'Super Administrateur',
    };
    return labels[role];
}

/**
 * Obtenir le label du genre
 */
export function getGenderLabel(gender: Gender | null): string {
    if (!gender) return 'Non renseigné';
    
    const labels: Record<Gender, string> = {
        'male': 'Homme',
        'female': 'Femme',
        'other': 'Autre',
        'prefer_not_to_say': 'Non précisé',
    };
    return labels[gender];
}

/**
 * Formater la fourchette de prix
 */
export function formatPriceRange(user: User): string | null {
    if (!user.consultation_price_min && !user.consultation_price_max) {
        return null;
    }

    const currency = user.currency || 'XOF';

    if (user.consultation_price_min && user.consultation_price_max) {
        return `${user.consultation_price_min.toLocaleString()} - ${user.consultation_price_max.toLocaleString()} ${currency}`;
    }

    if (user.consultation_price_min) {
        return `À partir de ${user.consultation_price_min.toLocaleString()} ${currency}`;
    }

    return `Jusqu'à ${user.consultation_price_max!.toLocaleString()} ${currency}`;
}

/**
 * Obtenir l'adresse complète
 */
export function getFullAddress(user: User): string {
    const parts = [
        user.address,
        user.district,
        user.city,
        user.region,
        user.location,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Non renseignée';
}

/**
 * Vérifier si disponible aujourd'hui
 */
export function isAvailableToday(user: User): boolean {
    if (!user.availability_schedule) {
        return false;
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const schedule = user.availability_schedule[today as keyof AvailabilitySchedule];
    
    return schedule?.open === true;
}