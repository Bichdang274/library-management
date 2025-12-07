// backend/src/controllers/book1Controller.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export const getAllBooks = async (req: Request, res: Response) => {
    try {
        console.log("📚 Đang lấy danh sách sách (Book1 Controller)...");

        // Lưu ý: Tên bảng trong Database vẫn là 'books' nhé (không phải book1)
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM books');
        
        const books = rows.map((book: any) => ({
            ...book,
            // Xử lý logic available_copies
            available_copies: book.available_copies ?? book.total_copies 
        }));

        res.json(books);
    } catch (error: any) {
        console.error("❌ Lỗi lấy sách:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

export const getBookById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM books WHERE book_id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }
        
        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};