export interface Item {
    id: number;
    title: string;
    url?: string | null;
    summary?: string | null; // Renamed from content
    points: number;
    author: string;
    created_at: string;
    created_by?: string; // Renamed from user_id
    category?: string;
    parent_id?: number | null;
    children?: Item[];
} // For nested comments
