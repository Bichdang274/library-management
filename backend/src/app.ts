import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';

// 1. Config Database
import pool from './config/db'; // Đã đổi tên từ 'db' thành 'pool' để dễ quản lý

// 2. Import Controllers và Routes
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes'; 
import borrowRoutes from './routes/borrowRoutes';     
import statsRoutes from './routes/statsRoutes'; // Routes thống kê
import readerRoutes from './routes/readerRoutes'; 
import book1Routes from './routes/book1Routes';

// Chỉ cần import routes, controller không cần thiết ở đây nếu đã dùng routes file
// import * as statsController from "./controllers/statsController"; // KHÔNG CẦN THIẾT
// import * as exportController from "./controllers/exportController"; // KHÔNG CẦN THIẾT


dotenv.config();

const app: Application = express();

// --- Middleware Cấu hình chung ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Static folder (để hiển thị ảnh bìa sách)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Routes Mounting (Gắn API vào đường dẫn) ---
app.use('/api/auth', authRoutes); 
app.use('/api/books', bookRoutes); 
app.use('/api/categories', categoryRoutes); 
app.use('/api/transactions', borrowRoutes);

// Gắn routes thống kê và export (Nếu bạn đã định nghĩa chúng trong statsRoutes)
app.use('/api/stats', statsRoutes); // Chứa các API thống kê và Export nếu bạn định nghĩa chung
// Nếu bạn có file exportRoutes riêng: app.use('/api/export', exportRoutes); 

app.use('/api/readers', readerRoutes); 
app.use('/api/books1', book1Routes);


// --- Health Check & DB Test (Sử dụng 'pool' đã import) ---
app.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ 
            status: 'success', 
            message: 'Library API is ready 🚀', 
            db_connection: 'connected',
            test_result: (rows as any)[0].result // Truy cập kết quả truy vấn
        });
    } catch (error) {
        // Lỗi kết nối database ban đầu sẽ được bắt ở đây
        res.status(503).json({ error: 'Database connection failed. Service Unavailable.' });
    }
});

// --------------------------------------------------------------------------
// LƯU Ý QUAN TRỌNG:
// XÓA BỎ CÁC PHẦN CODE BỊ TRÙNG LẶP DƯỚI ĐÂY VÌ CHÚNG GÂY LỖI THAM CHIẾU VÀ DƯ THỪA.
// --------------------------------------------------------------------------

// --- GLOBAL ERROR HANDLER (Xử lý lỗi 500) ---
const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('LỖI SERVER KHÔNG XÁC ĐỊNH:', err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Lỗi hệ thống không xác định (Internal Server Error).',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
app.use(globalErrorHandler);

// --- 404 Handler (Phải đặt sau Global Error Handler) ---
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'API Route not found' });
});

export default app;