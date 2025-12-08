// backend/src/routes/borrowRoutes.ts

import { Router } from 'express';
import * as borrowController from '../controllers/borrowController';

const router = Router();

// --- API Quản lý (Admin) ---
// Lấy danh sách đang mượn (URL: /api/transactions/active)
router.get('/active', borrowController.getActiveLoans); 

// Trả sách (URL: /api/transactions/return)
router.post('/return', borrowController.returnBook); 

// --- API Sinh viên (Frontend Home) ---
// Mượn giỏ sách (URL: /api/transactions/checkout) 
router.post('/checkout', borrowController.borrowCart);       

// Lịch sử mượn của độc giả (URL: /api/transactions/history/:readerId)
router.get('/history/:readerId', borrowController.getHistoryByReader);

export default router;