import type { Request, Response } from 'express';
const BookModel = require('../models/bookModel');
exports.getBooks = async (req: Request, res: Response) => {
    try {
        const books = await BookModel.getAll(); 
        res.status(200).json({ data: books });
    } catch (err: unknown) {
        console.error("Lỗi khi lấy danh sách sách:", err);
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi server không xác định" });
    }
};