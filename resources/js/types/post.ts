// types/post.ts

import { User } from './user';

// Interface pour une image associée à un post
export interface PostImage {
    id: string; // Identifiant unique de l'image (UUID)
    post_id: string; // ID du post auquel l'image appartient
    image_url: string; // URL complète de l'image stockée
    created_at: string; // Date de création de l'image
    updated_at: string; // Date de dernière modification
}

// Interface pour un post dans le système
export interface Post {
    id: string; // Identifiant unique du post (UUID)
    user_id: string; // ID de l'utilisateur créateur
    content: string; // Contenu textuel du post
    original_post: any // Contenu original pour les reposts/quotes (null si post normal)
    post_type: 'text' | 'image' | 'text_with_image'; // Type de post (3 valeurs possibles)

    // Relations
    user: User; // Relation : utilisateur créateur (eager loaded)
    images: PostImage[]; // Relation : tableau des images du post

    liked_by?: User[]; // Relation : utilisateurs ayant liké (optionnel)
    item_type?: 'post' | 'repost' | 'quote'; //
    share_id?: number; // AJOUTÉ

    // Pour les reposts/quotes
    reposted_by?: User; // AJOUTÉ
    repost_content?: string | null; // AJOUTÉ
    repost_date?: string; // AJOUTÉ
    original_author?: User; // AJOUTÉ

    // Compteurs
    likes_count: number; // Nombre total de likes
    comments_count: number; // Nombre total de commentaires
    shares_count: number; // Nombre total de partages
    reposts_count?: number;

    // États
    is_liked: boolean; // Indique si l'utilisateur courant a liké
    is_reposted: boolean; // Indique si l'utilisateur courant a republié

    // Dates
    created_at: string; // Date de création du post
    updated_at: string; // Date de dernière modification
}

// Interface pour la pagination des posts (Laravel)
export interface PaginatedPosts {
    data: Post[]; // Tableau des posts de la page courante
    current_page: number; // Numéro de la page courante
    last_page: number; // Numéro de la dernière page
    per_page: number; // Nombre de posts par page
    total: number; // Nombre total de posts
    from: number; // Index du premier post de la page
    to: number; // Index du dernier post de la page
    next_page_url: string | null; // URL de la page suivante (null si dernière page)
    prev_page_url: string | null; // URL de la page précédente (null si première page)
}

// Interface pour les props Inertia partagées
export interface PageProps {
    posts: PaginatedPosts;
    stats: Stats;
    filters: Filters;
    post_types: Record<string, string>;
    auth: {
        // Objet d'authentification
        user: User; // Utilisateur actuellement connecté
    };
    [key: string]: any;
}

// Interface modifiée pour PageProps sans pagination
export interface PagePropsNoPagination {
    posts: Post[]; // Tableau simple de posts (plus de pagination)
    auth: {
        user: User; // Utilisateur actuellement connecté
    };
    [key: string]: unknown; // Index signature pour d'autres props dynamiques
}

// Interface pour les props du composant PostCard
export interface PostCardProps {
    post: Post; // Le post à afficher
    onUpdate?: () => void; // Callback optionnel appelé après une action (like, delete)
}
export interface Stats {
    total_posts: number;
    posts_today: number;
    posts_week: number;
    posts_month: number;
    text_posts: number;
    image_posts: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
}

export interface Filters {
    search: string;
    user_id: string;
    post_type: string;
    date_from: string;
    date_to: string;
    sort_by: string;
    sort_order: string;
}

export interface Share {
    id: string;
    share_type: string;
    content?: string;
    created_at: string;
    user: {
        id: string;
        full_name: string;
        username: string;
        profile_picture: string;
    };
}
