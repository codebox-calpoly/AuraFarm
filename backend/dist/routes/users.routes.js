"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const validate_1 = require("../middleware/validate");
const validateParams_1 = require("../middleware/validateParams");
const types_1 = require("../types");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private (TODO: Add auth middleware)
 */
router.get('/me', users_controller_1.getCurrentUser);
/**
 * @route   PATCH /api/users/me
 * @desc    Update current user's profile
 * @access  Private (TODO: Add auth middleware)
 */
router.patch('/me', (0, validate_1.validateBody)(types_1.updateUserSchema), users_controller_1.updateCurrentUser);
/**
 * @route   GET /api/users/:id/completions
 * @desc    Get all completions for a specific user
 * @access  Private (TODO: Add auth middleware)
 */
router.get('/:id/completions', (0, validateParams_1.validateParams)(types_1.userIdParamSchema), users_controller_1.getUserCompletions);
/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
router.get('/:id', (0, validateParams_1.validateParams)(types_1.userIdParamSchema), users_controller_1.getUserById);
exports.default = router;
