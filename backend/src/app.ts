import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan'; // Logger từ nhánh mới

// 1. Database & Config
import pool from './config/db'; // Giữ kết nối MySQL của bạn

// 2. Import Routes
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes'; // Của nhánh cũ
import borrowRoutes from './routes/borrowRoutes';     // Tính năng mới
import statsRoutes from './routes/statsRoutes';       // Tính năng mới

// 3. Import Routes Auth (Legacy - CommonJS)
// Chúng ta giữ nguyên require để tránh lỗi module
const apiRoutes = require('./routes/api');

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger (Chỉ hiện khi không phải production)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Cấu hình thư mục ảnh tĩnh (cho tính năng upload sách)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Routes Definition ---

// 1. Route Auth (Login/Register)
app.use('/api', apiRoutes);

// 2. Các Route chính
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/borrows', borrowRoutes); // Gộp thêm route mượn trả
app.use('/api/stats', statsRoutes);    // Gộp thêm route thống kê

// --- Health Check ---
// Kiểm tra cả server lẫn kết nối Database
app.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({
            message: 'Server is running',
            status: 'success',
            db_connection: 'connected',
            test_query: rows
        });
    } catch (error) {
        console.error('Lỗi kết nối CSDL:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Xử lý 404 (Route không tồn tại)
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'API Route Not Found' });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`   - Auth: http://localhost:${port}/api`);
    console.log(`   - Books: http://localhost:${port}/api/books`);
});

export default app;