import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import connectDB from './db';
import { errorHandler } from './middleware/errorMiddleware';

import bookRoutes from './routes/bookRoutes';
import borrowRoutes from './routes/borrowRoutes';
import statsRoutes from './routes/statsRoutes';

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


// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

export default app;
