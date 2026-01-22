import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';
import logger from '../utils/logger';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body, query, and params
      const data = {
        ...(req.body || {}),
        ...(req.query || {}),
        ...(req.params || {}),
      };

      const validated = schema.parse(data) as Record<string, any>;

      // Replace request data with validated data
      req.body = { ...(req.body || {}), ...validated };
      req.query = { ...(req.query || {}), ...validated } as typeof req.query;
      req.params = { ...(req.params || {}), ...validated } as typeof req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new AppError('Validation failed', 400));
      }
    }
  };
};

// Helper to validate only body
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as typeof req.body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new AppError('Validation failed', 400));
      }
    }
  };
};

// Helper to validate only query params
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert all query params to strings (Express query params are strings)
      const queryData: Record<string, any> = {};

      for (const [key, value] of Object.entries(req.query)) {
        if (value !== undefined && value !== null) {
          queryData[key] = String(value);
        }
      }

      // Debug logging
      logger.debug('Validating query:', { queryData });

      const validated = schema.parse(queryData) as Record<string, any>;

      // Clear and repopulate req.query
      Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
      Object.keys(validated).forEach(key => {
        (req.query as any)[key] = validated[key];
      });

      next();
    } catch (error: any) {
      // Log all errors (debug level)
      logger.debug('Validation error', {
        type: error?.constructor?.name,
        error: error,
        zodIssues: error instanceof ZodError ? error.issues : undefined,
        query: req.query
      });

      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new AppError(`Validation failed: ${error?.message || 'Unknown error'}`, 400));
      }
    }
  };
};

