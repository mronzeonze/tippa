/**
 * useSettings.ts
 * Hook React pour accéder aux paramètres de la plateforme
 * partagés globalement via Inertia (HandleInertiaRequests.php).
 *
 * Usage dans n'importe quel composant :
 *
 *   import { useSettings } from '@/hooks/useSettings';
 *
 *   const { maxPostLength, isRegistrationOpen, isModerationEnabled } = useSettings();
 *
 * Emplacement : resources/js/hooks/useSettings.ts
 */

import { usePage } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

export interface AppSettings {
    // Général
    app_name?: string;
    app_description?: string;
    contact_email?: string;

    // Utilisateurs
    allow_registration?: boolean;
    min_age_registration?: number;

    // Contenu
    max_post_length?: number;
    max_images_per_post?: number;
    max_image_size?: number; // en Ko

    // Notifications
    email_notifications_enabled?: boolean;
    push_notifications_enabled?: boolean;

    // Sécurité
    two_factor_enabled?: boolean;
}

export interface PlatformStatus {
    maintenance_mode: boolean;
    registration_open: boolean;
    moderation_enabled: boolean;
    two_factor_enabled: boolean;
    push_enabled: boolean;
}

interface SharedPageProps {
    app_settings: AppSettings;
    platform_status: PlatformStatus;
    app: {
        name: string;
        description: string;
    };
    auth: {
        user: any;
    };
    [key: string]: any; // pour les autres props éventuelles
}

// ─────────────────────────────────────────────────────────
// VALEURS PAR DÉFAUT (identiques aux valeurs de la migration)
// ─────────────────────────────────────────────────────────

const DEFAULTS: Required<AppSettings> = {
    app_name: 'Pharmacopee',
    app_description: '',
    contact_email: 'contact@pharmacopee.com',
    allow_registration: true,
    min_age_registration: 18,
    max_post_length: 5000,
    max_images_per_post: 10,
    max_image_size: 5120,
    email_notifications_enabled: true,
    push_notifications_enabled: true,
    two_factor_enabled: false,
};

// ─────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────

export function useSettings() {
    const page = usePage<SharedPageProps>();
    const raw = page.props.app_settings ?? {};
    const status = page.props.platform_status ?? {
        maintenance_mode: false,
        registration_open: true,
        moderation_enabled: true,
        two_factor_enabled: false,
        push_enabled: true,
    };

    // Fusion des valeurs serveur avec les défauts locaux
    const s: Required<AppSettings> = { ...DEFAULTS, ...raw };

    return {
        // ── Accesseurs directs ──────────────────────────────────────
        appName: s.app_name,
        appDescription: s.app_description,
        contactEmail: s.contact_email,

        // ── Inscriptions ────────────────────────────────────────────
        isRegistrationOpen: status.registration_open,
        minAge: s.min_age_registration,

        // ── Contenu ─────────────────────────────────────────────────
        maxPostLength: s.max_post_length,
        maxImagesPerPost: s.max_images_per_post,
        maxImageSizeKb: s.max_image_size,
        maxImageSizeBytes: s.max_image_size * 1024,

        // ── Modération ──────────────────────────────────────────────
        isModerationEnabled: status.moderation_enabled,

        // ── Notifications ───────────────────────────────────────────
        isEmailNotifEnabled: s.email_notifications_enabled,
        isPushEnabled: status.push_enabled,

        // ── Sécurité ────────────────────────────────────────────────
        isTwoFactorEnabled: status.two_factor_enabled,

        // ── Maintenance ─────────────────────────────────────────────
        isMaintenanceMode: status.maintenance_mode,

        // ── Objet brut (pour accès direct si besoin) ─────────────────
        raw: s,
        status,
    };
}

// ─────────────────────────────────────────────────────────
// HOOK POUR LA VALIDATION DES POSTS (create-post.tsx)
// ─────────────────────────────────────────────────────────

/**
 * Retourne des fonctions de validation basées sur les paramètres plateforme.
 *
 * Usage :
 *   const { validateContent, validateImages } = usePostValidation();
 *   const error = validateContent(content);
 */
export function usePostValidation() {
    const {
        maxPostLength,
        maxImagesPerPost,
        maxImageSizeKb,
        maxImageSizeBytes,
    } = useSettings();

    const validateContent = (content: string): string | null => {
        if (content.length > maxPostLength) {
            return `Le contenu dépasse la limite de ${maxPostLength.toLocaleString('fr-FR')} caractères.`;
        }
        return null;
    };

    const validateImages = (files: File[]): string | null => {
        if (files.length > maxImagesPerPost) {
            return `Vous ne pouvez pas ajouter plus de ${maxImagesPerPost} images.`;
        }
        const oversized = files.find((f) => f.size > maxImageSizeBytes);
        if (oversized) {
            return `"${oversized.name}" dépasse la taille maximale de ${maxImageSizeKb} Ko.`;
        }
        return null;
    };

    return {
        validateContent,
        validateImages,
        maxPostLength,
        maxImagesPerPost,
        maxImageSizeKb,
    };
}

// ─────────────────────────────────────────────────────────
// HOOK POUR AFFICHER DES ALERTES CONTEXTUELLE (maintenance, inscriptions…)
// ─────────────────────────────────────────────────────────

/**
 * Retourne des drapeaux utiles pour afficher des bannières et alertes.
 *
 * Usage :
 *   const { showMaintenanceBanner, showRegistrationClosedAlert } = usePlatformAlerts();
 */
export function usePlatformAlerts() {
    const { isMaintenanceMode, isRegistrationOpen } = useSettings();
    const { user } = usePage<SharedPageProps>().props.auth;

    const isAdmin = ['admin', 'super-admin'].includes(user?.role ?? '');

    return {
        // Bannière maintenance (visible uniquement pour les admins connectés)
        showMaintenanceBanner: isMaintenanceMode && isAdmin,

        // Alerte "inscriptions fermées" sur la page register
        showRegistrationClosedAlert: !isRegistrationOpen,
    };
}
