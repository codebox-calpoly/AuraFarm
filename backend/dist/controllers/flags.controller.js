"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlags = exports.flagCompletion = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
// Mock data - will be replaced with Prisma queries once database is connected
const mockFlags = [];
/**
 * POST /api/flags
 * Flag a challenge completion
 */
exports.flagCompletion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { completionId, reason } = req.body;
    if (!completionId || isNaN(Number(completionId))) {
        throw new errorHandler_1.AppError('Invalid completion ID', 400);
    }
    // TODO: Get userId from authentication middleware
    const flaggedById = 1; // Placeholder
    // TODO: Verify completion exists
    // TODO: Check if user already flagged this completion
    // TODO: Prevent users from flagging their own completions
    const newFlag = {
        id: mockFlags.length + 1,
        completionId,
        flaggedById,
        reason: reason || null,
        createdAt: new Date(),
    };
    mockFlags.push(newFlag);
    const response = {
        success: true,
        data: newFlag,
        message: 'Completion flagged successfully',
    };
    res.status(201).json(response);
});
/**
 * GET /api/flags
 * Get all flags (admin only - placeholder)
 */
exports.getFlags = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Add authentication middleware to check admin role
    const response = {
        success: true,
        data: mockFlags,
    };
    res.json(response);
});
