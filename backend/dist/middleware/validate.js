"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("./errorHandler");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Validate body, query, and params
            const data = {
                ...(req.body || {}),
                ...(req.query || {}),
                ...(req.params || {}),
            };
            const validated = schema.parse(data);
            // Replace request data with validated data
            req.body = { ...(req.body || {}), ...validated };
            req.query = { ...(req.query || {}), ...validated };
            req.params = { ...(req.params || {}), ...validated };
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                next(error);
            }
            else {
                next(new errorHandler_1.AppError('Validation failed', 400));
            }
        }
    };
};
exports.validate = validate;
// Helper to validate only body
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                next(error);
            }
            else {
                next(new errorHandler_1.AppError('Validation failed', 400));
            }
        }
    };
};
exports.validateBody = validateBody;
// Helper to validate only query params
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            // Convert all query params to strings (Express query params are strings)
            const queryData = {};
            for (const [key, value] of Object.entries(req.query)) {
                if (value !== undefined && value !== null) {
                    queryData[key] = String(value);
                }
            }
            // Debug logging
            if (process.env.NODE_ENV === 'development') {
                console.log('Validating query:', queryData);
            }
            const validated = schema.parse(queryData);
            // Clear and repopulate req.query
            Object.keys(req.query).forEach(key => delete req.query[key]);
            Object.keys(validated).forEach(key => {
                req.query[key] = validated[key];
            });
            next();
        }
        catch (error) {
            // Log all errors in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Validation error type:', error?.constructor?.name);
                console.error('Validation error:', error);
                if (error instanceof zod_1.ZodError) {
                    console.error('Zod issues:', JSON.stringify(error.issues, null, 2));
                }
                console.error('Query received:', req.query);
            }
            if (error instanceof zod_1.ZodError) {
                next(error);
            }
            else {
                next(new errorHandler_1.AppError(`Validation failed: ${error?.message || 'Unknown error'}`, 400));
            }
        }
    };
};
exports.validateQuery = validateQuery;
