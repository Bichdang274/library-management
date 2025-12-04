import { Request, Response } from "express";
import pool from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Lấy danh sách sách
export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM books");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm sách mới
export const addBook = async (req: Request, res: Response): Promise<void> => {
  const { title, author, year } = req.body;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO books (title, author, year) VALUES (?, ?, ?)",
      [title, author, year]
    );
    res.json({ id: result.insertId, title, author, year });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
