"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.getUserCompletions = exports.updateCurrentUser = exports.getCurrentUser = exports.getUserById = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
function toUserProfile(user) {
    return {
        ...user,
        role: user.role, // Cast to match enum if needed
        completionsCount: user.completions.length,
    };
}
/**
 * GET /api/users/:id
 * Get user profile by ID
 */
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new errorHandler_1.AppError('Invalid user ID', 400);
    }
    // TODO: Get userId from authentication middleware and verify access
    // TODO: Replace with Prisma query: prisma.user.findUnique({ where: { id: userId }, include: { completions: true } })
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            completions: true, // ChallengeCompletion[]
            // flags: true, // you can include this too if you need it in the profile
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Calculate rank (simplified for now, ideally cached or optimized query)
    // For now, we can omit rank or do a simple count query if strictly needed
    // Let's just return basic profile first
    const userProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // Cast to match enum if needed
        auraPoints: user.auraPoints,
        streak: user.streak,
        lastCompletedAt: user.lastCompletedAt,
        createdAt: user.createdAt,
        completionsCount: user.completions.length,
    };
    const response = {
        success: true,
        data: userProfile,
    };
    res.json(response);
});
/**
 * GET /api/users/me
 * Get current user's profile
 */
exports.getCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Get userId from authentication middleware
    const userId = 1; // Placeholder
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            completions: true,
            // flags: true,
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Get rank
    const higherRankedUsers = await prisma_1.prisma.user.count({
        where: { auraPoints: { gt: user.auraPoints } },
    });
    const rank = higherRankedUsers + 1;
    const userProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        auraPoints: user.auraPoints,
        streak: user.streak,
        lastCompletedAt: user.lastCompletedAt,
        createdAt: user.createdAt,
        completionsCount: user.completions.length,
        rank,
    };
    const response = {
        success: true,
        data: userProfile,
    };
    res.json(response);
});
/**
 * PATCH /api/users/me
 * Update current user's profile
 */
exports.updateCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('Not authenticated', 401);
    }
    const userId = req.user.id;
    const { name } = req.body;
    if (!name) {
        throw new errorHandler_1.AppError('Nothing to update', 400);
    }
    try {
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { name },
        });
        const response = {
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully',
        };
        res.json(response);
    }
    catch (err) {
        // If Prisma cannot find the user, it throws
        throw new errorHandler_1.AppError('User not found', 404);
    }
});
/**
 * GET /api/users/:id/completions
 * Get all completions for a specific user
 */
exports.getUserCompletions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new errorHandler_1.AppError('Invalid user ID', 400);
    }
    // TODO: Get userId from authentication middleware and verify access
    // TODO: Replace with Prisma query:
    // prisma.challengeCompletion.findMany({
    //   where: { userId },
    //   include: { challenge: true },
    //   orderBy: { completedAt: 'desc' }
    // })
    // Verify user exists
    const userExists = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    if (!userExists) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const completions = await prisma_1.prisma.challengeCompletion.findMany({
        where: { userId },
        include: {
            challenge: true, // Challenge details
            flags: {
                include: {
                    flaggedBy: true, // User who flagged it
                },
            },
        },
        orderBy: { completedAt: 'desc' },
    });
    const response = {
        success: true,
        data: completions,
    };
    res.json(response);
});
/**
 * GET /api/users/:id/stats
 * Get comprehensive statistics for a user
 */
exports.getUserStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new errorHandler_1.AppError('Invalid user ID', 400);
    }
    // Check if user exists
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            auraPoints: true,
            streak: true,
            createdAt: true
        }
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Optimize: Select only necessary fields for statistics
    const completions = await prisma_1.prisma.challengeCompletion.findMany({
        where: { userId },
        select: {
            completedAt: true,
            challenge: {
                select: {
                    difficulty: true,
                    pointsReward: true
                }
            }
        },
        orderBy: {
            completedAt: 'asc'
        }
    });
    // Calculate statistics
    const totalCompletions = completions.length;
    // Stats by difficulty
    const difficultyStats = completions.reduce((acc, curr) => {
        const diff = curr.challenge.difficulty.toLowerCase();
        acc[diff] = (acc[diff] || 0) + 1;
        return acc;
    }, {});
    const pointsByDifficulty = completions.reduce((acc, curr) => {
        const diff = curr.challenge.difficulty.toLowerCase();
        acc[diff] = (acc[diff] || 0) + curr.challenge.pointsReward;
        return acc;
    }, {});
    // Calculate longest streak
    let currentStreakRun = 0;
    let longestStreak = 0;
    let lastDate = null;
    completions.forEach((c) => {
        const date = new Date(c.completedAt);
        date.setHours(0, 0, 0, 0); // Normalize to day
        if (!lastDate) {
            currentStreakRun = 1;
            longestStreak = 1;
        }
        else {
            const diffTime = Math.abs(date.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreakRun++;
            }
            else if (diffDays > 1) {
                currentStreakRun = 1;
            }
        }
        if (currentStreakRun > longestStreak) {
            longestStreak = currentStreakRun;
        }
        lastDate = date;
    });
    // Weekly/Monthly stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const completedThisWeek = completions.filter((c) => c.completedAt >= oneWeekAgo).length;
    const completedThisMonth = completions.filter((c) => c.completedAt >= oneMonthAgo).length;
    // Average points
    const avgPointsPerCompletion = totalCompletions > 0
        ? Math.round(user.auraPoints / totalCompletions)
        : 0;
    res.json({
        success: true,
        data: {
            userId: user.id,
            totalCompletions,
            auraPoints: user.auraPoints,
            currentStreak: user.streak,
            longestStreak,
            completionsByDifficulty: {
                easy: difficultyStats['easy'] || 0,
                medium: difficultyStats['medium'] || 0,
                hard: difficultyStats['hard'] || 0
            },
            pointsByDifficulty: {
                easy: pointsByDifficulty['easy'] || 0,
                medium: pointsByDifficulty['medium'] || 0,
                hard: pointsByDifficulty['hard'] || 0
            },
            activity: {
                completedThisWeek,
                completedThisMonth
            },
            averagePointsPerCompletion: avgPointsPerCompletion
        }
    });
});
