import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', categoryController.getCategories);

router.post('/', verifyToken, verifyAdmin, categoryController.createCategory);
router.put('/:id', verifyToken, verifyAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, verifyAdmin, categoryController.deleteCategory);

export default router;