import { Request, Response } from "express";
import pool from "../db";
import { RowDataPacket } from "mysql2";

// Lấy thống kê tổng quan
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         (SELECT COUNT(*) FROM books) AS totalBooks,
         (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
         (SELECT COUNT(*) FROM readers) AS totalReaders,
         (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows`
    );
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Top 5 Sách Hot
export const getTopBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT b.title, COUNT(br.book_id) AS borrow_count
       FROM borrowings br
       JOIN books b ON br.book_id = b.id
       GROUP BY b.title
       ORDER BY borrow_count DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Top 5 Mọt Sách
export const getTopReaders = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.name, COUNT(br.reader_id) AS borrow_count
       FROM borrowings br
       JOIN readers r ON br.reader_id = r.id
       GROUP BY r.name
       ORDER BY borrow_count DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
