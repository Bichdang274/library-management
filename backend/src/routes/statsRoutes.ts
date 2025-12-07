import { Router } from "express";
import { getStats, getTopBooks, getTopReaders } from "../controllers/statsController";

const router: Router = Router();

// Route thống kê tổng quan
router.get("/", getStats);

// Route Top 5 Sách Hot
router.get("/top-books", getTopBooks);

// Route Top 5 Mọt Sách
router.get("/top-readers", getTopReaders);

export default router;
