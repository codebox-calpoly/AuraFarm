import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Request logging middleware
 * Logs method, path, query params, and response time
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const { method, path, query, ip } = req;

  // Log incoming request
  logger.info(`Incoming ${method} ${path}`, {
    method,
    url: path,
    query: Object.keys(query).length > 0 ? query : undefined,
    ip,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Log completion with appropriate level
    const message = `Completed ${method} ${path} ${statusCode} - ${duration}ms`;
    const meta = {
      method,
      url: path,
      statusCode,
      duration,
      userId: req.user?.id,
    };

    if (statusCode >= 500) {
      logger.error(message, meta);
    } else if (statusCode >= 400) {
      logger.warn(message, meta);
    } else {
      logger.info(message, meta);
    }
  });

  next();
};

