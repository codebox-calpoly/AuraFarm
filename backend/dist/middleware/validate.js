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
            req.query = schema.parse(req.query);
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
exports.validateQuery = validateQuery;
