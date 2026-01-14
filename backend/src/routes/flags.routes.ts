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
 * @swagger
 * /flags:
 *   post:
 *     summary: Flag a completion
 *     tags: [Flags]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFlag'
 *     responses:
 *       201:
 *         description: Flag created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Flag'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  rateLimiter.flagLimiter,
  validateBody(createFlagSchema),
  flagCompletion
);

/**
 * @swagger
 * /flags:
 *   get:
 *     summary: Get all flags (Admin)
 *     tags: [Flags]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of flags
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
 *                     $ref: '#/components/schemas/Flag'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, requireAdmin, getFlags);

export default router;
