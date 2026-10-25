export interface Specialization {
    id: string | number;
    name: string;
    slug: string;
    description: string | null;
    users_count: number;
    is_active: boolean;
    icon?: string | null;
    created_at?: string;
}

export interface Stats {
    total: number;
    active: number;
    inactive: number;
    total_users: number;
}

export interface PageProps {
    specializations: Specialization[];
    stats: Stats;
    search: string;
    [key: string]: any;
}