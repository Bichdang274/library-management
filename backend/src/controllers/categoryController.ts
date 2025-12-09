import { Request, Response } from 'express';
import CategoryModel from '../models/categoryModel';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await CategoryModel.getAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh mục' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { category_name } = req.body;
        
        if (!category_name) {
            return res.status(400).json({ message: 'Tên thể loại không được để trống' });
        }
        
        await CategoryModel.create(category_name);
        res.status(201).json({ message: 'Tạo danh mục thành công' });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Tên thể loại đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { category_name } = req.body;
        
        if (!category_name) {
            return res.status(400).json({ message: 'Tên thể loại không được để trống' });
        }

        await CategoryModel.update(id, category_name);
        res.json({ message: 'Cập nhật thành công' });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Tên thể loại đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await CategoryModel.delete(id);
        res.json({ message: 'Xóa thành công' });
    } catch (error: any) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Không thể xóa: Đang có sách thuộc thể loại này!' });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};