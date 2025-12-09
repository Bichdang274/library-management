import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';

export interface IManager extends RowDataPacket {
    manager_id: number;
    email: string;
    password_hash: string;
    name: string;
}

export class ManagerModel {
    static async findByEmail(email: string): Promise<IManager | null> {
        const sql = "SELECT * FROM managers WHERE email = ?";
        const [rows] = await db.query<IManager[]>(sql, [email]);
        return rows.length > 0 ? rows[0] : null;
    }

    static async create(data: { name: string; email: string; password_hash: string }): Promise<number> {
        const sql = "INSERT INTO managers (name, email, password_hash) VALUES (?, ?, ?)";
        const [result] = await db.query<ResultSetHeader>(sql, [
            data.name, 
            data.email, 
            data.password_hash 
        ]);
        return result.insertId;
    }
}