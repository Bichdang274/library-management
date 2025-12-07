import CategoryModel from '../models/categoryModel';

// Lấy danh sách danh mục
export const getAllCategories = async () => {
    return await CategoryModel.getAll();
};

// Lấy chi tiết 1 danh mục (để kiểm tra tồn tại)
export const getCategoryById = async (id: number) => {
    const category = await CategoryModel.getById(id);
    if (!category) {
        throw new Error('Danh mục không tồn tại');
    }
    return category;
};

// Tạo danh mục mới
export const createCategory = async (name: string) => {
    // Gọi Model để insert vào DB
    return await CategoryModel.create(name);
};

// Cập nhật danh mục
export const updateCategory = async (id: number, name: string) => {
    // Bước 1: Kiểm tra xem danh mục có tồn tại không
    const existing = await CategoryModel.getById(id);
    if (!existing) {
        throw new Error('Danh mục không tồn tại để cập nhật');
    }

    // Bước 2: Gọi Model update
    return await CategoryModel.update(id, name);
};

// Xóa danh mục
export const deleteCategory = async (id: number) => {
    // Bước 1: Kiểm tra tồn tại
    const existing = await CategoryModel.getById(id);
    if (!existing) {
        throw new Error('Danh mục không tồn tại');
    }

    // Bước 2: Gọi Model delete
    // Lưu ý: Nếu có sách thuộc danh mục này, SQL sẽ báo lỗi (Controller sẽ bắt lỗi đó)
    return await CategoryModel.delete(id);
};