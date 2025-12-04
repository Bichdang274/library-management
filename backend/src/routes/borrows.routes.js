import { Router } from "express";
import { getBorrows } from "../controllers/borrows.controller.js";

const router = Router();

router.get("/", getBorrows);

export default router;
