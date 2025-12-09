import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

interface UserPayload extends JwtPayload {
    id: number;
    role: string;
    name: string;
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ message: "Bạn chưa đăng nhập (Thiếu Token)" });
        return;
    }

    const token = header.split(" ")[1];

    try {
        if (!process.env.JWT_SECRET) throw new Error("Chưa cấu hình JWT_SECRET");
        
        const payload = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
        req.user = payload;
        next();
    } catch (err) {
        res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && (req.user.role === "admin" || req.user.role === "manager")) {
        next();
    } else {
        res.status(403).json({ message: "Quyền truy cập bị từ chối (Yêu cầu Admin)" });
    }
};