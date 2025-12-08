import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';


interface BookResult extends RowDataPacket {
    book_id: number;
    name: string;
    author: string;
    publisher: string;
    year_published: number;
    category_id: number;
    total_copies: number;
    available_copies: number; 
    image_url?: string;
    category_name?: string; 
}


interface BookData {
    name?: string;
    author?: string;
    publisher?: string;
    year_published?: number;
    category_id?: number;
    total_copies?: number;
    available_copies?: number;
    image_url?: string;
}

const BookModel = {
    
    getAll: async (keyword: string = '', categoryId: number = 0): Promise<BookResult[]> => {
        let sql = `
            SELECT b.*, c.name as category_name 
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.category_id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (keyword) {
            sql += ` AND (b.name LIKE ? OR b.author LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (categoryId > 0) {
            sql += ` AND b.category_id = ?`;
            params.push(categoryId);
        }

        sql += ` ORDER BY b.book_id DESC`; 

        const [rows] = await db.query<BookResult[]>(sql, params);
        return rows;
    },

    
    getById: async (id: number): Promise<BookResult | undefined> => {
        const sql = `SELECT * FROM books WHERE book_id = ?`;
        const [rows] = await db.query<BookResult[]>(sql, [id]);
        return rows[0];
    },

    
    create: async (data: BookData): Promise<number> => {
        const sql = `
            INSERT INTO books (name, author, publisher, year_published, category_id, total_copies, available_copies, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        
        const available = data.available_copies !== undefined ? data.available_copies : data.total_copies;

        const [result] = await db.query<ResultSetHeader>(sql, [
            data.name, 
            data.author, 
            data.publisher, 
            data.year_published, 
            data.category_id, 
            data.total_copies, 
            available, 
            data.image_url
        ]);
        return result.insertId;
    },

    
    update: async (id: number, data: BookData): Promise<void> => {
        
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.author !== undefined) { fields.push('author = ?'); values.push(data.author); }
        if (data.publisher !== undefined) { fields.push('publisher = ?'); values.push(data.publisher); }
        if (data.year_published !== undefined) { fields.push('year_published = ?'); values.push(data.year_published); }
        if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
        
        
        if (data.total_copies !== undefined) { 
            fields.push('total_copies = ?'); values.push(data.total_copies); 
        }
        if (data.available_copies !== undefined) {
             fields.push('available_copies = ?'); values.push(data.available_copies); 
        }

        if (data.image_url !== undefined) { fields.push('image_url = ?'); values.push(data.image_url); }

        
        if (fields.length === 0) return;

        const sql = `UPDATE books SET ${fields.join(', ')} WHERE book_id = ?`;
        values.push(id);

        await db.query(sql, values);
    },

    
    delete: async (id: number): Promise<void> => {
        await db.query(`DELETE FROM books WHERE book_id = ?`, [id]);
    }
};

export default BookModel;