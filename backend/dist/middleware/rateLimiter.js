"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flagLimiter = exports.completionLimiter = exports.authLimiter = exports.publicLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const toInt = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};
const RATE_BY = process.env.RATE_LIMIT_BY || 'ip'; // 'ip' or 'user'
const keyGenerator = (req) => {
    if (RATE_BY === 'user' && req.user && req.user.id)
        return String(req.user.id);
    return req.ip;
};
exports.publicLimiter = (0, express_rate_limit_1.default)({
    windowMs: toInt(process.env.RL_PUBLIC_WINDOW_MINUTES, 15) * 60 * 1000,
    max: toInt(process.env.RL_PUBLIC_MAX, 100),
    keyGenerator,
    legacyHeaders: true, // X-RateLimit-* headers
    standardHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many requests, please try again later.' });
    },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: toInt(process.env.RL_AUTH_WINDOW_MINUTES, 15) * 60 * 1000,
    max: toInt(process.env.RL_AUTH_MAX, 5),
    keyGenerator,
    legacyHeaders: true,
    standardHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many authentication attempts, please try again later.' });
    },
});
exports.completionLimiter = (0, express_rate_limit_1.default)({
    windowMs: toInt(process.env.RL_COMPLETION_WINDOW_HOURS, 1) * 60 * 60 * 1000,
    max: toInt(process.env.RL_COMPLETION_MAX, 10),
    keyGenerator,
    legacyHeaders: true,
    standardHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many completion submissions, please try again later.' });
    },
});
exports.flagLimiter = (0, express_rate_limit_1.default)({
    windowMs: toInt(process.env.RL_FLAG_WINDOW_HOURS, 1) * 60 * 60 * 1000,
    max: toInt(process.env.RL_FLAG_MAX, 5),
    keyGenerator,
    legacyHeaders: true,
    standardHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ message: 'Too many flag submissions, please try again later.' });
    },
});
exports.default = {
    publicLimiter: exports.publicLimiter,
    authLimiter: exports.authLimiter,
    completionLimiter: exports.completionLimiter,
    flagLimiter: exports.flagLimiter,
};
