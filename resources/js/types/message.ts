// types/message.ts

import { User } from './user';

export interface Message {
    id: string;
    from_user_id: string;
    to_user_id: string;
    text: string | null;
    message_type: 'text' | 'image';
    media_url: string | null;
    seen: boolean;
    created_at: string;
    updated_at: string;
    sender?: User;
    receiver?: User;
}

export interface Conversation {
    user: User;
    last_message: Message | null;
    unread_count: number;
}

export interface MessagePageProps {
    conversations?: Conversation[];
    conversation_with?: User;
    messages?: Message[];
    unread_total?: number;
    selected_user_id?: string;
    auth: {
        user: User;
    };
    [key: string]: any;
}
