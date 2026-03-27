import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import stockRoutes from './routes/stock.js';
import taxRoutes from './routes/tax.js';
import creditRoutes from './routes/credit.js';
import loanRoutes from './routes/loans.js';
import adminRoutes from './routes/admin.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  transport: NODE_ENV === 'development' && {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

// ========== MIDDLEWARE ==========

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.VITE_API_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Too many requests from this IP, please try again later.'
});

if (process.env.RATE_LIMIT_ENABLED === 'true') {
  app.use('/api/', limiter);
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(pinoHttp({ logger }));
app.use(requestLogger);

// ========== ROUTES ==========

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);

// ========== ERROR HANDLING ==========

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.use(errorHandler);

// ========== SERVER START ==========

const server = app.listen(PORT, () => {
  logger.info(`🚀 FiscX Backend running on port ${PORT} [${NODE_ENV}]`);
  logger.info(`📊 Environment: ${NODE_ENV}`);
  logger.info(`🔐 API URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
