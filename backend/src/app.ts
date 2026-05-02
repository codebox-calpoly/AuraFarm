import dotenv from 'dotenv';
import path from 'path';

// Local dev: load .env from repo root. On Vercel, env vars come from the dashboard
// and there is no .env in the deployed bundle, so this is a no-op there.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import rateLimiter from './middleware/rateLimiter';

import authRoutes from './routes/auth.routes';
import challengesRoutes from './routes/challenges.routes';
import completionsRoutes from './routes/completions.routes';
import flagsRoutes from './routes/flags.routes';
import usersRoutes from './routes/users.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import uploadRoutes from './routes/upload.routes';
import friendsRoutes from './routes/friends.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Trust Vercel/proxy headers so req.ip and X-Forwarded-* work for rate limiting.
app.set('trust proxy', 1);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    commit:
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.RAILWAY_GIT_COMMIT_SHA ??
      null,
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/challenges', rateLimiter.publicLimiter, challengesRoutes);
app.use('/api/completions', completionsRoutes);
app.use('/api/flags', flagsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/leaderboard', rateLimiter.publicLimiter, leaderboardRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
