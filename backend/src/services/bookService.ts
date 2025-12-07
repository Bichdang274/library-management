import BookModel from '../models/bookModel';

// Lấy danh sách sách (có hỗ trợ tìm kiếm và lọc danh mục)
export const getAllBooks = async (keyword: string, categoryId: number) => {
    // Gọi hàm getAll từ Model, Model sẽ lo việc tạo câu SQL lọc
    return await BookModel.getAll(keyword, categoryId);
};

// Lấy chi tiết 1 cuốn sách (Thêm hàm này vì Controller cần dùng)
export const getBookById = async (id: number) => {
    const book = await BookModel.getById(id);
    if (!book) {
        throw new Error('Sách không tồn tại');
    }
    return book;
};

// Thêm sách mới
export const createBook = async (bookData: any) => {
    // Validate dữ liệu cơ bản (Business Logic)
    if (!bookData.name || !bookData.category_id) {
        throw new Error('Tên sách và danh mục là bắt buộc');
    }

    // Logic nghiệp vụ: Khi tạo mới, số lượng khả dụng = tổng số lượng
    // Ta gán thêm trường available_copies vào data trước khi gửi sang Model
    const dataToSave = {
        ...bookData,
        available_copies: bookData.total_copies // Logic cũ của bạn
    };

    // Gọi Model để lưu vào DB
    return await BookModel.create(dataToSave);
};

// Cập nhật sách
export const updateBook = async (id: number, bookData: any) => {
    // Bước 1: Kiểm tra xem sách có tồn tại không
    const existingBook = await BookModel.getById(id);
    if (!existingBook) {
        throw new Error('Không tìm thấy sách để cập nhật');
    }

    // Bước 2: Gọi Model để update
    // Model đã có logic: chỉ update các trường có dữ liệu, và tự xử lý logic ảnh
    return await BookModel.update(id, bookData);
};

// Xóa sách
export const deleteBook = async (id: number) => {
    // Bước 1: Kiểm tra tồn tại
    const existingBook = await BookModel.getById(id);
    if (!existingBook) {
        throw new Error('Sách không tồn tại');
    }

    // Bước 2: Gọi Model để xóa
    return await BookModel.delete(id);
};