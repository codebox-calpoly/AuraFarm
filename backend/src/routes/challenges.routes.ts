import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getChallenges,
  getChallengeById,
  createChallenge,
  getNearbyChallenges,
} from '../controllers/challenges.controller';
import { validateBody, validateQuery } from '../middleware/validate';
import { validateParams } from '../middleware/validateParams';
import {
  createChallengeSchema,
  queryParamsSchema,
  challengeIdParamSchema,
  nearbyChallengesQuerySchema,
} from '../types';

const router = Router();

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: Get all challenges
 *     tags: [Challenges]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty
 *     responses:
 *       200:
 *         description: List of challenges
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
 *                     $ref: '#/components/schemas/ChallengeWithCompletions'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  validateQuery(queryParamsSchema),
  getChallenges
);

/**
 * @swagger
 * /challenges/nearby:
 *   get:
 *     summary: Get nearby challenges
 *     tags: [Challenges]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: User latitude
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: User longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in meters (default 5000)
 *     responses:
 *       200:
 *         description: List of nearby challenges
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
 *                     $ref: '#/components/schemas/ChallengeWithDistance'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/nearby',
  validateQuery(nearbyChallengesQuerySchema),
  getNearbyChallenges
);

/**
 * @swagger
 * /challenges/{id}:
 *   get:
 *     summary: Get challenge by ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Challenge'
 *       404:
 *         description: Challenge not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  validateParams(challengeIdParamSchema),
  getChallengeById
);

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: Create a new challenge
 *     tags: [Challenges]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChallenge'
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Challenge'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post(
  '/',
  validateBody(createChallengeSchema),
  authenticate,
  requireAdmin,
  createChallenge
);

export default router;
