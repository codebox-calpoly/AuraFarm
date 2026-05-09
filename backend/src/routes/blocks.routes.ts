import { Router } from 'express';
import { blockUser, unblockUser, listBlocks } from '../controllers/blocks.controller';
import rateLimiter from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createBlockSchema } from '../types';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /blocks:
 *   get:
 *     summary: List the users I have blocked
 *     tags: [Blocks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of blocks
 *       401:
 *         description: Unauthorized
 */
router.get('/', listBlocks);

/**
 * @swagger
 * /blocks:
 *   post:
 *     summary: Block another user
 *     description: |
 *       Blocking another user hides their content from your feed instantly,
 *       prevents you from appearing in their feed, removes any existing friendship,
 *       and sends a moderation notification email to the developer with the
 *       reason and (optional) offending completion id.
 *     tags: [Blocks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [blockedUserId]
 *             properties:
 *               blockedUserId:
 *                 type: integer
 *               reason:
 *                 type: string
 *               reportedCompletionId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User blocked
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post(
  '/',
  rateLimiter.flagLimiter,
  validateBody(createBlockSchema),
  blockUser,
);

/**
 * @swagger
 * /blocks/{blockedUserId}:
 *   delete:
 *     summary: Unblock a user
 *     tags: [Blocks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockedUserId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User unblocked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not currently blocked
 */
router.delete('/:blockedUserId', unblockUser);

export default router;
