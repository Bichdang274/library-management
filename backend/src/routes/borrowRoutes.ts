import { Router } from 'express';
import * as borrowController from '../controllers/borrowController';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware';

const router = Router();

// --- KHU VỰC ADMIN ---
// Xem tất cả danh sách mượn trả
router.get('/all', verifyAdmin, borrowController.getAll);

// Xác nhận trả sách (Admin bấm nút "Đã trả")
router.put('/:id/return', verifyAdmin, borrowController.returnBook);


// --- KHU VỰC USER (ĐỘC GIẢ) ---
// Xem lịch sử mượn của bản thân
router.get('/my-history', verifyToken, borrowController.getMyHistory);

// Đăng ký mượn sách
router.post('/', verifyToken, borrowController.createBorrow);

export default router;