"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'info';
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
// Development format: Pretty-print (colorized) output
const devFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Production format: JSON format with timestamp, level, and service name
const prodFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json());
const logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format: process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
    defaultMeta: { service: 'aura-farm-backend' },
    transports: [
        new winston_1.default.transports.Console(),
    ],
});
exports.default = logger;
