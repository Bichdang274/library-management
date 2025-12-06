import { Request, Response } from "express";
import pool from "../db";
import { RowDataPacket } from "mysql2";

// Lấy thống kê số lượng sách
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total_books FROM books"
    );
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
