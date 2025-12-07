import { RowDataPacket } from 'mysql2/promise';
import db from '../config/db';

// Định nghĩa kiểu dữ liệu User trả về (Kết hợp Users và Readers)
interface UserResult extends RowDataPacket {
    user_id: number;
    password_hash: string;
    quota: number;
    email: string;
    name: string;
    role: 'reader' | 'admin'; 
}

interface CreateUserData {
    user_id: number;
    password_hash: string;
    quota?: number; 
}

const UserModel = {
    // Hàm này rất quan trọng cho chức năng Login
    findByEmail: async (email: string): Promise<UserResult | undefined> => { 
        try {
            const query = `
                SELECT u.user_id, u.password_hash, u.quota, r.email, r.name, 'reader' as role
                FROM users u
                JOIN readers r ON u.user_id = r.reader_id
                WHERE r.email = ?
            `;
            
            const [rows] = await db.query<UserResult[]>(query, [email]);
            return rows[0];
        } catch (error) {
            console.error("Lỗi SQL (findByEmail):", error);
            throw error;
        }
    },

    // Hàm này hỗ trợ tạo User mới
    createUser: async (data: CreateUserData): Promise<void> => {
        try {
            const query = `
                INSERT INTO users (user_id, password_hash, quota) 
                VALUES (?, ?, ?)
            `;
            await db.query(query, [
                data.user_id, 
                data.password_hash, 
                data.quota || 5
            ]);
        } catch (error) {
            console.error("Lỗi SQL (createUser):", error);
            throw error;
        }
    }
};

// SỬA QUAN TRỌNG: Dùng export default để khớp với authService
export default UserModel;