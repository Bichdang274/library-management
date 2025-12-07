import { Router } from "express";
import * as statsController from "../controllers/statsController";

const router: Router = Router();

// API lấy số liệu hiển thị lên Dashboard
router.get("/", statsController.getStats);
router.get("/borrows-by-month", statsController.getBorrowsByMonth);
router.get("/borrows-by-genre", statsController.getBooksByGenre);

// API Xuất báo cáo (Download file)
router.get("/export/csv", statsController.exportCSV);
router.get("/export/excel", statsController.exportExcel);
router.get("/export/pdf", statsController.exportPDF);

export default router;