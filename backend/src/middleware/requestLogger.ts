import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware for development
 * Logs method, path, query params, and response time
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now();
    const { method, path, query } = req;

    // Log request
    console.log(`[${new Date().toISOString()}] ${method} ${path}`, {
      query: Object.keys(query).length > 0 ? query : undefined,
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' : '❌';
      console.log(
        `${statusEmoji} ${method} ${path} ${statusCode} - ${duration}ms`
      );
    });
  }

  next();
};

