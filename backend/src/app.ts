import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pool from './config/database';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes';

dotenv.config();
const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ message: 'API is running', db_check: rows });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});