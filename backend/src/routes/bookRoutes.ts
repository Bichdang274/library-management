import { Router } from "express";
import { getBooks, addBook } from "../controllers/booksController";

const router: Router = Router();

router.get("/", getBooks);
router.post("/", addBook);

export default router;
