import { Request, Response } from 'express';
import * as bookService from '../services/bookService';


export const getBooks = async (req: Request, res: Response) => {
    try {
        const keyword = req.query.search as string || '';
        const categoryId = Number(req.query.category) || 0;

        const books = await bookService.getAllBooks(keyword, categoryId);
        res.status(200).json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const createBook = async (req: Request, res: Response) => {
    try {
        const bookData = req.body;
        
        if (req.file) {
            bookData.image_url = `/uploads/${req.file.filename}`;
        }

        const newBookId = await bookService.createBook(bookData);
        res.status(201).json({ message: 'Thêm sách thành công', bookId: newBookId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm sách' });
    }
};


export const updateBook = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const bookData = req.body;

        // Nếu có file upload, cập nhật đường dẫn mới
        if (req.file) {
            bookData.image_url = `/uploads/${req.file.filename}`;
        }

        await bookService.updateBook(id, bookData);
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sách' });
    }
};


export const deleteBook = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await bookService.deleteBook(id);
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        // Lỗi thường gặp: Sách đang được mượn (Ràng buộc khóa ngoại)
        console.error(error);
        res.status(500).json({ message: 'Không thể xóa sách này (có thể đang được mượn)' });
    }
};