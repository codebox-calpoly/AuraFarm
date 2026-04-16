"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const completions_controller_1 = require("../controllers/completions.controller");
const validate_1 = require("../middleware/validate");
const validateParams_1 = require("../middleware/validateParams");
const types_1 = require("../types");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = __importDefault(require("../middleware/rateLimiter"));
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, rateLimiter_1.default.completionLimiter, (0, validate_1.validateBody)(types_1.createCompletionSchema), completions_controller_1.completeChallenge);
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
router.get('/', auth_1.optionalAuthenticate, (0, validate_1.validateQuery)(types_1.completionsListQuerySchema), completions_controller_1.getCompletions);
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
router.patch('/:id/review', auth_1.authenticate, auth_1.requireAdmin, (0, validateParams_1.validateParams)(types_1.completionIdParamSchema), (0, validate_1.validateBody)(types_1.reviewCompletionSchema), completions_controller_1.reviewChallengeCompletion);
router.get('/:id', auth_1.optionalAuthenticate, (0, validateParams_1.validateParams)(types_1.completionIdParamSchema), completions_controller_1.getCompletionById);
router.patch('/:id', auth_1.authenticate, (0, validateParams_1.validateParams)(types_1.completionIdParamSchema), (0, validate_1.validateBody)(types_1.updateCompletionSchema), completions_controller_1.updateCompletion);
router.post('/:id/like', auth_1.authenticate, (0, validateParams_1.validateParams)(types_1.completionIdParamSchema), completions_controller_1.likeCompletion);
router.delete('/:id/like', auth_1.authenticate, (0, validateParams_1.validateParams)(types_1.completionIdParamSchema), completions_controller_1.unlikeCompletion);
exports.default = router;
