import { RowDataPacket } from 'mysql2/promise';
import db from '../config/db';

interface UserResult extends RowDataPacket {
    user_id: number;
    password_hash: string;
    quota?: number;
    email: string;
    name: string;
    role: 'reader' | 'admin'; 
}

const UserModel = {
    findByEmail: async (email: string): Promise<UserResult | undefined> => { 
        try {
            const [managers] = await db.query<UserResult[]>(
                `SELECT manager_id as user_id, password_hash, email, name, 'admin' as role 
                 FROM managers WHERE email = ?`, 
                [email]
            );

            if (managers.length > 0) {
                return managers[0];
            }

            const [readers] = await db.query<UserResult[]>(
                `SELECT u.user_id, u.password_hash, u.quota, r.email, r.name, 'reader' as role
                 FROM users u
                 JOIN readers r ON u.user_id = r.reader_id
                 WHERE r.email = ?`, 
                [email]
            );

            return readers[0]; 

        } catch (error) {
            console.error("Lỗi SQL (findByEmail):", error);
            throw error;
        }
    },

    createReaderAccount: async (userId: number, passwordHash: string, quota: number = 5): Promise<void> => {
        const query = `INSERT INTO users (user_id, password_hash, quota) VALUES (?, ?, ?)`;
        await db.query(query, [userId, passwordHash, quota]);
    }
};

export default UserModel;