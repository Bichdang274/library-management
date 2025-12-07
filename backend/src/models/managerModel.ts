import type { Pool, RowDataPacket } from 'mysql2/promise'; // Import Pool và RowDataPacket
import db from '../config/db';


interface Manager extends RowDataPacket { // Nên extend RowDataPacket
    id: number;
    email: string;
    password_hash: string;
    name?: string;
}

class ManagerModel {
    static async findByEmail(email: string): Promise<Manager | undefined> { 
        const sql = `SELECT * FROM managers WHERE email = ?`;
        
        // Bây giờ TypeScript hiểu db.query chấp nhận kiểu generic
        const [rows] = await db.query<Manager[]>(sql, [email]); 
        
        // Khai báo rõ ràng hơn về kiểu trả về nếu cần thiết, 
        // nhưng dòng trên đã đủ để giải quyết lỗi TS2347
        return rows[0];
    }
}
module.exports = ManagerModel;