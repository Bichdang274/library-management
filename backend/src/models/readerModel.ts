import type { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise'; 
import db from '../config/db';

interface CreateReaderData {
    name: string;
    email: string;
    phone_number?: string | null;
    address?: string | null; 
    password_hash: string;
    quota: number;
}

interface UpdateReaderData {
    name?: string;
    email?: string;
    phone_number?: string | null;
    address?: string | null;
    quota?: number; 
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
        const connection: PoolConnection = await db.getConnection();
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
        const connection: PoolConnection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const readerFields = [];
            const readerValues = [];
            if (data.name !== undefined) { readerFields.push('name=?'); readerValues.push(data.name); }
            if (data.email !== undefined) { readerFields.push('email=?'); readerValues.push(data.email); }
            if (data.phone_number !== undefined) { readerFields.push('phone_number=?'); readerValues.push(data.phone_number); }
            if (data.address !== undefined) { readerFields.push('address=?'); readerValues.push(data.address); }

            if (readerFields.length > 0) {
                readerValues.push(id);
                await connection.query(
                    `UPDATE readers SET ${readerFields.join(', ')} WHERE reader_id=?`, 
                    readerValues
                );
            }
            
            const userFields = [];
            const userValues = [];
            if (data.quota !== undefined) { userFields.push('quota=?'); userValues.push(data.quota); }
            if (data.password_hash !== undefined) { userFields.push('password_hash=?'); userValues.push(data.password_hash); }

            if (userFields.length > 0) {
                userValues.push(id);
                await connection.query(
                    `UPDATE users SET ${userFields.join(', ')} WHERE user_id=?`,
                    userValues
                );
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

export default ReaderModel;