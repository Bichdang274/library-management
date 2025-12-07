// backend/src/models/managerModel.ts
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/db';

export interface IManager extends RowDataPacket {
    manager_id: number;
    email: string;
    password_hash: string;
    name: string;
}

export class ManagerModel {
    static async findByEmail(email: string): Promise<IManager | null> {
        // Dùng ? để tránh lỗi SQL Injection và lỗi ký tự đặc biệt
        const sql = "SELECT * FROM managers WHERE email = ?";
        const [rows] = await pool.execute<IManager[]>(sql, [email]);
        return rows.length > 0 ? rows[0] : null;
    }

    static async create(data: { name: string; email: string; password_hash: string }): Promise<number> {
        // CHÚ Ý: Dùng 3 dấu chấm hỏi (?)
        const sql = "INSERT INTO managers (name, email, password_hash) VALUES (?, ?, ?)";
        
        // Truyền dữ liệu vào mảng thứ 2 theo đúng thứ tự
        const [result] = await pool.execute<ResultSetHeader>(sql, [
            data.name, 
            data.email, 
            data.password_hash // Chuỗi bcrypt chứa $ sẽ được xử lý an toàn tại đây
        ]);
        
        return result.insertId;
    }
}