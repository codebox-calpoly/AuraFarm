import { Router } from 'express';
import {
  flagCompletion,
  getFlags,
} from '../controllers/flags.controller';
import { validateBody } from '../middleware/validate';
import { createFlagSchema } from '../types';

const router = Router();

/**
 * @route   POST /api/flags
 * @desc    Flag a challenge completion
 * @access  Private (TODO: Add auth middleware)
 */
router.post(
  '/',
  validateBody(createFlagSchema),
  flagCompletion
);

/**
 * @route   GET /api/flags
 * @desc    Get all flags
 * @access  Admin (TODO: Add auth middleware)
 */
router.get('/', getFlags);

export default router;

