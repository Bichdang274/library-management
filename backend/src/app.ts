import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// 1. Import kết nối DB và Routes mới từ nhánh HoangAnh
import pool from './config/database';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes';

// 2. Import Routes Auth (Đăng nhập/Đăng ký) từ nhánh cũ
// SỬA LỖI: Dùng require thay vì import để tránh lỗi "is not a module"
// vì file api.ts/js cũ dùng module.exports
const apiRoutes = require('./routes/api'); 

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Thay thế cho bodyParser.json()
app.use(express.urlencoded({ extended: true }));

// Cấu hình thư mục ảnh tĩnh (cho tính năng upload sách)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 

// --- GỘP ROUTES ---

// 1. Route Auth
// Các api như /api/login, /api/register sẽ chạy qua đây
app.use('/api', apiRoutes);

// 2. Route Sách & Thể loại 
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);

// Route kiểm tra server & DB
app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ 
            message: 'Server is running', 
            status: 'success',
            db_connection: rows 
        });
    } catch (error) {
        console.error('Lỗi kết nối CSDL:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API Auth: http://localhost:${port}/api`);
    console.log(`API Books: http://localhost:${port}/api/books`);
});

export default app;