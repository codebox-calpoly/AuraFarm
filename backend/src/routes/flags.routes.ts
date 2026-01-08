import { Router } from 'express';
import {
  flagCompletion,
  getFlags,
} from '../controllers/flags.controller';
import rateLimiter from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { createFlagSchema } from '../types';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/flags
 * @desc    Flag a challenge completion
 * @access  Private
 */
router.post(
  '/',
  rateLimiter.flagLimiter,
  validateBody(createFlagSchema),
  flagCompletion
);

/**
 * @route   GET /api/flags
 * @desc    Get all flags
 * @access  Admin
 */
router.get('/', authenticate, requireAdmin, getFlags);

export default router;

