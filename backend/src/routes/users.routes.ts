import { Router } from 'express';
import {
  getUserById,
  getCurrentUser,
  updateCurrentUser,
  getUserCompletions,
} from '../controllers/users.controller';
import { validateBody } from '../middleware/validate';
import { validateParams } from '../middleware/validateParams';
import {
  updateUserSchema,
  userIdParamSchema,
} from '../types';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private (TODO: Add auth middleware)
 */
router.get('/me', getCurrentUser);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user's profile
 * @access  Private (TODO: Add auth middleware)
 */
router.patch(
  '/me',
  validateBody(updateUserSchema),
  updateCurrentUser
);

/**
 * @route   GET /api/users/:id/completions
 * @desc    Get all completions for a specific user
 * @access  Private (TODO: Add auth middleware)
 */
router.get(
  '/:id/completions',
  validateParams(userIdParamSchema),
  getUserCompletions
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateParams(userIdParamSchema),
  getUserById
);

export default router;

