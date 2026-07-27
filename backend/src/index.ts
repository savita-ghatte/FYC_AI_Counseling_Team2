import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

import path from 'path';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import collegeRoutes from './routes/collegeRoutes';
import predictorRoutes from './routes/predictorRoutes';
import predictionRoutes from './routes/predictionRoutes';
import scholarshipRoutes from './routes/scholarshipRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';
import documentRoutes from './routes/documentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './utils/errorHandler';
import { initMailer } from './utils/mailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Init Mock SMTP
initMailer();

// Middleware
app.use(compression()); // Gzip compression for responses
app.use(morgan('dev')); // Request logging
app.use(cors({
  origin: 'http://localhost:5173', // Strict CORS for frontend
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https://*"],
    }
  }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 5000, // 100 in prod, 5000 in dev
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'))); // Serve uploaded files statically
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/predictor', predictorRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Serve frontend in production (or when running from compiled dist directory)
const isProduction = __dirname.endsWith('dist') || process.env.NODE_ENV === 'production';
if (isProduction) {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
