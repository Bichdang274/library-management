import { RowDataPacket } from 'mysql2/promise';
import db from '../config/db';

// Interface cho kết quả trả về từ DB
interface Manager extends RowDataPacket {
    manager_id: number;
    email: string;
    password_hash: string;
    name: string;
}

class ManagerModel {
    static async findByEmail(email: string): Promise<Manager | undefined> { 
        const sql = `SELECT * FROM managers WHERE email = ?`;
        
        const [rows] = await db.query<Manager[]>(sql, [email]); 
        
        return rows[0];
    }
}

// SỬA: Dùng export default thay vì module.exports
export default ManagerModel;