"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletionById = exports.completeChallenge = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
// Mock data - will be replaced with Prisma queries once database is connected
const mockCompletions = [
    {
        id: 1,
        userId: 1,
        challengeId: 1,
        latitude: 37.7749,
        longitude: -122.4194,
        completedAt: new Date('2024-01-20'),
    },
];
/**
 * POST /api/completions
 * Submit a challenge completion
 */
exports.completeChallenge = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { challengeId, latitude, longitude } = req.body;
    if (!challengeId || isNaN(Number(challengeId))) {
        throw new errorHandler_1.AppError('Invalid challenge ID', 400);
    }
    // TODO: Get userId from authentication middleware
    const userId = 1; // Placeholder
    // TODO: Verify challenge exists
    // TODO: Check if user already completed this challenge
    // TODO: Verify location is within acceptable range of challenge location
    const newCompletion = {
        id: mockCompletions.length + 1,
        userId,
        challengeId,
        latitude,
        longitude,
        completedAt: new Date(),
    };
    mockCompletions.push(newCompletion);
    // TODO: Update user's auraPoints and streak
    // TODO: Return updated user stats
    const response = {
        success: true,
        data: newCompletion,
        message: 'Challenge completed successfully!',
    };
    res.status(201).json(response);
});
/**
 * GET /api/completions/:id
 * Get a specific completion by ID
 */
exports.getCompletionById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const completionId = parseInt(id);
    if (isNaN(completionId)) {
        throw new errorHandler_1.AppError('Invalid completion ID', 400);
    }
    const completion = mockCompletions.find(c => c.id === completionId);
    if (!completion) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    const response = {
        success: true,
        data: completion,
    };
    res.json(response);
});
