"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const completions_controller_1 = require("../controllers/completions.controller");
const rateLimiter_1 = __importDefault(require("../middleware/rateLimiter"));
const validate_1 = require("../middleware/validate");
const validateParams_1 = require("../middleware/validateParams");
const types_1 = require("../types");
const router = (0, express_1.Router)();
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
router.post('/', rateLimiter_1.default.completionLimiter, (0, validate_1.validateBody)(types_1.createCompletionSchema), completions_controller_1.completeChallenge);
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
router.get('/:id', (0, validateParams_1.validateParams)(types_1.completionIdParamSchema), completions_controller_1.getCompletionById);
exports.default = router;
