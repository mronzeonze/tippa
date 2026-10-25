import { User } from './user';

export interface Story {
    id: string;
    content: string | null;
    media_type: 'text' | 'image' | 'video';
    media_url: string | null;
    background_color: string;
    created_at: string;
    expires_at: string;
}

export interface UserWithStories {
    user: User;
    stories: Story[];
    stories_count: number;
    last_story_at: string;
}

export interface StoriesData {
    stories: UserWithStories[];
}

export interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}

export interface StoryViewerProps {
    userStories: UserWithStories;
    setViewStory: (story: UserWithStories | null) => void;
    onStoryDeleted?: () => void;
}
