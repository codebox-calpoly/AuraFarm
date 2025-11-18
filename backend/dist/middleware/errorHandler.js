"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let errors = undefined;
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
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
        const prismaError = err;
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
    const response = {
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
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
