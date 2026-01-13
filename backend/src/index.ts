import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import rateLimiter from './middleware/rateLimiter';


// Import routes
import challengesRoutes from './routes/challenges.routes';
import completionsRoutes from './routes/completions.routes';
import flagsRoutes from './routes/flags.routes';
import usersRoutes from './routes/users.routes';
import leaderboardRoutes from './routes/leaderboard.routes';

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
app.use('/api/challenges', rateLimiter.publicLimiter, challengesRoutes);
app.use('/api/completions', completionsRoutes);
app.use('/api/flags', flagsRoutes);
app.use('/api/users', rateLimiter.authLimiter, usersRoutes);
app.use('/api/leaderboard', rateLimiter.publicLimiter, leaderboardRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API endpoints available at: http://localhost:${PORT}/api`);
});