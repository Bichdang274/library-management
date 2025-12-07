import BorrowModel from '../models/borrowModel';
import BookModel from '../models/bookModel';
import db from '../config/db'; // Cần để dùng transaction nếu muốn an toàn, ở đây ta làm đơn giản trước

export const getAllBorrows = async () => {
    return await BorrowModel.getAll();
};

export const getMyBorrows = async (userId: number) => {
    return await BorrowModel.getByReaderId(userId);
};

// Mượn sách
export const borrowBook = async (readerId: number, bookId: number, daysToBorrow: number = 14) => {
    // 1. Kiểm tra sách còn không
    const book = await BookModel.getById(bookId);
    if (!book || book.available_copies <= 0) {
        throw new Error('Sách này đã hết hoặc không tồn tại');
    }

    // 2. Tính ngày phải trả
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysToBorrow);
    const dueDateStr = dueDate.toISOString().slice(0, 10); // YYYY-MM-DD

    // 3. Tạo phiếu mượn
    const borrowId = await BorrowModel.create(readerId, bookId, dueDateStr);

    // 4. Trừ số lượng sách khả dụng đi 1
    const newAvailable = book.available_copies - 1;
    await BookModel.update(bookId, { available_copies: newAvailable });

    return borrowId;
};

// Trả sách
export const returnBook = async (borrowId: number) => {
    // 1. Lấy thông tin phiếu mượn
    const borrow = await BorrowModel.getById(borrowId);
    if (!borrow) throw new Error('Phiếu mượn không tồn tại');
    if (borrow.status === 'RETURNED') throw new Error('Sách này đã trả rồi');

    // 2. Cập nhật trạng thái phiếu mượn thành RETURNED
    await BorrowModel.updateStatus(borrowId, 'RETURNED', new Date());

    // 3. Cộng số lượng sách khả dụng lên 1
    const book = await BookModel.getById(borrow.book_id);
    if (book) {
        const newAvailable = book.available_copies + 1;
        await BookModel.update(borrow.book_id, { available_copies: newAvailable });
    }

    return true;
};