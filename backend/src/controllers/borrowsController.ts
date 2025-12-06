import { Request, Response } from "express";
import pool from "../db";
import { RowDataPacket } from "mysql2";

// Lấy danh sách các lượt mượn
export const getBorrows = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM borrowings");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

