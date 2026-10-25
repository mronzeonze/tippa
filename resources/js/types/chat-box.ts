import { Message } from './message';
import { User } from './user';

export interface ChatBoxPageProps {
    messages: Message[];
    conversation_with: User;
    auth: {
        user: User;
    };
    [key: string]: any;
}
