// backend/src/routes/book1Routes.ts
import { Router } from 'express';
// QUAN TRỌNG: Import từ book1Controller
import * as bookController from '../controllers/book1Controller';

const router = Router();

router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

export default router;