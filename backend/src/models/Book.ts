import db from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface IBook {
  book_id: number;
  name: string;
  author: string | null;
  publisher: string | null;
  year_published: number | null;
  category_id: number;
  total_copies: number;
  available_copies: number;
  image_url: string | null;

}

class BookModel {
  /**
   * @description Lấy tất cả sách 
   */
  static async findAll(): Promise<IBook[]> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT b.*, c.category_name 
       FROM books b 
       JOIN categories c ON b.category_id = c.category_id`
    );
    return rows as IBook[];
  }

  /**
   * @description Tìm một cuốn sách theo ID
   */
  static async findById(id: number): Promise<IBook | undefined> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM books WHERE book_id = ?`,
      [id]
    );
    return rows[0] as IBook;
  }

  /**
   * @description Tạo sách mới 
   */
  static async create(bookData: Omit<IBook, 'book_id' | 'total_copies' | 'available_copies'> & { total_copies?: number, available_copies?: number }): Promise<number> {
    const { 
      name, 
      author, 
      publisher, 
      year_published, 
      category_id, 
      total_copies = 1, 
      available_copies = 1, 
      image_url 
    } = bookData;
    
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO books (name, author, publisher, year_published, category_id, total_copies, available_copies, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, author, publisher, year_published, category_id, total_copies, available_copies, image_url]
    );
    return result.insertId;
  }

  /**
   * @description Cập nhật số lượng sách sau khi mượn/trả
   */
  static async updateCopies(bookId: number, change: number): Promise<boolean> {
    if (change === 0) return true;
    
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE books 
       SET available_copies = available_copies + ?
       WHERE book_id = ?`,
      [change, bookId]
    );
    return result.affectedRows > 0;
  }
}

export default BookModel;