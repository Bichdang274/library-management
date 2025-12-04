import pool from '../config/database';
import { Category } from '../models/Category';


export const getAllCategories = async (): Promise<Category[]> => {
    const [rows] = await pool.query<Category[]>('SELECT * FROM categories ORDER BY category_name ASC');
    return rows;
};


export const createCategory = async (name: string): Promise<void> => {
    await pool.query('INSERT INTO categories (category_name) VALUES (?)', [name]);
};


export const updateCategory = async (id: number, name: string): Promise<void> => {
    await pool.query('UPDATE categories SET category_name = ? WHERE category_id = ?', [name, id]);
};


export const deleteCategory = async (id: number): Promise<void> => {
    // Lưu ý: Nếu thể loại đang có sách, DB sẽ báo lỗi (do ràng buộc RESTRICT)
    await pool.query('DELETE FROM categories WHERE category_id = ?', [id]);
};