import { Request, Response } from 'express';

import readerService from '../services/readerService'; 
import { AuthRequest } from '../middleware/authMiddleware'; 



interface CreateReaderBody {
    name: string;
    email: string;
    password?: string; 
    quota?: number;
    phone_number?: string;
    address?: string;
}


export const getReadersHandler = async (req: Request, res: Response) => {
    try {
        
        const readers = await readerService.getReaders(); 
        res.status(200).json({ data: readers });
    } catch (err: unknown) { 
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi không xác định khi lấy danh sách" });
    }
};



export const createReaderHandler = async (req: Request<{}, {}, CreateReaderBody>, res: Response) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Thiếu tên, email hoặc mật khẩu!" });
        }
        
        
        const creationData = {
            ...req.body,
            password: password as string, 
        };

        
        const newId: number = await readerService.createReader(creationData as any); 

        return res.status(201).json({ message: "Tạo thành công", readerId: newId });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
        return res.status(500).json({ message: error.message || "Lỗi server khi tạo reader" });
    }
};



export const updateReaderHandler = async (req: Request<{ id: string }, {}, Partial<CreateReaderBody>>, res: Response) => {
    try {
        const readerId: string = req.params.id;
        
        await readerService.updateReader(readerId, req.body); 
        
        res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Lỗi server khi cập nhật" });
    }
};


export const deleteReaderHandler = async (req: Request<{ id: string }>, res: Response) => {
    try {
        
        await readerService.deleteReader(req.params.id); 
        res.status(200).json({ message: 'Xóa thành công' });
    } catch (err: any) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: "Không thể xóa: Độc giả này còn dữ liệu liên quan." });
        }
        res.status(500).json({ message: err.message || "Lỗi server khi xóa" });
    }
};