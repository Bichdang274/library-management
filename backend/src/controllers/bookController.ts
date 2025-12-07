// backend/src/controllers/bookController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// --- 1. LẤY DANH SÁCH ---
export const getBooks = async (req: Request, res: Response) => {
    try {
        const { search, category_id } = req.query;
        
        let sql = `
            SELECT b.*, c.category_name 
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.category_id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (search) {
            sql += ` AND (b.name LIKE ? OR b.author LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category_id && Number(category_id) > 0) {
            sql += ` AND b.category_id = ?`;
            params.push(category_id);
        }

        sql += ` ORDER BY b.book_id DESC`;

        const [rows] = await pool.query<RowDataPacket[]>(sql, params);
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- 2. LẤY CHI TIẾT ---
export const getBookById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE book_id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy sách' });
        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- 3. TẠO SÁCH MỚI (Lưu URL ảnh) ---
export const createBook = async (req: Request, res: Response) => {
    try {
        // Nhận image_url từ body
        const { name, author, publisher, year_published, category_id, total_copies, image_url } = req.body;

        // available_copies mặc định bằng total_copies
        const available_copies = total_copies;

        const sql = `
            INSERT INTO books 
            (name, author, publisher, year_published, category_id, total_copies, available_copies, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await pool.query(sql, [
            name, author, publisher, year_published, category_id, total_copies, available_copies, 
            image_url || null // Nếu không nhập thì lưu NULL
        ]);

        res.status(201).json({ message: 'Thêm sách thành công' });
    } catch (error: any) {
        console.error("Create Book Error:", error);
        res.status(500).json({ message: 'Lỗi khi thêm sách', error: error.message });
    }
};

// --- 4. CẬP NHẬT SÁCH ---
export const updateBook = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, author, publisher, year_published, category_id, total_copies, image_url } = req.body;
        
        const sql = `
            UPDATE books 
            SET name=?, author=?, publisher=?, year_published=?, category_id=?, total_copies=?, image_url=?
            WHERE book_id=?
        `;

        await pool.query(sql, [
            name, author, publisher, year_published, category_id, total_copies, 
            image_url || null, // Cập nhật link ảnh mới
            id
        ]);

        res.json({ message: 'Cập nhật sách thành công' });

    } catch (error: any) {
        console.error("Update Book Error:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sách', error: error.message });
    }
};

// --- 5. XÓA SÁCH ---
export const deleteBook = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM books WHERE book_id = ?', [id]);
        res.json({ message: 'Đã xóa sách thành công' });
    } catch (error: any) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Không thể xóa sách này vì đang có người mượn.' });
        }
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};