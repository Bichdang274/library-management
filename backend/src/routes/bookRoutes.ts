import { Router } from 'express';
import * as bookController from '../controllers/bookController';
import { upload } from '../config/upload';

const router = Router();

router.get('/', bookController.getBooks);
router.post('/', upload.single('image'), bookController.createBook);
router.put('/:id', upload.single('image'), bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

export default router;