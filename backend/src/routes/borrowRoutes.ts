import { Router } from "express";
import { getBorrows } from "../controllers/borrowsController";

const router: Router = Router();

router.get("/", getBorrows);

export default router;
