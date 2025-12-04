
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

import bookRoutes from './routes/bookRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Connect database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
  app.use(errorHandler);
}

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);


app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

export default app;
