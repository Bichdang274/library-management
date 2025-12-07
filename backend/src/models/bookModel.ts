import type { Pool, RowDataPacket } from 'mysql2/promise';
import db from '../config/db';


interface BookResult extends RowDataPacket {
    book_id: number;
    name: string;
    author: string;
    publisher: string;
    year_published: number;
    category_id: number;
    total_copies: number;
}

const BookModel = {
    getAll: async (): Promise<BookResult[]> => {
        const sql = `
            SELECT 
                book_id, name, author, publisher, year_published, category_id, total_copies
            FROM 
                books 
            ORDER BY 
                name ASC
        `;
        const [rows] = await db.query<BookResult[]>(sql); 
        return rows;
    },
};

module.exports = BookModel;