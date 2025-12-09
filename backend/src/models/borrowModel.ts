import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/db';

export interface Borrow extends RowDataPacket {
    borrow_id: number;
    reader_id: number;
    book_id: number;
    borrow_date: Date;
    return_date?: Date;
    due_date: Date;
    status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
    book_name?: string;
    reader_name?: string;
}

const BorrowModel = {
    getAll: async (): Promise<Borrow[]> => {
        const sql = `
            SELECT br.*, b.name as book_name, r.name as reader_name
            FROM borrowings br
            JOIN books b ON br.book_id = b.book_id
            JOIN readers r ON br.reader_id = r.reader_id
            ORDER BY br.borrow_date DESC
        `;
        const [rows] = await db.query<Borrow[]>(sql);
        return rows;
    },

    getByReaderId: async (readerId: number): Promise<Borrow[]> => {
        const sql = `
            SELECT br.*, b.name as book_name 
            FROM borrowings br
            JOIN books b ON br.book_id = b.book_id
            WHERE br.reader_id = ?
            ORDER BY br.borrow_date DESC
        `;
        const [rows] = await db.query<Borrow[]>(sql, [readerId]);
        return rows;
    },

    getById: async (id: number): Promise<Borrow | undefined> => {
        const [rows] = await db.query<Borrow[]>('SELECT * FROM borrowings WHERE borrow_id = ?', [id]);
        return rows[0];
    },

    create: async (readerId: number, bookId: number, dueDate: string): Promise<number> => {
        const sql = `
            INSERT INTO borrowings (reader_id, book_id, borrow_date, due_date, status)
            VALUES (?, ?, NOW(), ?, 'BORROWED')
        `;
        const [result] = await db.query<ResultSetHeader>(sql, [readerId, bookId, dueDate]);
        return result.insertId;
    },

    updateStatus: async (borrowId: number, status: string, returnDate: Date | null = null): Promise<void> => {
        let sql = `UPDATE borrowings SET status = ?`;
        const params: any[] = [status];

        if (returnDate) {
            sql += `, return_date = ?`;
            params.push(returnDate);
        }

        sql += ` WHERE borrow_id = ?`;
        params.push(borrowId);

        await db.query(sql, params);
    }
};

export default BorrowModel;