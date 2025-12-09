import CategoryModel from '../models/categoryModel';

export const getAllCategories = async () => {
    return await CategoryModel.getAll();
};

export const getCategoryById = async (id: number) => {
    const category = await CategoryModel.getById(id);
    if (!category) {
        throw new Error('Danh mục không tồn tại');
    }
    return category;
};

export const createCategory = async (name: string) => {
    return await CategoryModel.create(name);
};

export const updateCategory = async (id: number, name: string) => {
    const existing = await CategoryModel.getById(id);
    if (!existing) {
        throw new Error('Danh mục không tồn tại để cập nhật');
    }
    return await CategoryModel.update(id, name);
};

export const deleteCategory = async (id: number) => {
    const existing = await CategoryModel.getById(id);
    if (!existing) {
        throw new Error('Danh mục không tồn tại');
    }
    return await CategoryModel.delete(id);
};