import { Request, Response } from 'express';
import * as borrowService from '../services/borrowService';
import { AuthRequest } from '../middleware/authMiddleware';

// 1. Admin xem danh sách tất cả phiếu mượn
export const getAll = async (req: Request, res: Response) => {
    try {
        const data = await borrowService.getAllBorrows();
        res.status(200).json(data);
    } catch (error: any) {
        console.error("Borrow GetAll Error:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách mượn' });
    }
};

// 2. User xem lịch sử mượn của chính mình
export const getMyHistory = async (req: AuthRequest, res: Response) => {
    try {
        // req.user có được từ middleware verifyToken
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Chưa xác thực người dùng' });
        }

        const data = await borrowService.getMyBorrows(req.user.id);
        res.status(200).json(data);
    } catch (error: any) {
        console.error("My History Error:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy lịch sử' });
    }
};

// 3. Tạo phiếu mượn sách (User thực hiện)
export const createBorrow = async (req: AuthRequest, res: Response) => {
    try {
        const { bookId, days } = req.body;
        const readerId = req.user?.id; // Lấy ID người đang đăng nhập

        if (!readerId) {
            return res.status(401).json({ message: 'Bạn cần đăng nhập để mượn sách' });
        }

        if (!bookId) {
            return res.status(400).json({ message: 'Vui lòng chọn sách để mượn' });
        }

        // Gọi service xử lý logic (check sách còn không, trừ số lượng...)
        await borrowService.borrowBook(readerId, bookId, days || 14); // Mặc định mượn 14 ngày

        res.status(201).json({ 
            success: true, 
            message: 'Đăng ký mượn sách thành công!' 
        });
    } catch (error: any) {
        console.error("Create Borrow Error:", error);
        res.status(400).json({ message: error.message || 'Lỗi khi mượn sách' });
    }
};

// 4. Trả sách (Admin/Thủ thư thực hiện)
export const returnBook = async (req: Request, res: Response) => {
    try {
        const borrowId = Number(req.params.id);
        
        // Gọi service xử lý logic (cộng lại số lượng sách...)
        await borrowService.returnBook(borrowId);
        
        res.status(200).json({ 
            success: true, 
            message: 'Đã xác nhận trả sách thành công' 
        });
    } catch (error: any) {
        console.error("Return Book Error:", error);
        res.status(400).json({ message: error.message || 'Lỗi khi trả sách' });
    }
};