// backend/src/routes/borrowRoutes.ts
import { Router } from 'express';
import * as borrowController from '../controllers/borrowController';

const router = Router();

// Lấy danh sách đang mượn
// URL: /api/transactions/active
router.get('/active', borrowController.getActiveLoans);

// Tạo phiếu mượn
// URL: /api/transactions/borrow
router.post('/borrow', borrowController.borrowBook);

// Trả sách
// URL: /api/transactions/return
router.post('/return', borrowController.returnBook);



// API cho Admin quản lý
router.get('/active', borrowController.getActiveLoans);
router.post('/return', borrowController.returnBook);

// API cho Sinh viên (Frontend Home)
router.post('/checkout', borrowController.borrowCart);       // Mượn giỏ sách
router.get('/history/:readerId', borrowController.getHistoryByReader);
export default router;