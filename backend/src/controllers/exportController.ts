import { Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise"; 
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import path from "path";
import PDFDocument from "pdfkit";
import pool from "../config/db";

async function fetchAllStats() {
    const [statsRows] = await pool.query<RowDataPacket[]>(
        `SELECT (SELECT COUNT(*) FROM books) AS totalBooks,
                (SELECT COUNT(*) FROM borrowings) AS totalBorrows,
                (SELECT COUNT(*) FROM readers) AS totalReaders,
                (SELECT COUNT(*) FROM borrowings WHERE return_date IS NULL) AS currentBorrows`
    );
    const [monthRows] = await pool.query<RowDataPacket[]>(
        `SELECT DATE_FORMAT(borrow_date, '%Y-%m') AS month, COUNT(*) AS total FROM borrowings GROUP BY month ORDER BY month`
    );
    const [booksByGenre] = await pool.query<RowDataPacket[]>(
        `SELECT c.category_name AS genre, COUNT(*) AS total FROM books b INNER JOIN categories c ON b.category_id = c.category_id GROUP BY genre ORDER BY total DESC`
    );
    const [topBooks] = await pool.query<RowDataPacket[]>(
        `SELECT b.name AS title, COUNT(br.book_id) AS borrow_count FROM borrowings br JOIN books b ON br.book_id = b.book_id GROUP BY b.book_id, b.name ORDER BY borrow_count DESC LIMIT 5`
    );
    const [topReaders] = await pool.query<RowDataPacket[]>(
        `SELECT r.name AS reader, COUNT(br.reader_id) AS borrow_count FROM borrowings br JOIN readers r ON br.reader_id = r.reader_id GROUP BY r.reader_id, r.name ORDER BY borrow_count DESC LIMIT 5`
    );

    return { statsRows, monthRows, booksByGenre, topBooks, topReaders };
}

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

export const exportXlsx = async (_req: Request, res: Response) => {
    try {
        const { statsRows, monthRows, booksByGenre, topBooks, topReaders } = await fetchAllStats();
        const workbook = new ExcelJS.Workbook();
        
        const sheetStats = workbook.addWorksheet("General Stats");
        sheetStats.addRow(Object.keys(statsRows[0]));
        sheetStats.addRow(Object.values(statsRows[0]));

        const sheetMonth = workbook.addWorksheet("Borrows by Month");
        sheetMonth.addRow(["Month", "Total"]);
        monthRows.forEach((r: any) => sheetMonth.addRow([r.month, r.total]));

        const sheetGenre = workbook.addWorksheet("Books by Genre");
        sheetGenre.addRow(["Genre", "Total"]);
        booksByGenre.forEach((r: any) => sheetGenre.addRow([r.genre, r.total]));

        const sheetTopBooks = workbook.addWorksheet("Top Books");
        sheetTopBooks.addRow(["Title", "Borrow Count"]);
        topBooks.forEach((r: any) => sheetTopBooks.addRow([r.title, r.borrow_count]));

        const sheetTopReaders = workbook.addWorksheet("Top Readers");
        sheetTopReaders.addRow(["Reader", "Borrow Count"]);
        topReaders.forEach((r: any) => sheetTopReaders.addRow([r.reader, r.borrow_count]));

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=library-report.xlsx");

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

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=library-report.pdf");

        doc.pipe(res);

        doc.fontSize(20).text("Báo Cáo Thư Viện", { align: "center" });
        doc.moveDown();

        doc.fontSize(14).text("1. Thống kê chung:");
        doc.fontSize(12).text(`- Tổng sách: ${statsRows[0].totalBooks}`);
        doc.text(`- Tổng lượt mượn: ${statsRows[0].totalBorrows}`);
        doc.text(`- Tổng độc giả: ${statsRows[0].totalReaders}`);
        doc.text(`- Đang mượn: ${statsRows[0].currentBorrows}`);
        doc.moveDown();

        doc.fontSize(14).text("2. Top Sách Mượn Nhiều:");
        topBooks.forEach((b: any, idx: number) => {
            doc.fontSize(12).text(`${idx + 1}. ${b.title} (${b.borrow_count} lượt)`);
        });
        doc.moveDown();

        doc.fontSize(14).text("3. Top Độc Giả Tích Cực:");
        topReaders.forEach((r: any, idx: number) => {
            doc.fontSize(12).text(`${idx + 1}. ${r.reader} (${r.borrow_count} lượt)`);
        });

        doc.end();
    } catch (err: any) {
        if (!res.headersSent) res.status(500).json({ error: err.message });
    }
};