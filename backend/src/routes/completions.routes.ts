import { Router } from 'express';
import {
  completeChallenge,
  getCompletionById,
  getCompletions,
  updateCompletion,
  likeCompletion,
  unlikeCompletion,
  reviewChallengeCompletion,
} from '../controllers/completions.controller';
import { validateBody, validate, validateQuery } from '../middleware/validate';
import { validateParams } from '../middleware/validateParams';
import {
  createCompletionSchema,
  updateCompletionSchema,
  reviewCompletionSchema,
  completionIdParamSchema,
  completionsListQuerySchema,
} from '../types';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middleware/auth';
import rateLimiter from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/',
  authenticate,
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
  optionalAuthenticate,
  validateQuery(completionsListQuerySchema),
  getCompletions
);

/**
 * @swagger
 * /completions/{id}/review:
 *   patch:
 *     summary: Approve or reject a completion (admin)
 *     tags: [Completions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCompletion'
 *     responses:
 *       200:
 *         description: Updated completion
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch(
  '/:id/review',
  authenticate,
  requireAdmin,
  validateParams(completionIdParamSchema),
  validateBody(reviewCompletionSchema),
  reviewChallengeCompletion
);

router.get(
  '/:id',
  optionalAuthenticate,
  validateParams(completionIdParamSchema),
  getCompletionById
);

router.patch(
  '/:id',
  authenticate,
  validateParams(completionIdParamSchema),
  validateBody(updateCompletionSchema),
  updateCompletion
);

router.post(
  '/:id/like',
  authenticate,
  validateParams(completionIdParamSchema),
  likeCompletion
);

router.delete(
  '/:id/like',
  authenticate,
  validateParams(completionIdParamSchema),
  unlikeCompletion
);

export default router;
