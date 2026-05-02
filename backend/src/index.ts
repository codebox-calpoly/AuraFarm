import app from './app';
import logger from './utils/logger';

// Local-dev / non-Vercel entrypoint. On Vercel, `api/index.ts` imports the
// Express `app` directly and Vercel runs it as a serverless function — so this
// listen() must NOT execute there.
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
    logger.info(`API endpoints available at: http://localhost:${PORT}/api`);
  });
}

export default app;
