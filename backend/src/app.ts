import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import pool from './config/db';

import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes'; 
import borrowRoutes from './routes/borrowRoutes';     
import statsRoutes from './routes/statsRoutes';
import readerRoutes from './routes/readerRoutes'; 

import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes); 
app.use('/api/books', bookRoutes); 
app.use('/api/categories', categoryRoutes); 
app.use('/api/transactions', borrowRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/readers', readerRoutes); 

app.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ 
            status: 'success', 
            message: 'Library API is ready 🚀', 
            db_connection: 'connected',
            test_result: (rows as any)[0].result 
        });
    } catch (error) {
        res.status(503).json({ error: 'Database connection failed. Service Unavailable.' });
    }
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'API Route not found' });
});

app.use(errorHandler);

export default app;