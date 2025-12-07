import express, { Request, Response } from "express";
import mysql, { RowDataPacket } from "mysql2";
import cors from "cors";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import path from "path";
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kocomk@123",
  database: "library_management",
});

// ================== API HEALTH CHECK ==================
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ================== API THỐNG KÊ ==================
app.get("/api/stats", async (_req: Request, res: Response) => {
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

// ================== API TOP SÁCH & ĐỘC GIẢ ==================
app.get("/api/stats/top-books", async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(`
      SELECT b.name AS title, COUNT(br.book_id) AS borrow_count
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      GROUP BY b.book_id, b.name
      ORDER BY borrow_count DESC
      LIMIT 5;
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats/top-readers", async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(`
      SELECT r.name AS reader, COUNT(br.reader_id) AS borrow_count
      FROM borrowings br
      JOIN readers r ON br.reader_id = r.reader_id
      GROUP BY r.reader_id, r.name
      ORDER BY borrow_count DESC
      LIMIT 5;
    `);
    res.json({ topReaders: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== API BIỂU ĐỒ ==================
app.get("/api/borrows-by-month", async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(`
      SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS total
      FROM borrowings GROUP BY month ORDER BY month;
    `);
    res.json({ data: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/borrows-by-genre", async (_req: Request, res: Response) => {
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

// ================== EXPORT CSV ==================
app.get("/api/export/csv", async (_req: Request, res: Response) => {
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
    const [topBooks] = await db.promise().query<RowDataPacket[]>(`
      SELECT b.name AS title, COUNT(br.book_id) AS borrow_count
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      GROUP BY b.book_id, b.name
      ORDER BY borrow_count DESC
      LIMIT 5;
    `);
    const [topReaders] = await db.promise().query<RowDataPacket[]>(`
      SELECT r.name AS reader, COUNT(br.reader_id) AS borrow_count
      FROM borrowings br
      JOIN readers r ON br.reader_id = r.reader_id
      GROUP BY r.reader_id, r.name
      ORDER BY borrow_count DESC
      LIMIT 5;
    `);

    const combined = [
      { section: "Thống kê", ...statsRows[0] },
      ...monthRows.map((r) => ({ section: "Lượt mượn theo tháng", ...r })),
      ...booksByGenre.map((r) => ({ section: "Sách theo thể loại", ...r })),
      ...topBooks.map((r) => ({ section: "Top sách", ...r })),
      ...topReaders.map((r) => ({ section: "Top độc giả", ...r })),
    ];

    const parser = new Parser();
    const csv = parser.parse(combined);
    const bom = '\uFEFF';

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=library-report.csv");
    res.send(bom + csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== EXPORT EXCEL ==================
app.get("/api/export/xlsx", async (_req: Request, res: Response) => {
  try {
    const workbook = new ExcelJS.Workbook();

    const [statsRows] = await db.promise().query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);
    const statsSheet = workbook.addWorksheet("Stats");
    statsSheet.addRow(["Tổng sách", statsRows[0].totalBooks]);
    statsSheet.addRow(["Tổng lượt mượn", statsRows[0].totalBorrows]);
    statsSheet.addRow(["Tổng người đọc", statsRows[0].totalReaders]);
    statsSheet.addRow(["Đang mượn", statsRows[0].currentBorrows]);

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

    const [booksByGenre] = await db.promise().query<RowDataPacket[]>(`
      SELECT c.category_name AS genre, COUNT(*) AS total
      FROM books b
      INNER JOIN categories c ON b.category_id = c.category_id
      GROUP BY genre ORDER BY total DESC;
    `);
    const genreSheet = workbook.addWorksheet("Books by Genre");
    genreSheet.columns = [
      { header: "Thể loại", key: "genre", width: 25 },
      { header: "Tổng số sách", key: "total", width: 20 },
    ];
    booksByGenre.forEach((r) => genreSheet.addRow(r));

        const [topBooks] = await db.promise().query<RowDataPacket[]>(`
      SELECT b.name AS title, COUNT(br.book_id) AS borrow_count
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      GROUP BY b.book_id, b.name
      ORDER BY borrow_count DESC
      LIMIT 5;
    `);
    const topBooksSheet = workbook.addWorksheet("Top Books");
    topBooksSheet.columns = [
      { header: "Tên sách", key: "title", width: 30 },
      { header: "Lượt mượn", key: "borrow_count", width: 15 },
    ];
    topBooks.forEach((r) => topBooksSheet.addRow(r));

    const [topReaders] = await db.promise().query<RowDataPacket[]>(`
      SELECT r.name AS reader, COUNT(br.reader_id) AS borrow_count
      FROM borrowings br
      JOIN readers r ON br.reader_id = r.reader_id
      GROUP BY r.reader_id, r.name
      ORDER BY borrow_count DESC
      LIMIT 5;
    `);
    const topReadersSheet = workbook.addWorksheet("Top Readers");
    topReadersSheet.columns = [
      { header: "Tên độc giả", key: "reader", width: 30 },
      { header: "Lượt mượn", key: "borrow_count", width: 15 },
    ];
    topReaders.forEach((r) => topReadersSheet.addRow(r));

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

// ================== EXPORT PDF ==================
app.get("/api/export/pdf", async (_req: Request, res: Response) => {
  try {
    const [statsRows] = await db.promise().query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);

    const [topBooks] = await db.promise().query<RowDataPacket[]>(`
      SELECT b.name AS title, COUNT(br.book_id) AS borrow_count
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      GROUP BY b.book_id, b.name
      ORDER BY borrow_count DESC
      LIMIT 5;
    `);

    const [topReaders] = await db.promise().query<RowDataPacket[]>(`
      SELECT r.name AS reader, COUNT(br.reader_id) AS borrow_count
      FROM borrowings br
      JOIN readers r ON br.reader_id = r.reader_id
      GROUP BY r.reader_id, r.name
      ORDER BY borrow_count DESC
      LIMIT 5;
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

    const doc = new PDFDocument();
    const fontPath = path.join(__dirname, "fonts", "Roboto-Regular.ttf");
    doc.registerFont("Roboto", fontPath);
    doc.font("Roboto");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=library-report.pdf");
    doc.pipe(res);

    doc.fontSize(18).text("📘 Báo cáo thư viện", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("Tổng quan:");
    doc.fontSize(12).text(`- Tổng số sách: ${statsRows[0].totalBooks}`);
    doc.text(`- Tổng lượt mượn: ${statsRows[0].totalBorrows}`);
    doc.text(`- Tổng người đọc: ${statsRows[0].totalReaders}`);
    doc.text(`- Đang mượn: ${statsRows[0].currentBorrows}`);
    doc.moveDown();

    doc.fontSize(14).text("📚 Top 5 Sách Hot:");
    topBooks.forEach((b: any, idx: number) => {
      doc.fontSize(12).text(`${idx + 1}. ${b.title} - ${b.borrow_count} lượt mượn`);
    });
    doc.moveDown();

    doc.fontSize(14).text("👤 Top 5 Mọt Sách:");
    topReaders.forEach((r: any, idx: number) => {
      doc.fontSize(12).text(`${idx + 1}. ${r.reader} - ${r.borrow_count} lượt mượn`);
    });
    doc.moveDown();

    doc.fontSize(14).text("📈 Lượt mượn theo tháng:");
    monthRows.forEach((m: any) => {
      doc.fontSize(12).text(`${m.month}: ${m.total} lượt`);
    });
    doc.moveDown();

    doc.fontSize(14).text("📑 Sách theo thể loại:");
    booksByGenre.forEach((g: any) => {
      doc.fontSize(12).text(`${g.genre}: ${g.total} sách`);
    });

    doc.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ================== START SERVER ==================
app.listen(5000, () => {
  console.log("✅ Server chạy tại http://localhost:5000");
});
