import express from 'express';
import db from '../config/db'; 
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = express.Router();

// --- API 1: Xử lý Mượn Sách ---
router.post('/borrow', async (req, res) => {
    // 1. Lấy dữ liệu từ Client gửi lên
    const { reader_id, book_id, due_date } = req.body;
    
    // 2. Tạo các biến cần thiết (Đây là phần bạn bị thiếu)
    const borrow_date = new Date();
    const status = 'BORROWED';

    try {
        // Kiểm tra sách tồn tại và còn hàng không
        const [books] = await db.promise().query<RowDataPacket[]>(
            'SELECT available_copies FROM Books WHERE book_id = ?', 
            [book_id]
        );
        
        if (books.length === 0) return res.status(404).json({ message: 'Sách không tồn tại' });
        if (books[0].available_copies < 1) return res.status(400).json({ message: 'Sách đã hết hàng' });

        // Tạo phiếu mượn
        await db.promise().query(
            'INSERT INTO Borrowings (reader_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
            [reader_id, book_id, borrow_date, due_date, status]
        );

        // Trừ số lượng sách
        await db.promise().query('UPDATE Books SET available_copies = available_copies - 1 WHERE book_id = ?', [book_id]);

        res.status(200).json({ message: 'Mượn sách thành công!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi mượn sách' });
    }
});

// --- API 2: Xử lý Trả Sách ---
router.post('/return', async (req, res) => {
    // 1. Lấy dữ liệu từ Client (Đây là phần bạn bị thiếu)
    const { borrow_id, book_id } = req.body;
    
    // 2. Tạo biến ngày trả
    const return_date = new Date();
    const status = 'RETURNED';

    try {
        // Cập nhật phiếu mượn
        const [result] = await db.promise().query<ResultSetHeader>(
            'UPDATE Borrowings SET return_date = ?, status = ? WHERE borrow_id = ? AND status = "BORROWED"',
            [return_date, status, borrow_id]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Không tìm thấy phiếu mượn hoặc đã trả rồi' });
        }

        // Cộng lại số lượng sách
        await db.promise().query('UPDATE Books SET available_copies = available_copies + 1 WHERE book_id = ?', [book_id]);

        res.status(200).json({ message: 'Trả sách thành công!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server khi trả sách' });
    }
});

// --- API 3: Lấy danh sách đang mượn ---
router.get('/active', async (req, res) => {
    try {
        const query = `
            SELECT br.borrow_id, r.name as reader_name, b.name as book_name, b.book_id, br.borrow_date, br.due_date, br.status 
            FROM Borrowings br
            JOIN Readers r ON br.reader_id = r.reader_id
            JOIN Books b ON br.book_id = b.book_id
            WHERE br.status = 'BORROWED' OR br.status = 'OVERDUE'
            ORDER BY br.borrow_date DESC
        `;
        // Thêm <RowDataPacket[]> để tránh lỗi TypeScript ở đây luôn
        const [rows] = await db.promise().query<RowDataPacket[]>(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
    }
});

export default router;