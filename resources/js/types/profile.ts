import { Post } from './post';
import { User } from './user';

export interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface ProfileStats {
    posts_count: number;
    reposts_count: number;
    followers_count: number;
    following_count: number;
    connections_count: number;
    shares_count: number;
    likes_count: number;
    comments_count: number;
    quotes_count: number;
}

export interface Relationship {
    is_own_profile: boolean;
    is_following: boolean;
    is_follower: boolean;
    is_connected: boolean;
    is_private_locked: boolean;
    has_pending_request: boolean;
}

export interface ProfilePageProps {
    profile_user: User;
    posts: PaginatedPosts;
    media_posts: Post[];
    liked_posts: PaginatedPosts;
    stats: ProfileStats;
    relationship: Relationship;
    auth: {
        user: User;
    };
}

export interface UserProfileInfoProps {
    user: User;
    stats: ProfileStats;
    relationship: Relationship;
    setShowEdit: (show: boolean) => void;
    onUpdate?: () => void;
}

export interface ProfileModalProps {
    user: User;
    setShowEdit: (show: boolean) => void;
    onUpdate?: () => void;
}
