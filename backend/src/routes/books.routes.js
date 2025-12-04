import { Router } from "express";
import { getBooks, addBook } from "../controllers/books.controller.js";

const router = Router();

router.get("/", getBooks);
router.post("/", addBook);

export default router;
