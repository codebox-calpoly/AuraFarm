import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend/ first, then project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import logger from './utils/logger';
import rateLimiter from './middleware/rateLimiter';


// Import routes
import authRoutes from './routes/auth.routes';
import challengesRoutes from './routes/challenges.routes';
import completionsRoutes from './routes/completions.routes';
import flagsRoutes from './routes/flags.routes';
import usersRoutes from './routes/users.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', rateLimiter.publicLimiter, challengesRoutes);
app.use('/api/completions', completionsRoutes);
app.use('/api/flags', flagsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leaderboard', rateLimiter.publicLimiter, leaderboardRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API endpoints available at: http://localhost:${PORT}/api`);
});