import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
// Import middleware vừa sửa
import { verifyAdmin } from '../middleware/authMiddleware';

const router = Router();

// Ai cũng xem được danh sách
router.get('/', categoryController.getCategories);

// Các hành động này cần quyền Admin
router.post('/', verifyAdmin, categoryController.createCategory);
router.put('/:id', verifyAdmin, categoryController.updateCategory);
router.delete('/:id', verifyAdmin, categoryController.deleteCategory);

export default router;