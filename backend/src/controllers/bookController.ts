import { Request, Response } from 'express';
// Đảm bảo bạn đã có file service này, nếu chưa có thì code sẽ báo đỏ, ta sẽ xử lý sau
import * as bookService from '../services/bookService';

export const getBooks = async (req: Request, res: Response) => {
    try {
        // Lấy từ khóa tìm kiếm và lọc theo danh mục từ query param
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
        
        // Nếu có file upload (từ Multer), lưu đường dẫn ảnh vào database
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

        // Nếu có file upload mới, cập nhật đường dẫn ảnh mới
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
        // Lỗi thường gặp: Sách đang được mượn (Ràng buộc khóa ngoại trong DB)
        console.error(error);
        res.status(500).json({ message: 'Không thể xóa sách này (có thể đang được mượn)' });
    }
};