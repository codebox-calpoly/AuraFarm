import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../types';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any = undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
  // Handle custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Prisma errors (when database is connected)
  else if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    // Handle unique constraint violations
    if (prismaError.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this value already exists';
      errors = [{ field: prismaError.meta?.target, message }];
    }
    // Handle record not found
    else if (prismaError.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    }
    // Handle foreign key constraint violations
    else if (prismaError.code === 'P2003') {
      statusCode = 400;
      message = 'Invalid reference to related record';
    }
    // Handle other Prisma errors
    else {
      statusCode = 400;
      message = 'Database error occurred';
    }
  }
  // Handle other errors
  else {
    message = err.message || message;
  }

  const response: ApiResponse<null> = {
    success: false,
    error: message,
    ...(errors && { errors }),
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

