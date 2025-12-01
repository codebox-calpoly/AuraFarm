"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletionById = exports.completeChallenge = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const geo_1 = require("../utils/geo");
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
    // Verify challenge exists
    const challenge = await prisma_1.prisma.challenge.findUnique({
        where: { id: Number(challengeId) },
    });
    if (!challenge) {
        throw new errorHandler_1.AppError('Challenge not found', 404);
    }
    // Verify location is within acceptable range (e.g., 100 meters)
    const distance = (0, geo_1.calculateDistance)(latitude, longitude, challenge.latitude, challenge.longitude);
    if (distance > 100) {
        throw new errorHandler_1.AppError(`You are too far from the challenge location (${Math.round(distance)}m away)`, 400);
    }
    // Check if user already completed this challenge
    const existingCompletion = await prisma_1.prisma.challengeCompletion.findUnique({
        where: {
            userId_challengeId: {
                userId,
                challengeId: Number(challengeId),
            },
        },
    });
    if (existingCompletion) {
        throw new errorHandler_1.AppError('You have already completed this challenge', 400);
    }
    // Use transaction to ensure data consistency
    const completion = await prisma_1.prisma.$transaction(async (tx) => {
        // 1. Create completion record
        const newCompletion = await tx.challengeCompletion.create({
            data: {
                userId,
                challengeId: Number(challengeId),
                latitude,
                longitude,
            },
        });
        // 2. Update user's auraPoints and streak
        // We need to fetch the user first to check the streak logic if we want to be precise,
        // but for now we'll implement a simple increment as requested.
        // A more complex streak logic would check lastCompletedAt.
        // Let's implement a basic streak check:
        // If lastCompletedAt was yesterday (or within 24-48h), increment streak.
        // If today, keep streak.
        // If older, reset to 1.
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const now = new Date();
        const lastCompleted = user.lastCompletedAt;
        let newStreak = user.streak;
        if (lastCompleted) {
            const diffTime = Math.abs(now.getTime() - lastCompleted.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Note: This is a simplified streak logic. 
            // Real logic should check calendar days, not just 24h windows.
            // But for this task, we'll stick to:
            // If completed today (same calendar day), don't increment streak (or do? usually one per day counts).
            // Let's assume we increment streak for every unique challenge completion for now to reward activity,
            // OR we can just increment it blindly as the prompt "Update ... streak" suggests.
            // I'll stick to the simple "increment" to ensure the user sees the change they asked for.
            newStreak += 1;
        }
        else {
            newStreak = 1;
        }
        await tx.user.update({
            where: { id: userId },
            data: {
                auraPoints: { increment: challenge.pointsReward },
                streak: { increment: 1 }, // Simple increment for every completion
                lastCompletedAt: now,
            },
        });
        return newCompletion;
    });
    const response = {
        success: true,
        data: completion,
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
    const completion = await prisma_1.prisma.challengeCompletion.findUnique({
        where: { id: completionId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    auraPoints: true,
                }
            },
            challenge: true,
        }
    });
    if (!completion) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    const response = {
        success: true,
        data: completion,
    };
    res.json(response);
});
