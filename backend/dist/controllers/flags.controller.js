"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlags = exports.flagCompletion = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
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
    // Verify completion exists
    const completion = await prisma_1.prisma.challengeCompletion.findUnique({
        where: { id: completionId },
    });
    if (!completion) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    // Prevent users from flagging their own completions
    if (completion.userId === flaggedById) {
        throw new errorHandler_1.AppError('You cannot flag your own completion', 400);
    }
    // Check if user already flagged this completion
    const existingFlag = await prisma_1.prisma.flag.findFirst({
        where: {
            completionId,
            flaggedById,
        },
    });
    if (existingFlag) {
        throw new errorHandler_1.AppError('You have already flagged this completion', 409);
    }
    const newFlag = await prisma_1.prisma.flag.create({
        data: {
            completionId,
            flaggedById,
            reason: reason || null,
        },
    });
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
    const flags = await prisma_1.prisma.flag.findMany();
    const response = {
        success: true,
        data: flags,
    };
    res.json(response);
});
