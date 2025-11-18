"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("./errorHandler");
// Helper to validate only params
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                next(error);
            }
            else {
                next(new errorHandler_1.AppError('Invalid parameters', 400));
            }
        }
    };
};
exports.validateParams = validateParams;
