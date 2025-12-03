import type { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');


interface VerifiedUser {
    id: number | string;
    role: 'reader' | 'admin';
    name: string;
}

interface CustomRequest extends Request {
    user?: VerifiedUser; 
}


module.exports = (req: CustomRequest, res: Response, next: NextFunction) => { 
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Truy cập bị từ chối: Không có token' });
    }
    
    const token = authHeader.replace('Bearer ', '');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET) as VerifiedUser; 
        
        req.user = verified;
        next();
    } catch (err: any) { 
        res.status(400).json({ message: 'Token không hợp lệ' });
    }
};