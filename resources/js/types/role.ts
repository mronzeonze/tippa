export interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    level: number;
    is_default: boolean;
    users_count: number;
    permissions_count: number;
    permissions: string[];
}

export interface Permission {
    id: number;
    name: string;
    slug: string;
    group: string;
    description?: string;
}

export interface PageProps {
    roles: Role[];
    permissions: Record<string, Permission[]>;
    
    [key: string]: any;
}