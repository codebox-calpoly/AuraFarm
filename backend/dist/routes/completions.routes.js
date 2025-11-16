"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const completions_controller_1 = require("../controllers/completions.controller");
const validate_1 = require("../middleware/validate");
const validateParams_1 = require("../middleware/validateParams");
const types_1 = require("../types");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/completions
 * @desc    Submit a challenge completion
 * @access  Private (TODO: Add auth middleware)
 */
router.post('/', (0, validate_1.validateBody)(types_1.createCompletionSchema), completions_controller_1.completeChallenge);
/**
 * @route   GET /api/completions/:id
 * @desc    Get a specific completion by ID
 * @access  Public
 */
router.get('/:id', (0, validateParams_1.validateParams)(types_1.completionIdParamSchema), completions_controller_1.getCompletionById);
exports.default = router;
