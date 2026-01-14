"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletionById = exports.completeChallenge = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const geo_1 = require("../utils/geo");
const date_1 = require("../utils/date");
/**
 * POST /api/completions
 * Submit a challenge completion
 */
exports.completeChallenge = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { challengeId, latitude, longitude } = req.body;
    if (!challengeId || isNaN(Number(challengeId))) {
        throw new errorHandler_1.AppError('Invalid challenge ID', 400);
    }
    // Get userId from authentication middleware
    if (!req.user) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    const userId = req.user.id;
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
        /**
         * Calendar-Based Streak Logic
         *
         * Streaks are calculated based on calendar days (UTC) to ensure consistency:
         *
         * 1. First completion ever: streak = 1
         * 2. Same calendar day: streak remains unchanged (multiple completions per day don't increase streak)
         * 3. Consecutive day (yesterday): streak increments by 1
         * 4. Gap of 2+ days: streak resets to 1 (user missed at least one day)
         *
         * All dates are normalized to UTC to avoid timezone boundary issues.
         * The streak represents consecutive calendar days with at least one completion.
         */
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const now = new Date();
        const lastCompleted = user.lastCompletedAt;
        let newStreak;
        if (lastCompleted === null) {
            newStreak = 1;
        }
        else if ((0, date_1.isSameCalendarDay)(now, lastCompleted)) {
            newStreak = user.streak;
        }
        else if ((0, date_1.isConsecutiveDay)(lastCompleted, now)) {
            newStreak = user.streak + 1;
        }
        else {
            newStreak = 1;
        }
        await tx.user.update({
            where: { id: userId },
            data: {
                auraPoints: { increment: challenge.pointsReward },
                streak: newStreak, // Use calculated value, not increment
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
