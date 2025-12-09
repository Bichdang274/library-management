import { Request, Response } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export const getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                (SELECT COUNT(*) FROM books) AS totalBooks,
                (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
                (SELECT COUNT(*) FROM readers) AS totalReaders,
                (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
            `
        );
        res.json(rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getTopBooks = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT b.name AS title, COUNT(br.book_id) AS borrow_count
            FROM borrowings br
            JOIN books b ON br.book_id = b.book_id
            GROUP BY b.book_id, b.name
            ORDER BY borrow_count DESC
            LIMIT 5;
            `
        );
        res.json(rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getTopReaders = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT r.name AS reader, COUNT(br.reader_id) AS borrow_count
            FROM borrowings br
            JOIN readers r ON br.reader_id = r.reader_id
            GROUP BY r.reader_id, r.name
            ORDER BY borrow_count DESC
            LIMIT 5;
            `
        );
        res.json({ topReaders: rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getBorrowsByMonth = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS total
            FROM borrowings GROUP BY month ORDER BY month;
            `
        );
        res.json({ data: rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getBorrowsByGenre = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT c.category_name AS genre, COUNT(*) AS total
            FROM books b
            INNER JOIN categories c ON b.category_id = c.category_id
            GROUP BY c.category_name
            ORDER BY total DESC;
            `
        );
        res.json({ data: rows });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};