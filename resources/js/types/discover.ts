// types/discover.ts

import { User } from './user';

export interface DiscoverUser {
    id: string;
    full_name: string;
    username: string;
    bio: string;
    profile_picture: string | null;
    location: string | null;
    followers_count: number;
    following_count: number;
    is_following: boolean;
    is_follower?: boolean;
    is_connected: boolean;
    has_pending_request: boolean;
}

export interface PaginatedUsers {
    data: DiscoverUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

export interface DiscoverPageProps {
    users?: PaginatedUsers; // Optionnel
    suggestions?: DiscoverUser[]; // Optionnel
    search_query?: string; // Optionnel
    auth: {
        user: User;
    };
    [key: string]: any;
}
