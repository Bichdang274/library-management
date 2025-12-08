
import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';


export const getActiveLoans = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                b.borrow_id, 
                b.reader_id, 
                r.name AS reader_name, 
                b.book_id, 
                bk.name AS book_name, 
                b.borrow_date, 
                b.due_date, 
                b.status
            FROM borrowings b
            JOIN readers r ON b.reader_id = r.reader_id
            JOIN books bk ON b.book_id = bk.book_id
            WHERE b.status IN ('BORROWED', 'OVERDUE') 
            AND b.return_date IS NULL
            ORDER BY b.borrow_date DESC
        `;
        const [rows] = await pool.query<RowDataPacket[]>(sql);
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getHistoryByReader = async (req: Request, res: Response) => {
    try {
        const { readerId } = req.params;
        const sql = `
            SELECT 
                b.borrow_id, 
                bk.name AS book_name, 
                b.borrow_date, 
                b.due_date, 
                b.return_date, 
                b.status
            FROM borrowings b
            JOIN books bk ON b.book_id = bk.book_id
            WHERE b.reader_id = ?
            ORDER BY b.borrow_date DESC
        `;
        const [rows] = await pool.query<RowDataPacket[]>(sql, [readerId]);
        res.json(rows);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const borrowBook = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { reader_id, book_id, due_date } = req.body;

        
        const [readers] = await connection.query<RowDataPacket[]>('SELECT * FROM readers WHERE reader_id = ?', [reader_id]);
        if (readers.length === 0) throw new Error('Reader ID not found.');

        
        const [books] = await connection.query<RowDataPacket[]>('SELECT available_copies, total_copies FROM books WHERE book_id = ?', [book_id]);
        if (books.length === 0) throw new Error('Book ID not found.');
        if (books[0].available_copies <= 0) throw new Error('Book is out of stock.');

        
        const [users] = await connection.query<RowDataPacket[]>('SELECT quota FROM users WHERE user_id = ?', [reader_id]);
        const userQuota = users[0]?.quota || 5;

        const [borrowingCount] = await connection.query<RowDataPacket[]>(
            `SELECT COUNT(*) as count FROM borrowings WHERE reader_id = ? AND status IN ('BORROWED', 'OVERDUE')`, 
            [reader_id]
        );
        
        if (borrowingCount[0].count >= userQuota) {
            throw new Error(`Quota exceeded (${userQuota}). Please return books first.`);
        }

        
        const borrowDate = new Date();
        await connection.query(
            `INSERT INTO borrowings (reader_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, 'BORROWED')`,
            [reader_id, book_id, borrowDate, due_date]
        );

        
        await connection.query(
            `UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?`,
            [book_id]
        );

        await connection.commit();
        res.status(201).json({ message: 'Book borrowed successfully!' });

    } catch (error: any) {
        await connection.rollback();
        res.status(400).json({ message: error.message || 'Borrowing failed' });
    } finally {
        connection.release();
    }
};


export const borrowCart = async (req: Request, res: Response) => {
    const connection = await pool.getConnection(); 
    try {
        await connection.beginTransaction(); 

        const { reader_id, book_ids } = req.body; 

        if (!book_ids || book_ids.length === 0) {
            throw new Error('Cart is empty!');
        }

        
        const [users] = await connection.query<RowDataPacket[]>('SELECT quota FROM users WHERE user_id = ?', [reader_id]);
        const userQuota = users[0]?.quota || 5;

        const [current] = await connection.query<RowDataPacket[]>(
            `SELECT COUNT(*) as count FROM borrowings WHERE reader_id = ? AND status IN ('BORROWED', 'OVERDUE')`, 
            [reader_id]
        );
        const borrowingCount = current[0].count;

        if (borrowingCount + book_ids.length > userQuota) {
            throw new Error(`You are borrowing ${borrowingCount} books. Quota is ${userQuota}. Cannot borrow ${book_ids.length} more.`);
        }

        
        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(borrowDate.getDate() + 14); 

        for (const bookId of book_ids) {
            const [books] = await connection.query<RowDataPacket[]>(
                'SELECT name, available_copies FROM books WHERE book_id = ? FOR UPDATE', 
                [bookId]
            );

            if (books.length === 0) throw new Error(`Book ID ${bookId} not found.`);
            
            const bookTitle = books[0].name;
            if (books[0].available_copies < 1) {
                throw new Error(`"${bookTitle}" is out of stock.`);
            }

            await connection.query('UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?', [bookId]);

            await connection.query(
                `INSERT INTO borrowings (reader_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, 'BORROWED')`,
                [reader_id, bookId, borrowDate, dueDate]
            );
        }

        await connection.commit(); 
        res.status(200).json({ message: 'Checkout successful!' });

    } catch (error: any) {
        await connection.rollback(); 
        console.error("Checkout Error:", error.message);
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
};


export const returnBook = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { borrow_id, book_id } = req.body;

        const [borrow] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM borrowings WHERE borrow_id = ? AND status IN ('BORROWED', 'OVERDUE')`, 
            [borrow_id]
        );

        if (borrow.length === 0) throw new Error('Invalid or already returned loan.');

        await connection.query(
            `UPDATE borrowings SET return_date = NOW(), status = 'RETURNED' WHERE borrow_id = ?`,
            [borrow_id]
        );

        await connection.query(
            `UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?`,
            [book_id]
        );

        await connection.commit();
        res.json({ message: 'Book returned successfully!' });
    } catch (error: any) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
};