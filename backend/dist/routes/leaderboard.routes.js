"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
const validate_1 = require("../middleware/validate");
const types_1 = require("../types");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/leaderboard
 * @desc    Get leaderboard sorted by aura points
 * @access  Public
 */
router.get('/', (0, validate_1.validateQuery)(types_1.queryParamsSchema), leaderboard_controller_1.getLeaderboard);
exports.default = router;
