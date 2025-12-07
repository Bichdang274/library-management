import { Request, Response } from 'express';
import * as bookService from '../services/bookService';

export const getBooks = async (req: Request, res: Response) => {
    try {
        const keyword = req.query.search as string || '';
        const categoryId = Number(req.query.category) || 0;

        const books = await bookService.getAllBooks(keyword, categoryId);
        res.status(200).json(books);
    } catch (error: any) {
        console.error("Get Books Error:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách sách' });
    }
};

export const getBookById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const book = await bookService.getBookById(id);
        res.status(200).json(book);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createBook = async (req: Request, res: Response) => {
    try {
        const bookData = req.body;
        
        // Xử lý ảnh upload từ Multer
        if (req.file) {
            // Lưu đường dẫn tương đối để frontend dễ truy cập
            bookData.image_url = `/uploads/${req.file.filename}`;
        }

        const newBookId = await bookService.createBook(bookData);
        res.status(201).json({ 
            success: true, 
            message: 'Thêm sách thành công', 
            bookId: newBookId 
        });
    } catch (error: any) {
        console.error("Create Book Error:", error);
        res.status(500).json({ message: error.message || 'Lỗi khi thêm sách' });
    }
};

export const updateBook = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const bookData = req.body;

        if (req.file) {
            bookData.image_url = `/uploads/${req.file.filename}`;
        }

        await bookService.updateBook(id, bookData);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error: any) {
        console.error("Update Book Error:", error);
        res.status(500).json({ message: error.message || 'Lỗi khi cập nhật sách' });
    }
};

export const deleteBook = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await bookService.deleteBook(id);
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error: any) {
        console.error("Delete Book Error:", error);
        // Lỗi Foreign Key (đang có người mượn)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Không thể xóa: Sách này đang có người mượn hoặc có dữ liệu liên quan.' });
        }
        res.status(500).json({ message: 'Lỗi server khi xóa sách' });
    }
};