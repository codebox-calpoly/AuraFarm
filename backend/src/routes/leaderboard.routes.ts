import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller';
import { validateQuery } from '../middleware/validate';
import { queryParamsSchema } from '../types';

const router = Router();

/**
 * @route   GET /api/leaderboard
 * @desc    Get leaderboard sorted by aura points
 * @access  Public
 */
router.get(
  '/',
  validateQuery(queryParamsSchema),
  getLeaderboard
);

export default router;

