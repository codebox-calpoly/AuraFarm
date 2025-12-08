import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getChallenges,
  getChallengeById,
  createChallenge,
} from '../controllers/challenges.controller';
import { validateBody, validateQuery } from '../middleware/validate';
import { validateParams } from '../middleware/validateParams';
import {
  createChallengeSchema,
  queryParamsSchema,
  challengeIdParamSchema,
} from '../types';

const router = Router();

/**
 * @route   GET /api/challenges
 * @desc    Get all challenges with optional filtering
 * @access  Public
 */
router.get(
  '/',
  validateQuery(queryParamsSchema),
  getChallenges
);

/**
 * @route   GET /api/challenges/:id
 * @desc    Get a specific challenge by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateParams(challengeIdParamSchema),
  getChallengeById
);

/**
 * @route   POST /api/challenges
 * @desc    Create a new challenge
 * @access  Admin
 */
router.post(
  '/',
  validateBody(createChallengeSchema),
  authenticate,
  requireAdmin,
  createChallenge
);

export default router;

