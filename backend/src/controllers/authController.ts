// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { ManagerModel } from '../models/managerModel'; // Đảm bảo import đúng

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_tam_thoi';

// Interface mở rộng request để chứa user info (dùng cho getProfile)
interface AuthenticatedRequest extends Request {
    user?: any;
}

// --- 1. REGISTER (ĐĂNG KÝ ADMIN/MANAGER) ---
export const register = async (req: Request, res: Response) => {
    const connection = await pool.getConnection(); // Dùng transaction cho an toàn
    try {
        await connection.beginTransaction();

        const { name, email, password, phone_number, address } = req.body;

        // Validate cơ bản
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền tên, email và mật khẩu.' });
        }

        // 1. Kiểm tra email có trùng trong bảng Managers không? (Tránh trùng admin)
        const existingManager = await ManagerModel.findByEmail(email);
        if (existingManager) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }

        // 2. Kiểm tra email có trùng trong bảng Readers không?
        const [existingReaders]: any = await connection.execute(
            'SELECT reader_id FROM readers WHERE email = ?', [email]
        );
        if (existingReaders.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }

        // 3. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Tạo Reader (Bảng readers)
        const [resReader]: any = await connection.execute(
            'INSERT INTO readers (name, email, phone_number, address) VALUES (?, ?, ?, ?)',
            [name, email, phone_number || null, address || null]
        );
        const newReaderId = resReader.insertId;

        // 5. Tạo User (Bảng users - để lưu mật khẩu và quota)
        await connection.execute(
            'INSERT INTO users (user_id, password_hash, quota) VALUES (?, ?, ?)',
            [newReaderId, passwordHash, 5] // Mặc định quota mượn sách là 5
        );

        await connection.commit();

        return res.status(201).json({ message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.' });

    } catch (error: any) {
        await connection.rollback(); // Nếu lỗi thì hoàn tác
        console.error("Register Error:", error);
        return res.status(500).json({ message: 'Lỗi server khi đăng ký', error: error.message });
    } finally {
        connection.release();
    }
};
// --- 2. LOGIN (ĐĂNG NHẬP - LOGIC 2 BẢNG) ---
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // BƯỚC 1: KIỂM TRA BẢNG MANAGERS
        const [managers]: any = await pool.execute(
            'SELECT * FROM managers WHERE email = ?', 
            [email]
        );

        if (managers.length > 0) {
            const manager = managers[0];
            const isMatch = await bcrypt.compare(password, manager.password_hash);
            
            if (isMatch) {
                const token = jwt.sign(
                    { id: manager.manager_id, email: manager.email, role: 'admin' },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );

                return res.status(200).json({
                    success: true,
                    token,
                    user: { 
                        id: manager.manager_id, 
                        name: manager.name, 
                        email: manager.email, 
                        role: 'admin' 
                    }
                });
            }
        }

        // BƯỚC 2: KIỂM TRA BẢNG READERS (JOIN USERS)
        const sqlReader = `
            SELECT r.reader_id, r.name, r.email, u.password_hash 
            FROM readers r
            JOIN users u ON r.reader_id = u.user_id
            WHERE r.email = ?
        `;
        const [readers]: any = await pool.execute(sqlReader, [email]);

        if (readers.length > 0) {
            const reader = readers[0];
            const isMatch = await bcrypt.compare(password, reader.password_hash);

            if (isMatch) {
                const token = jwt.sign(
                    { id: reader.reader_id, email: reader.email, role: 'reader' },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );

                return res.status(200).json({
                    success: true,
                    token,
                    user: { 
                        id: reader.reader_id, 
                        name: reader.name, 
                        email: reader.email, 
                        role: 'reader' 
                    }
                });
            }
        }

        // BƯỚC 3: KHÔNG TÌM THẤY
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });

    } catch (error: any) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- 3. GET PROFILE (LẤY THÔNG TIN USER TỪ TOKEN) ---
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // req.user được gán từ middleware authMiddleware
        if (!req.user) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
        }

        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error: any) {
        console.error("Profile Error:", error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};