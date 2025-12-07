import express, { Application, Request, Response, NextFunction } from 'express'; // Thêm NextFunction
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';

// 1. Config Database
import pool from './config/db';

// 2. Import Routes (Giữ nguyên các routes đã fix)
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes'; 
import borrowRoutes from './routes/borrowRoutes';     
import statsRoutes from './routes/statsRoutes';       
import readerRoutes from './routes/readerRoutes';       // Thêm Route Độc giả

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
app.use('/api/borrows', borrowRoutes);    
app.use('/api/stats', statsRoutes);       
app.use('/api/readers', readerRoutes);      // Gắn Route Độc giả

// --- Health Check ---
app.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ 
            status: 'success', 
            message: 'Library API is ready 🚀', 
            db_connection: 'connected' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// --- GLOBAL ERROR HANDLER (Xử lý lỗi 500) ---
// Phải đặt sau tất cả các routes để bắt lỗi (err) từ tầng service/controller
const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('LỖI SERVER KHÔNG XÁC ĐỊNH:', err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Lỗi hệ thống không xác định (Internal Server Error).',
        // Chỉ hiển thị stack trace khi ở môi trường phát triển (development)
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
app.use(globalErrorHandler);

// --- 404 Handler (Phải đặt sau Global Error Handler) ---
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'API Route not found' });
});


export default app;