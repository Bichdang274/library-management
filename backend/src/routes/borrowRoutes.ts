import { Router } from 'express';
import * as borrowController from '../controllers/borrowController';

const router = Router();

router.get('/active', borrowController.getActiveLoans); 

router.post('/return', borrowController.returnBook); 

router.post('/checkout', borrowController.borrowCart);       

router.get('/history/:readerId', borrowController.getHistoryByReader);

export default router;