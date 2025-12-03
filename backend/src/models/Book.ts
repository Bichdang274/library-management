import { RowDataPacket } from 'mysql2';

export interface Book extends RowDataPacket {
    book_id: number;
    name: string;
    author: string | null;
    publisher: string | null;
    year_published: number | null;
    category_id: number;
    total_copies: number;
    available_copies: number;
    category_name?: string; // Dùng khi join bảng
}