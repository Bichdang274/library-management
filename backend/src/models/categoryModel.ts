import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';

export interface Category extends RowDataPacket {
    category_id: number;
    category_name: string;
}

const CategoryModel = {
    getAll: async (): Promise<Category[]> => {
        const [rows] = await db.query<Category[]>('SELECT * FROM categories ORDER BY category_name ASC');
        return rows;
    },

    getById: async (id: number): Promise<Category | undefined> => {
        const [rows] = await db.query<Category[]>('SELECT * FROM categories WHERE category_id = ?', [id]);
        return rows[0];
    },

    create: async (name: string): Promise<number> => {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO categories (category_name) VALUES (?)',
            [name]
        );
        return result.insertId;
    },

    update: async (id: number, name: string): Promise<void> => {
        await db.query(
            'UPDATE categories SET category_name = ? WHERE category_id = ?',
            [name, id]
        );
    },

    delete: async (id: number): Promise<void> => {
        await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
    }
};

export default CategoryModel;