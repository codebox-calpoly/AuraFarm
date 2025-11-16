import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

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
      req.query = schema.parse(req.query) as typeof req.query;
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

