import { Router } from 'express';
import * as readerController from '../controllers/readerController';
import { verifyAdmin } from '../middleware/authMiddleware'; 

const router = Router();


router.get('/', verifyAdmin, readerController.getReadersHandler); 
router.post('/', verifyAdmin, readerController.createReaderHandler);
router.put('/:id', verifyAdmin, readerController.updateReaderHandler);
router.delete('/:id', verifyAdmin, readerController.deleteReaderHandler);

export default router;