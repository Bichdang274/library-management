import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise'; 
import db from '../config/db';


interface CreateReaderData {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    password_hash: string; 
    quota: number;
}


interface UpdateReaderData {
    name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    quota?: number | string; 
    password_hash?: string;
}


interface ReaderWithQuota extends RowDataPacket {
    reader_id: number;
    name: string;
    email: string;
    phone_number: string | null;
    address: string | null;
    quota: number;
}

const ReaderModel = {
    getAll: async (): Promise<ReaderWithQuota[]> => { 
        const sql = `
            SELECT r.*, u.quota 
            FROM readers r 
            LEFT JOIN users u ON r.reader_id = u.user_id 
            ORDER BY r.reader_id DESC
        `;
        const [rows] = await db.query<ReaderWithQuota[]>(sql);
        return rows;
    },

    create: async (data: CreateReaderData): Promise<number> => { 
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [resReader] = await connection.query<ResultSetHeader>(
                `INSERT INTO readers (name, email, phone_number, address) VALUES (?, ?, ?, ?)`,
                [data.name, data.email, data.phone_number, data.address]
            );
            const newId = resReader.insertId;
            await connection.query(
                `INSERT INTO users (user_id, password_hash, quota) VALUES (?, ?, ?)`,
                [newId, data.password_hash, data.quota || 5]
            );

            await connection.commit();
            return newId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    update: async (id: number | string, data: UpdateReaderData): Promise<boolean> => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const readerFields = ['name', 'email', 'phone_number', 'address']
                .filter(field => (data as any)[field] !== undefined);
            
            if (readerFields.length > 0) {
                const readerValues = readerFields.map(field => (data as any)[field]);
                const readerSql = `UPDATE readers SET ${readerFields.map(f => `${f}=?`).join(', ')} WHERE reader_id=?`;
                await connection.query(readerSql, [...readerValues, id]);
            }
            
            let check: RowDataPacket[] = [];
            const hasUserFields = (data.quota !== undefined && data.quota !== '') || (data.password_hash !== undefined && data.password_hash !== '');
            
            if (hasUserFields) {
                [check] = await connection.query<RowDataPacket[]>('SELECT user_id FROM users WHERE user_id = ?', [id]);
            }
            const quotaIsPresent = data.quota !== undefined && data.quota !== '';
            if (quotaIsPresent) {
                if (check.length > 0) {
                    await connection.query(`UPDATE users SET quota=? WHERE user_id=?`, [data.quota, id]);
                } else {
                    await connection.query(`INSERT INTO users (user_id, quota) VALUES (?, ?)`, [id, data.quota]);
                }
            }

            const passwordIsPresent = data.password_hash !== undefined && data.password_hash !== '';
            if (passwordIsPresent) {
                 if (check.length > 0) {
                    await connection.query(`UPDATE users SET password_hash=? WHERE user_id=?`, [data.password_hash, id]);
                 } else {
                    if (quotaIsPresent) {
                        await connection.query(`UPDATE users SET password_hash=? WHERE user_id=?`, [data.password_hash, id]);
                    } else {
                        await connection.query(`INSERT INTO users (user_id, password_hash) VALUES (?, ?)`, [id, data.password_hash]);
                    }
                 }
            }


            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
    delete: async (id: number | string) => {
        const [result] = await db.query('DELETE FROM readers WHERE reader_id = ?', [id]);
        return result;
    }
};

module.exports = ReaderModel;