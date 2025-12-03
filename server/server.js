import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Note: the routes folder in this project is named `router` (not `routes`).
// Fix import path so Node can resolve the module correctly.
import transactionRoutes from './router/transactionRoutes.js'; // <--- QUAN TRỌNG: Phải có đuôi .js

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Library Management is running...');
});

// Tích hợp routes
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`-----------------------------------------`);
});
