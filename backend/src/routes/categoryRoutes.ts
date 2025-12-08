import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { verifyAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', categoryController.getCategories);

router.post('/', verifyAdmin, categoryController.createCategory);
router.put('/:id', verifyAdmin, categoryController.updateCategory);
router.delete('/:id', verifyAdmin, categoryController.deleteCategory);

export default router;