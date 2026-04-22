import { Router } from 'express';
import {
  getUserById,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getUserCompletions,
  getUserStats,
  searchUsers,
} from '../controllers/users.controller';
import { validateBody, validateQuery } from '../middleware/validate';
import { validateParams } from '../middleware/validateParams';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import {
  updateUserSchema,
  userIdParamSchema,
  userSearchQuerySchema,
} from '../types';

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getCurrentUser);

router.get('/search', authenticate, validateQuery(userSearchQuerySchema), searchUsers);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/me',
  authenticate,
  validateBody(updateUserSchema),
  updateCurrentUser
);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Permanently delete the authenticated user's account and all associated data
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/me', authenticate, deleteCurrentUser);

/**
 * @swagger
 * /users/{id}/completions:
 *   get:
 *     summary: Get user completions
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User completions
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
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 */
router.get(
  '/:id/completions',
  optionalAuthenticate,
  validateParams(userIdParamSchema),
  getUserCompletions
);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics
 * @access  Public
 */
router.get(
  '/:id/stats',
  validateParams(userIdParamSchema),
  getUserStats
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  optionalAuthenticate,
  validateParams(userIdParamSchema),
  getUserById
);

export default router;
