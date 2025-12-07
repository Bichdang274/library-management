import { Request, Response } from 'express';

// SỬA QUAN TRỌNG: Dùng 'require' vì bên service đang dùng 'exports.'
// Điều này giúp code nhận diện được các hàm registerUser và login
const authService = require('../services/authService');

// Định nghĩa Interface cho Request đăng ký
interface RegisterRequestBody extends Request {
    body: {
        name: string;
        email: string;
        password: string;
        phone_number?: string;
        address?: string;
    };
}

// Định nghĩa Interface cho Request đã xác thực (cho hàm getProfile)
interface AuthenticatedRequest extends Request {
    user?: any; 
}

// --- REGISTER ---
export const register = async (req: RegisterRequestBody, res: Response) => {
    try {
        const { name, email, password, phone_number, address } = req.body;
        
        // Validate cơ bản
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc (tên, email, mật khẩu).' });
        }
        
        // Gọi hàm từ service (dùng require nên sẽ tự nhận hàm)
        const result = await authService.registerUser({ 
            name, email, password, phone_number, address 
        });

        return res.status(201).json(result);

    } catch (error: any) { 
        console.error("Register Error:", error);
        return res.status(500).json({ 
            message: error.message || 'Lỗi server khi đăng ký' 
        });
    }
};

// --- LOGIN ---
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body; 
        
        // Validate input
        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email và mật khẩu không hợp lệ.' });
        }

        // Gọi hàm từ service
        const data = await authService.login(email, password);

        // FIX LỖI 204: Trả về JSON trực tiếp, không dùng helper response
        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            ...data // Spread token và user info ra
        });

    } catch (error: any) { 
        console.error("Login Error:", error);
        // Trả lỗi 401 nếu sai mật khẩu/tài khoản
        return res.status(401).json({ 
            message: error.message || 'Đăng nhập thất bại' 
        });
    }
};

// --- GET PROFILE ---
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            success: true,
            data: req.user 
        });
    } catch (error: any) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};