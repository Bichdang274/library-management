import { Request, Response } from "express";
import db from "../config/db"; // Import kết nối DB chuẩn
import { RowDataPacket } from "mysql2";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
const PDFDocument = require('pdfkit'); // Dùng require cho pdfkit để tránh lỗi type phức tạp

// --- 1. Lấy thống kê tổng quan (Dashboard) ---
export const getStats = async (req: Request, res: Response) => {
  try {
    // Query gộp để lấy 4 chỉ số quan trọng nhất
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders,
        (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows
    `);
    
    // Trả về object dữ liệu đầu tiên
    res.json(rows[0]);
  } catch (err: any) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- 2. Dữ liệu biểu đồ: Lượt mượn theo tháng ---
export const getBorrowsByMonth = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS ym, COUNT(*) AS total
      FROM borrowings GROUP BY ym ORDER BY ym;
    `);
    res.json({ data: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- 3. Dữ liệu biểu đồ: Sách theo thể loại ---
export const getBooksByGenre = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
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
};

// --- 4. Export CSV (Tất cả dữ liệu) ---
export const exportCSV = async (req: Request, res: Response) => {
  try {
    // Lấy tất cả dữ liệu cần thiết
    const [stats] = await db.query<RowDataPacket[]>(`SELECT (SELECT COUNT(*) FROM books) AS totalBooks, (SELECT COUNT(*) FROM borrowings) AS totalBorrows`);
    const [byMonth] = await db.query<RowDataPacket[]>(`SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS total FROM borrowings GROUP BY month`);
    
    // Gộp dữ liệu lại
    const combinedData = [
      { section: "OVERVIEW", ...stats[0] },
      ...byMonth.map((r) => ({ section: "BORROWS_BY_MONTH", month: r.month, total: r.total }))
    ];

    const parser = new Parser();
    const csv = parser.parse(combinedData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=library-report.csv");
    res.status(200).send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- 5. Export Excel (Đầy đủ các sheet) ---
export const exportExcel = async (req: Request, res: Response) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Tổng quan
    const statsSheet = workbook.addWorksheet("Tổng quan");
    const [statsRows] = await db.query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM books) AS totalBooks,
        (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
        (SELECT COUNT(*) FROM readers) AS totalReaders
    `);
    statsSheet.columns = [{ header: 'Chỉ số', key: 'key', width: 20 }, { header: 'Giá trị', key: 'value', width: 15 }];
    statsSheet.addRow({ key: "Tổng số sách", value: statsRows[0].totalBooks });
    statsSheet.addRow({ key: "Tổng lượt mượn", value: statsRows[0].totalBorrows });
    statsSheet.addRow({ key: "Tổng độc giả", value: statsRows[0].totalReaders });

    // Sheet 2: Mượn theo tháng
    const [monthRows] = await db.query<RowDataPacket[]>(`
      SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS total
      FROM borrowings GROUP BY month ORDER BY month;
    `);
    const monthSheet = workbook.addWorksheet("Mượn theo tháng");
    monthSheet.columns = [{ header: "Tháng", key: "month", width: 15 }, { header: "Số lượt", key: "total", width: 15 }];
    monthRows.forEach((r) => monthSheet.addRow(r));

    // Thiết lập header trả về file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=library-report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// --- 6. Export PDF ---
export const exportPDF = async (req: Request, res: Response) => {
  try {
    const [stats] = await db.query<RowDataPacket[]>(`SELECT COUNT(*) AS totalBooks FROM books`);
    
    const doc = new PDFDocument();
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=library-report.pdf");
    
    doc.pipe(res); // Gửi luồng dữ liệu trực tiếp về response

    // Nội dung PDF
    doc.fontSize(20).text("BÁO CÁO THƯ VIỆN", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.fontSize(14).text(`Tổng số sách hiện có: ${stats[0].totalBooks}`);
    doc.text("------------------------------------------------");
    doc.text("Hệ thống quản lý thư viện (Library Management System)");

    doc.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};