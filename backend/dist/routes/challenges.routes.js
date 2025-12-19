"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const challenges_controller_1 = require("../controllers/challenges.controller");
const validate_1 = require("../middleware/validate");
const validateParams_1 = require("../middleware/validateParams");
const types_1 = require("../types");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/challenges
 * @desc    Get all challenges with optional filtering
 * @access  Public
 */
router.get('/', (0, validate_1.validateQuery)(types_1.queryParamsSchema), challenges_controller_1.getChallenges);
/**
 * @route   GET /api/challenges/nearby
 * @desc    Get challenges within a specified radius of user's location
 * @access  Public
 */
router.get('/nearby', (0, validate_1.validateQuery)(types_1.nearbyChallengesQuerySchema), challenges_controller_1.getNearbyChallenges);
/**
 * @route   GET /api/challenges/:id
 * @desc    Get a specific challenge by ID
 * @access  Public
 */
router.get('/:id', (0, validateParams_1.validateParams)(types_1.challengeIdParamSchema), challenges_controller_1.getChallengeById);
/**
 * @route   POST /api/challenges
 * @desc    Create a new challenge
 * @access  Admin
 */
router.post('/', (0, validate_1.validateBody)(types_1.createChallengeSchema), auth_1.authenticate, auth_1.requireAdmin, challenges_controller_1.createChallenge);
exports.default = router;
