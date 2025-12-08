import db from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export type BorrowStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export interface IBorrow {
  borrow_id: number;
  reader_id: number;
  book_id: number;  
  borrow_date: Date | string;
  return_date: Date | string | null;
  due_date: Date | string;
  status: BorrowStatus;
}

class BorrowModel {
  /**
   * @description Lấy tất cả các giao dịch mượn/trả
   */
  static async findAll(): Promise<IBorrow[]> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM borrowings`
    );
    return rows as IBorrow[];
  }

  /**
   * @description Tạo một giao dịch mượn mới
   */
  static async createBorrow(data: { 
    reader_id: number; 
    book_id: number; 
    borrow_date: Date | string; 
    due_date: Date | string; 
  }): Promise<number> {
    const { reader_id, book_id, borrow_date, due_date } = data;
    
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO borrowings (reader_id, book_id, borrow_date, due_date, status) 
       VALUES (?, ?, ?, ?, 'BORROWED')`,
      [reader_id, book_id, borrow_date, due_date]
    );
    return result.insertId;
  }

  /**
   * @description Cập nhật trạng thái sách đã trả và ngày trả
   */
  static async updateToReturned(borrowId: number): Promise<boolean> {
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE borrowings 
       SET status = 'RETURNED', return_date = NOW()
       WHERE borrow_id = ? AND status = 'BORROWED'`,
      [borrowId]
    );
    return result.affectedRows > 0;
  }
}

export default BorrowModel;