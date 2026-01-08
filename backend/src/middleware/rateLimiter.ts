import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

const toInt = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const RATE_BY = process.env.RATE_LIMIT_BY || 'ip'; // 'ip' or 'user'

const keyGenerator = (req: any) => {
  if (RATE_BY === 'user' && req.user && req.user.id) return String(req.user.id);
  return req.ip;
};

export const publicLimiter: RequestHandler = rateLimit({
  windowMs: toInt(process.env.RL_PUBLIC_WINDOW_MINUTES, 15) * 60 * 1000,
  max: toInt(process.env.RL_PUBLIC_MAX, 100),
  keyGenerator,
  legacyHeaders: true, // X-RateLimit-* headers
  standardHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  },
});

export const authLimiter: RequestHandler = rateLimit({
  windowMs: toInt(process.env.RL_AUTH_WINDOW_MINUTES, 15) * 60 * 1000,
  max: toInt(process.env.RL_AUTH_MAX, 5),
  keyGenerator,
  legacyHeaders: true,
  standardHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many authentication attempts, please try again later.' });
  },
});

export const completionLimiter: RequestHandler = rateLimit({
  windowMs: toInt(process.env.RL_COMPLETION_WINDOW_HOURS, 1) * 60 * 60 * 1000,
  max: toInt(process.env.RL_COMPLETION_MAX, 10),
  keyGenerator,
  legacyHeaders: true,
  standardHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many completion submissions, please try again later.' });
  },
});

export const flagLimiter: RequestHandler = rateLimit({
  windowMs: toInt(process.env.RL_FLAG_WINDOW_HOURS, 1) * 60 * 60 * 1000,
  max: toInt(process.env.RL_FLAG_MAX, 5),
  keyGenerator,
  legacyHeaders: true,
  standardHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many flag submissions, please try again later.' });
  },
});

export default {
  publicLimiter,
  authLimiter,
  completionLimiter,
  flagLimiter,
};
