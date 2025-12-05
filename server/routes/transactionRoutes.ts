import express, { Request, Response, Router } from 'express';
import db from '../config/db'; // Lưu ý: Với NodeNext, TS yêu cầu giữ đuôi .js khi import file nội bộ
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router: Router = express.Router();

// Định nghĩa Interface cho dữ liệu Sách để TS hiểu cấu trúc
interface BookData extends RowDataPacket {
    available_copies: number;
}

// --- API 1: Xử lý Mượn Sách ---
router.post('/borrow', async (req: Request, res: Response) => {
    const { reader_id, book_id, due_date } = req.body;
    const borrow_date = new Date();
    const status = 'BORROWED';

    try {
        // Bước 1: Kiểm tra sách (Sử dụng BookData[] để ép kiểu kết quả)
        const [books] = await db.promise().query<BookData[]>(
            'SELECT available_copies FROM Books WHERE book_id = ?', 
            [book_id]
        );
        
        if (books.length === 0) {
            res.status(404).json({ message: 'Sách không tồn tại' });
            return; // Trong TS, phải return để kết thúc hàm
        }

        if (books[0].available_copies < 1) {
            res.status(400).json({ message: 'Sách đã hết hàng' });
            return;
        }

        // Bước 2: Tạo phiếu mượn
        await db.promise().query(
            'INSERT INTO Borrowings (reader_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
            [reader_id, book_id, borrow_date, due_date, status]
        );

        // Bước 3: Trừ số lượng sách
        await db.promise().query(
            'UPDATE Books SET available_copies = available_copies - 1 WHERE book_id = ?', 
            [book_id]
        );

        res.status(200).json({ message: 'Mượn sách thành công!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi mượn sách' });
    }
});

// --- API 2: Xử lý Trả Sách ---
router.post('/return', async (req: Request, res: Response) => {
    const { borrow_id, book_id } = req.body;
    const return_date = new Date();
    const status = 'RETURNED';

    try {
        // Bước 1: Cập nhật phiếu mượn (Sử dụng ResultSetHeader để lấy affectedRows)
        const [result] = await db.promise().query<ResultSetHeader>(
            'UPDATE Borrowings SET return_date = ?, status = ? WHERE borrow_id = ? AND status = "BORROWED"',
            [return_date, status, borrow_id]
        );

        if (result.affectedRows === 0) {
            res.status(400).json({ message: 'Không tìm thấy phiếu mượn hoặc sách đã được trả' });
            return;
        }

        // Bước 2: Cộng lại số lượng sách
        await db.promise().query(
            'UPDATE Books SET available_copies = available_copies + 1 WHERE book_id = ?', 
            [book_id]
        );

        res.status(200).json({ message: 'Trả sách thành công!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi trả sách' });
    }
});

// --- API 3: Lấy danh sách đang mượn ---
router.get('/active', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT br.borrow_id, r.name as reader_name, b.name as book_name, b.book_id, br.borrow_date, br.due_date, br.status 
            FROM Borrowings br
            JOIN Readers r ON br.reader_id = r.reader_id
            JOIN Books b ON br.book_id = b.book_id
            WHERE br.status = 'BORROWED' OR br.status = 'OVERDUE'
            ORDER BY br.borrow_date DESC
        `;
        // query trả về RowDataPacket[] mặc định cho câu lệnh SELECT
        const [rows] = await db.promise().query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
    }
});

export default router;