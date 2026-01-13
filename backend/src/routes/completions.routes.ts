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
 * @swagger
 * /completions:
 *   post:
 *     summary: Submit a completion
 *     tags: [Completions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompletion'
 *     responses:
 *       201:
 *         description: Completion submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChallengeCompletion'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  rateLimiter.completionLimiter,
  validateBody(createCompletionSchema),
  completeChallenge
);

/**
 * @swagger
 * /completions/{id}:
 *   get:
 *     summary: Get completion by ID
 *     tags: [Completions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Completion ID
 *     responses:
 *       200:
 *         description: Completion details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChallengeCompletion'
 *       404:
 *         description: Completion not found
 */
router.get(
  '/:id',
  validateParams(completionIdParamSchema),
  getCompletionById
);

export default router;
