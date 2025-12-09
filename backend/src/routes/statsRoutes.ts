import { Router } from "express";
import * as statsController from "../controllers/statsController";

const router: Router = Router();

router.get("/", statsController.getStats);
router.get("/borrows-by-month", statsController.getBorrowsByMonth);
router.get("/borrows-by-genre", statsController.getBorrowsByGenre);
router.get("/top-books", statsController.getTopBooks);      
router.get("/top-readers", statsController.getTopReaders);

export default router;