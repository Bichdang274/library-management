// backend/src/routes/statsRoutes.ts

import { Router } from "express";
import * as statsController from "../controllers/statsController";
import * as exportController from "../controllers/exportController"; 

const router: Router = Router();

// API lấy số liệu hiển thị lên Dashboard
router.get("/", statsController.getStats);
router.get("/borrows-by-month", statsController.getBorrowsByMonth);
router.get("/borrows-by-genre", statsController.getBorrowsByGenre); // FIX: Sửa lỗi chính tả

// BỔ SUNG ROUTES CHO TOP LISTS (Sửa lỗi 404 cho Frontend)
router.get("/top-books", statsController.getTopBooks);      
router.get("/top-readers", statsController.getTopReaders);  

// API Xuất báo cáo (Download file) - Sử dụng exportController
router.get("/export/csv", exportController.exportCsv);
router.get("/export/excel", exportController.exportXlsx); 
router.get("/export/pdf", exportController.exportPdf); 

export default router;