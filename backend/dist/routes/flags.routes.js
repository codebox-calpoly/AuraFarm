"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flags_controller_1 = require("../controllers/flags.controller");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/flags
 * @desc    Flag a challenge completion
 * @access  Private
 */
router.post('/', (0, validate_1.validateBody)(types_1.createFlagSchema), flags_controller_1.flagCompletion);
/**
 * @route   GET /api/flags
 * @desc    Get all flags
 * @access  Admin
 */
router.get('/', auth_1.authenticate, auth_1.requireAdmin, flags_controller_1.getFlags);
exports.default = router;
