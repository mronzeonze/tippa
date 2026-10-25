// types/connection.ts

import { User } from './user';
export interface Connection {
    id: string;
    from_user_id: string;
    to_user_id: string;
    status: 'pending' | 'accepted';
    created_at: string;
    updated_at: string;
    sender?: User;
    receiver?: User;
}

export interface ConnectionWithUser {
    user: User;
    is_connected: boolean;
    has_pending_request?: boolean;
    is_following_back?: boolean;
    is_follower?: boolean;
    followers_count?: number;
    following_count?: number;
}

export interface PendingRequest {
    connection_id: string;
    user: User;
    created_at: string;
    is_following?: boolean;
}

export interface ConnectionCounts {
    connections: number;
    followers: number;
    following: number;
    pending: number;
}

export interface ConnectionPageProps {
    connections: ConnectionWithUser[];
    followers: ConnectionWithUser[];
    following: ConnectionWithUser[];
    pending_requests: PendingRequest[];
    sent_requests: PendingRequest[];
    counts: ConnectionCounts;
    active_tab: string;
    auth: {
        user: User;
    };
    [key: string]: any;
}
