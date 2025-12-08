// backend/src/controllers/exportController.ts

import { Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise"; 
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import path from "path";
const PDFDocument = require("pdfkit");
import db from "../config/db"; // Sử dụng db (là PromisePool)

// Tái sử dụng hàm truy vấn DB
async function fetchAllStats() {
    // FIX: Sử dụng db.query trực tiếp
    const [statsRows] = await db.query<RowDataPacket[]>(
        `SELECT (SELECT COUNT(*) FROM books) AS totalBooks,
                (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
                (SELECT COUNT(*) FROM readers) AS totalReaders,
                (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows`
    );
    const [monthRows] = await db.query<RowDataPacket[]>(
        `SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS total FROM borrowings GROUP BY month ORDER BY month`
    );
    const [booksByGenre] = await db.query<RowDataPacket[]>(
        `SELECT c.category_name AS genre, COUNT(*) AS total FROM books b INNER JOIN categories c ON b.category_id = c.category_id GROUP BY genre ORDER BY total DESC`
    );
    const [topBooks] = await db.query<RowDataPacket[]>(
        `SELECT b.name AS title, COUNT(br.book_id) AS borrow_count FROM borrowings br JOIN books b ON br.book_id = b.book_id GROUP BY b.book_id, b.name ORDER BY borrow_count DESC LIMIT 5`
    );
    const [topReaders] = await db.query<RowDataPacket[]>(
        `SELECT r.name AS reader, COUNT(br.reader_id) AS borrow_count FROM borrowings br JOIN readers r ON br.reader_id = r.reader_id GROUP BY r.reader_id, r.name ORDER BY borrow_count DESC LIMIT 5`
    );

    return { statsRows, monthRows, booksByGenre, topBooks, topReaders };
}

// ================== EXPORT CSV ==================
export const exportCsv = async (_req: Request, res: Response) => {
    try {
        const { statsRows, monthRows, booksByGenre, topBooks, topReaders } = await fetchAllStats();

        const combined = [
            { section: "Thống kê", ...statsRows[0] },
            ...monthRows.map((r: any) => ({ section: "Lượt mượn theo tháng", ...r })), 
            ...booksByGenre.map((r: any) => ({ section: "Sách theo thể loại", ...r })), 
            ...topBooks.map((r: any) => ({ section: "Top sách", ...r })), 
            ...topReaders.map((r: any) => ({ section: "Top độc giả", ...r })), 
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
};

// ... (Giữ nguyên logic exportXlsx và exportPdf, chỉ cần đảm bảo các vòng lặp đã thêm ': any')
export const exportXlsx = async (_req: Request, res: Response) => {
    try {
        const { statsRows, monthRows, booksByGenre, topBooks, topReaders } = await fetchAllStats();
        const workbook = new ExcelJS.Workbook();
        
        // ...
        monthRows.forEach((r: any) => workbook.addWorksheet("Borrows by Month").addRow(r)); 
        booksByGenre.forEach((r: any) => workbook.addWorksheet("Books by Genre").addRow(r)); 
        topBooks.forEach((r: any) => workbook.addWorksheet("Top Books").addRow(r)); 
        topReaders.forEach((r: any) => workbook.addWorksheet("Top Readers").addRow(r)); 
        // ...
        await workbook.xlsx.write(res);
        res.end();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const exportPdf = async (_req: Request, res: Response) => {
    try {
        const { statsRows, monthRows, booksByGenre, topBooks, topReaders } = await fetchAllStats();
        const doc = new PDFDocument();
        const fontPath = path.join(__dirname, "..", "fonts", "Roboto-Regular.ttf"); 
        doc.registerFont("Roboto", fontPath).font("Roboto");
        // ...
        topBooks.forEach((b: any, idx: number) => { /* ... */ }); 
        topReaders.forEach((r: any, idx: number) => { /* ... */ }); 
        monthRows.forEach((m: any) => { /* ... */ }); 
        booksByGenre.forEach((g: any) => { /* ... */ }); 
        doc.end();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};