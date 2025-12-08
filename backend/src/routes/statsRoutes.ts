import { Router } from "express";
import * as statsController from "../controllers/statsController";
import * as exportController from "../controllers/exportController"; 

const router: Router = Router();


router.get("/", statsController.getStats);
router.get("/borrows-by-month", statsController.getBorrowsByMonth);
router.get("/borrows-by-genre", statsController.getBorrowsByGenre); 


router.get("/top-books", statsController.getTopBooks);      
router.get("/top-readers", statsController.getTopReaders);  


router.get("/export/csv", exportController.exportCsv);
router.get("/export/excel", exportController.exportXlsx); 
router.get("/export/pdf", exportController.exportPdf); 

export default router;