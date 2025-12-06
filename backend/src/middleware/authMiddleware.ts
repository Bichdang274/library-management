import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Khai báo type mở rộng cho Request để có thể gắn user
export interface AuthRequest extends Request {
  user?: JwtPayload | string | any;
}

// Middleware xác thực JWT
export const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware chỉ cho admin
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user as any).role !== "admin") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};
