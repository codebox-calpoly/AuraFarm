import { Router } from 'express';
import {
  completeChallenge,
  getCompletionById,
  getCompletions,
} from '../controllers/completions.controller';
import { validateBody, validate } from '../middleware/validate';
import { validateParams } from '../middleware/validateParams';
import {
  createCompletionSchema,
  completionIdParamSchema,
  completionsListQuerySchema,
} from '../types';
import rateLimiter from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/',
  rateLimiter.completionLimiter,
  validateBody(createCompletionSchema),
  completeChallenge
);

/**
 * @swagger
 * /completions:
 *   get:
 *     summary: Get all completions
 *     tags: [Completions]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: challengeId
 *         schema:
 *           type: integer
 *         description: Filter by challenge ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of completions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChallengeCompletion'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get(
  '/',
  validate(completionsListQuerySchema),
  getCompletions
);

router.get(
  '/:id',
  validateParams(completionIdParamSchema),
  getCompletionById
);

export default router;
