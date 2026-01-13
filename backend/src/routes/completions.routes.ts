import { Router } from 'express';
import {
  completeChallenge,
  getCompletionById,
} from '../controllers/completions.controller';
import rateLimiter from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { validateParams } from '../middleware/validateParams';
import {
  createCompletionSchema,
  completionIdParamSchema,
} from '../types';

const router = Router();

/**
 * @route   POST /api/completions
 * @desc    Submit a challenge completion
 * @access  Private (TODO: Add auth middleware)
 */
router.post(
  '/',
  rateLimiter.completionLimiter,
  validateBody(createCompletionSchema),
  completeChallenge
);

/**
 * @route   GET /api/completions/:id
 * @desc    Get a specific completion by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateParams(completionIdParamSchema),
  getCompletionById
);

export default router;

