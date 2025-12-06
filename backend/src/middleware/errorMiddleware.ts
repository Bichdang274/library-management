import { Request, Response, NextFunction } from "express";

// Middleware xử lý lỗi toàn cục
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });
};
