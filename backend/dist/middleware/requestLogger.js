"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Request logging middleware
 * Logs method, path, query params, and response time
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, path, query, ip } = req;
    // Log incoming request
    logger_1.default.info(`Incoming ${method} ${path}`, {
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
            logger_1.default.error(message, meta);
        }
        else if (statusCode >= 400) {
            logger_1.default.warn(message, meta);
        }
        else {
            logger_1.default.info(message, meta);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
