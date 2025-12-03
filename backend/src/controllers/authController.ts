import type { Request, Response } from 'express'; 
const authService = require('../services/authService');
const { response } = require('../utils/helpers');

interface RegisterRequestBody extends Request {
    body: {
        name: string;
        email: string;
        password: string;
        phone_number?: string; 
        address?: string;
    };
}

exports.register = async (req: RegisterRequestBody, res: Response) => {
    try {
        const { name, email, password, phone_number, address } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
        }
        
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

exports.login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body; 
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email và mật khẩu không hợp lệ.' });
        }

        const data = await authService.login(email, password);
        response(res, 200, 'Đăng nhập thành công', data);
    } catch (error: any) { 
        response(res, 401, error.message || 'Đăng nhập thất bại');
    }
};