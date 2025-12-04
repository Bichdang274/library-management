import express, { type Request, type Response } from "express";
import mysql, { RowDataPacket } from "mysql2";
import cors from "cors";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
// pdfkit là CommonJS, import bằng require để tránh lỗi TS7016
const PDFDocument = require('pdfkit');


const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kocomk@123",
  database: "library_management",
});

// ================== API THỐNG KÊ ==================
app.get("/api/stats", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== API BIỂU ĐỒ LƯỢT MƯỢN THEO THÁNG ==================
app.get("/api/borrows-by-month", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(`
      SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS ym, COUNT(*) AS total
      FROM borrowings GROUP BY ym ORDER BY ym;
    `);
    res.json({ data: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== API BIỂU ĐỒ SÁCH THEO THỂ LOẠI ==================
app.get("/api/borrows-by-genre", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(`
      SELECT c.category_name AS genre, COUNT(*) AS total
      FROM books b
      INNER JOIN categories c ON b.category_id = c.category_id
      GROUP BY c.category_name
      ORDER BY total DESC;
    `);
    res.json({ data: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== EXPORT TOÀN BỘ DỮ LIỆU CSV ==================
app.get("/api/export/all-csv", async (req: Request, res: Response) => {
  try {
    const [statsRows] = await db.promise().query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);
    const [monthRows] = await db.promise().query<RowDataPacket[]>(`
      SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS total
      FROM borrowings GROUP BY month ORDER BY month;
    `);
    const [booksByGenre] = await db.promise().query<RowDataPacket[]>(`
      SELECT c.category_name AS genre, COUNT(*) AS total
      FROM books b
      INNER JOIN categories c ON b.category_id = c.category_id
      GROUP BY genre ORDER BY total DESC;
    `);

    const combined = [
      { section: "Stats", ...statsRows[0] },
      ...monthRows.map((r) => ({ section: "Borrows by Month", ...r })),
      ...booksByGenre.map((r) => ({ section: "Books by Genre", ...r })),
    ];

    const parser = new Parser();
    const csv = parser.parse(combined);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=library-report.csv");
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== EXPORT TOÀN BỘ DỮ LIỆU EXCEL ==================
app.get("/api/export/all-excel", async (req: Request, res: Response) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Stats
    const statsSheet = workbook.addWorksheet("Stats");
    const [statsRows] = await db.promise().query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);
    statsSheet.addRow(["Tổng sách", statsRows[0].totalBooks]);
    statsSheet.addRow(["Tổng lượt mượn", statsRows[0].totalBorrows]);
    statsSheet.addRow(["Tổng người đọc", statsRows[0].totalReaders]);
    statsSheet.addRow(["Đang mượn", statsRows[0].currentBorrows]);

    // Borrows by Month
    const [monthRows] = await db.promise().query<RowDataPacket[]>(`
      SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS total
      FROM borrowings GROUP BY month ORDER BY month;
    `);
    const monthSheet = workbook.addWorksheet("Borrows by Month");
    monthSheet.columns = [
      { header: "Tháng", key: "month", width: 15 },
      { header: "Tổng lượt mượn", key: "total", width: 20 },
    ];
    monthRows.forEach((r) => monthSheet.addRow(r));

    // Books by Genre
    const [booksByGenre] = await db.promise().query<RowDataPacket[]>(`
      SELECT c.category_name AS genre, COUNT(*) AS total
      FROM books b
      INNER JOIN categories c ON b.category_id = c.category_id
      GROUP BY genre ORDER BY total DESC;
    `);
    const booksSheet = workbook.addWorksheet("Books by Genre");
    booksSheet.columns = [
      { header: "Thể loại", key: "genre", width: 25 },
      { header: "Tổng số sách", key: "total", width: 20 },
    ];
    booksByGenre.forEach((r) => booksSheet.addRow(r));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=library-report.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== EXPORT TOÀN BỘ DỮ LIỆU PDF ==================
app.get("/api/export/all-pdf", async (req: Request, res: Response) => {
  try {
    const [statsRows] = await db.promise().query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=library-report.pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Library Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Tổng số sách: ${statsRows[0].totalBooks}`);
    doc.text(`Tổng lượt mượn: ${statsRows[0].totalBorrows}`);
    doc.text(`Tổng người đọc: ${statsRows[0].totalReaders}`);
    doc.text(`Đang mượn: ${statsRows[0].currentBorrows}`);

    doc.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== API RESET DỮ LIỆU ==================
app.delete("/api/reset-books", async (req: Request, res: Response) => {
  try {
    await db.promise().query(`TRUNCATE TABLE books`);
    const [rows] = await db.promise().query<RowDataPacket[]>(`SELECT COUNT(*) AS totalBooks FROM books`);
    res.json({
      message: "Đã reset dữ liệu bảng books thành công",
      totalBooks: rows[0].totalBooks,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("✅ Server chạy tại http://localhost:5000");
});
