import { User } from './user';

export interface Reply {
    id: string;
    content: string;
    created_at: string;
    user: User;
    likes_count: number;
    is_liked: boolean;
    replies: Reply[]; // Récursif pour supporter les réponses imbriquées
}

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    user: User;
    likes_count: number;
    is_liked: boolean;
    replies: Reply[];
}

export interface CommentsModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
    initialCount: number;
    onCommentsUpdate?: (count: number) => void; // Nouveau callback
}

export interface PageProps {
    auth: {
        user: User;
    };
    comments?: Comment[];
    commentsCount?: number;
    [key: string]: unknown;
}
