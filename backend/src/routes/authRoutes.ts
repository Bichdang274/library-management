import { Router } from 'express';
import * as authController from '../controllers/authController';
// Import middleware xác thực (để bảo vệ route lấy profile)
import { verifyToken } from '../middleware/authMiddleware'; 

const router = Router();

// Định nghĩa các route
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route cần đăng nhập mới xem được (dùng middleware verifyToken)
router.get('/profile', verifyToken, authController.getProfile);

export default router;