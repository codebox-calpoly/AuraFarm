"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flags_controller_1 = require("../controllers/flags.controller");
const rateLimiter_1 = __importDefault(require("../middleware/rateLimiter"));
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
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
router.post('/', rateLimiter_1.default.flagLimiter, (0, validate_1.validateBody)(types_1.createFlagSchema), flags_controller_1.flagCompletion);
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
router.get('/', auth_1.authenticate, auth_1.requireAdmin, flags_controller_1.getFlags);
exports.default = router;
