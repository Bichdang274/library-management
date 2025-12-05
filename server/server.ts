import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Lưu ý: Phải có đuôi .js
import transactionRoutes from './routes/transactionRoutes'; 

dotenv.config();

// Khai báo kiểu Application cho app
const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('API Library Management is running (TypeScript)...');
});

// Tích hợp routes
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📘 Chế độ: TypeScript`);
    console.log(`-----------------------------------------`);
});