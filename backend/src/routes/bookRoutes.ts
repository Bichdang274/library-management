// backend/src/routes/bookRoutes.ts
import { Router } from 'express';
import * as bookController from '../controllers/bookController';

const router = Router();

// Lấy danh sách (có tìm kiếm)
router.get('/', bookController.getBooks);

// Lấy chi tiết 1 sách
router.get('/:id', bookController.getBookById);

// Thêm sách (Gửi JSON)
router.post('/', bookController.createBook);

// Sửa sách (Gửi JSON)
router.put('/:id', bookController.updateBook);

// Xóa sách
router.delete('/:id', bookController.deleteBook);

export default router;