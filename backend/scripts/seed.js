import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../src/config/db.js';
import Book from '../src/models/Book.js';
import User from '../src/models/User.js';
import Borrow from '../src/models/Borrow.js';

const run = async () => {
  await connectDB();

  // Xóa dữ liệu cũ
  await Book.deleteMany({});
  await User.deleteMany({});
  await Borrow.deleteMany({});

  // Thêm sách mẫu
  const books = await Book.insertMany([
    { title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', genre: 'Văn học', copies: 5, available: 5 },
    { title: 'Vũ Trụ Trong Vỏ Hạt Dẻ', author: 'Stephen Hawking', genre: 'Khoa học', copies: 3, available: 3 },
    { title: 'Lược Sử Thời Gian', author: 'Stephen Hawking', genre: 'Khoa học', copies: 4, available: 4 },
    { title: 'Kinh Tế Học Căn Bản', author: 'Gregor', genre: 'Kinh tế', copies: 2, available: 2 },
    { title: 'Cơ Sở Y Học', author: 'Nguyễn Văn A', genre: 'Y học', copies: 2, available: 2 },
    { title: 'Lập Trình JavaScript', author: 'Kyle Simpson', genre: 'Công nghệ', copies: 6, available: 6 }
  ]);

  // Tạo admin với mật khẩu hash
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    passwordHash,
    role: 'admin',
  });

  console.log('Seed xong:', { books: books.length, admin: admin.email });

  await mongoose.connection.close();
  process.exit(0);
};

run();
