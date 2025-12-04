import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// ================== KẾT NỐI MYSQL ==================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Kocomk@123',    
  database: 'library_management'
});

// Kiểm tra kết nối
db.connect(err => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err.message);
  } else {
    console.log("✅ Kết nối MySQL thành công");
  }
});

// ================== API HEALTH CHECK ==================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server đang chạy ổn định' });
});

// ================== API THỐNG KÊ ==================
app.get('/api/stats', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== API BIỂU ĐỒ ==================
app.get('/api/borrows-by-month', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS ym, COUNT(*) AS total
      FROM borrowings GROUP BY ym ORDER BY ym;
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/borrows-by-genre', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT c.category_name AS genre, COUNT(*) AS total
      FROM books b
      INNER JOIN categories c ON b.category_id = c.category_id
      GROUP BY c.category_name
      ORDER BY total DESC;
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== EXPORT CSV ==================
app.get('/api/export/all-csv', async (req, res) => {
  try {
    const [statsRows] = await db.promise().query(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);

    const parser = new Parser();
    const csv = parser.parse(statsRows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=library-report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== EXPORT EXCEL ==================
app.get('/api/export/all-excel', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Stats');

    const [statsRows] = await db.promise().query(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);

    sheet.addRow(['Tổng sách', statsRows[0].totalBooks]);
    sheet.addRow(['Tổng lượt mượn', statsRows[0].totalBorrows]);
    sheet.addRow(['Tổng người đọc', statsRows[0].totalReaders]);
    sheet.addRow(['Đang mượn', statsRows[0].currentBorrows]);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=library-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== EXPORT PDF ==================
app.get('/api/export/all-pdf', async (req, res) => {
  try {
    const [statsRows] = await db.promise().query(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=library-report.pdf');
    doc.pipe(res);

    // Nhúng font Unicode Roboto
    const fontPath = path.join(process.cwd(), 'fonts', 'Roboto-Regular.ttf');
    doc.registerFont('Roboto', fontPath);
    doc.font('Roboto');

    doc.fontSize(18).text('Thống kê thư viện', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tổng số sách: ${statsRows[0].totalBooks}`);
    doc.text(`Tổng lượt mượn: ${statsRows[0].totalBorrows}`);
    doc.text(`Tổng người đọc: ${statsRows[0].totalReaders}`);
    doc.text(`Đang mượn: ${statsRows[0].currentBorrows}`);

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== RESET DỮ LIỆU ==================
app.delete('/api/reset-books', async (req, res) => {
  try {
    await db.promise().query(`TRUNCATE TABLE books`);
    const [rows] = await db.promise().query(`SELECT COUNT(*) AS totalBooks FROM books`);
    res.json({
      message: 'Đã reset dữ liệu bảng books thành công',
      totalBooks: rows[0].totalBooks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== KHỞI CHẠY SERVER ==================
const PORT = 5001; // đổi sang 5001 để tránh xung đột
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
