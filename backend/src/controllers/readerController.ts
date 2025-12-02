import type { Request, Response } from 'express'; 
const ReaderModel = require('../models/readerModel');
const bcrypt = require('bcryptjs'); 

interface CreateReaderBody {
    name: string;
    email: string;
    password?: string; 
    quota?: number;
    phone_number?: string;
    address?: string;
}

exports.getReaders = async (req: Request, res: Response) => {
    try {
        const readers = await ReaderModel.getAll(); 
        res.status(200).json({ data: readers });
    } catch (err: unknown) { 
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi không xác định khi lấy danh sách" });
    }
};


exports.createReader = async (req: Request<{}, {}, CreateReaderBody>, res: Response) => {
    try {
        const { name, email, password, quota, phone_number, address } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Thiếu tên, email hoặc mật khẩu!" });
        }
        const salt: string = await bcrypt.genSalt(10);
        const passwordHash: string = await bcrypt.hash(password, salt);
        const newId: number = await ReaderModel.create({
            name, email, phone_number, address,
            password_hash: passwordHash,
            quota: quota
        });

        return res.status(201).json({ message: "Tạo thành công", readerId: newId });
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ message: "Email đã tồn tại" });
        }
        if (error instanceof Error) {
             return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "Lỗi không xác định khi tạo reader" });
    }
};


exports.updateReader = async (req: Request<{ id: string }, {}, Partial<CreateReaderBody>>, res: Response) => {
    try {
        const readerId: string = req.params.id;
        await ReaderModel.update(readerId, req.body); 
        
        res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi không xác định khi cập nhật" });
    }
};

exports.deleteReader = async (req: Request<{ id: string }>, res: Response) => {
    try {
        await ReaderModel.delete(req.params.id);
        res.status(200).json({ message: 'Xóa thành công' });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi không xác định khi xóa" });
    }
};