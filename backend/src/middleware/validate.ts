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
    // Merge with defaults for common query params
    const pageValue = req.query.page ? String(req.query.page) : '1';
    const limitValue = req.query.limit ? String(req.query.limit) : '20';
    
    const queryWithDefaults: Record<string, any> = {
      page: pageValue,
      limit: limitValue,
    };
    
    // Add optional query params if they exist
    if (req.query.difficulty) {
      queryWithDefaults.difficulty = String(req.query.difficulty);
    }
    
    try {
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Validating query:', queryWithDefaults);
      }
      
      const validated = schema.parse(queryWithDefaults) as Record<string, any>;
      // Clear and repopulate req.query (Express 5 has read-only query property)
      // Delete existing properties first
      Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
      // Then assign validated values
      Object.keys(validated).forEach(key => {
        (req.query as any)[key] = validated[key];
      });
      next();
    } catch (error: any) {
      // Log all errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation error type:', error?.constructor?.name);
        console.error('Validation error:', error);
        if (error instanceof ZodError) {
          console.error('Zod issues:', JSON.stringify(error.issues, null, 2));
        }
        console.error('Query received:', req.query);
        console.error('Query with defaults:', queryWithDefaults);
      }
      
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(new AppError(`Validation failed: ${error?.message || 'Unknown error'}`, 400));
      }
    }
  };
};

