import pool from '../config/db';
import { Book } from '../models/Book';


export const getAllBooks = async (keyword: string = '', categoryId: number = 0): Promise<Book[]> => {
    let sql = `
        SELECT b.*, c.category_name 
        FROM books b 
        LEFT JOIN categories c ON b.category_id = c.category_id 
        WHERE 1=1
    `;
    
    const params: any[] = [];

    // Lọc theo tên sách hoặc tác giả
    if (keyword) {
        sql += ` AND (b.name LIKE ? OR b.author LIKE ?)`;
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // Lọc theo thể loại
    if (categoryId > 0) {
        sql += ` AND b.category_id = ?`;
        params.push(categoryId);
    }

    sql += ` ORDER BY b.book_id DESC`;

    const [rows] = await pool.query<Book[]>(sql, params);
    return rows;
};


export const createBook = async (bookData: any): Promise<number> => {
    const { name, author, publisher, year_published, category_id, total_copies, image_url } = bookData;
    // Logic: Khi tạo mới, số lượng khả dụng (available) = tổng số lượng (total)
    const [result] = await pool.query(
        `INSERT INTO books (name, author, publisher, year_published, category_id, total_copies, available_copies)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, author, publisher, year_published, category_id, total_copies, total_copies]
    );
    
    return (result as any).insertId;
};


export const updateBook = async (id: number, bookData: any): Promise<void> => {
    const { name, author, publisher, year_published, category_id, total_copies, image_url } = bookData;
    
    // Logic cập nhật ảnh: Nếu có ảnh mới (image_url khác null) thì cập nhật, nếu không thì giữ nguyên ảnh cũ
    let sql = `UPDATE books SET name=?, author=?, publisher=?, year_published=?, category_id=?, total_copies=?, available_copies=?`;
    const params = [name, author, publisher, year_published, category_id, total_copies, total_copies];

    if (image_url) {
        sql += `, image_url=?`;
        params.push(image_url);
    }

    sql += ` WHERE book_id=?`;
    params.push(id);

    await pool.query(sql, params);
};


export const deleteBook = async (id: number): Promise<void> => {
    await pool.query('DELETE FROM books WHERE book_id = ?', [id]);
};