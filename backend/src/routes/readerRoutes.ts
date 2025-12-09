import { Router } from 'express';
import * as readerController from '../controllers/readerController';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware'; 

const router = Router();

router.get('/', verifyToken, verifyAdmin, readerController.getReaders); 
router.post('/', verifyToken, verifyAdmin, readerController.createReader);
router.put('/:id', verifyToken, verifyAdmin, readerController.updateReader);
router.delete('/:id', verifyToken, verifyAdmin, readerController.deleteReader);

export default router;