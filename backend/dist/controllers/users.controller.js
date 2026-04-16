"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.getUserCompletions = exports.updateCurrentUser = exports.getCurrentUser = exports.getUserById = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const supabase_1 = require("../supabase");
const logger_1 = __importDefault(require("../utils/logger"));
const client_1 = require("@prisma/client");
function toPublicUserProfile(user) {
    return {
        id: user.id,
        name: user.name,
        role: user.role,
        auraPoints: user.auraPoints,
        streak: user.streak,
        lastCompletedAt: user.lastCompletedAt,
        createdAt: user.createdAt,
        completionsCount: user.completionsCount,
        rank: user.rank,
    };
}
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new errorHandler_1.AppError('Invalid user ID', 400);
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            role: true,
            auraPoints: true,
            streak: true,
            lastCompletedAt: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const viewerId = req.user?.id;
    const isOwner = viewerId === userId;
    const completionsCount = await prisma_1.prisma.challengeCompletion.count({
        where: {
            userId,
            ...(isOwner ? {} : { reviewStatus: client_1.ChallengeReviewStatus.approved }),
        },
    });
    const userProfile = toPublicUserProfile({
        id: user.id,
        name: user.name,
        role: user.role,
        auraPoints: user.auraPoints,
        streak: user.streak,
        lastCompletedAt: user.lastCompletedAt,
        createdAt: user.createdAt,
        completionsCount,
    });
    const response = {
        success: true,
        data: userProfile,
    };
    res.json(response);
});
exports.getCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('Not authenticated', 401);
    }
    const userId = req.user.id;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            auraPoints: true,
            streak: true,
            lastCompletedAt: true,
            createdAt: true,
            _count: {
                select: { completions: true },
            },
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
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
        completionsCount: user._count.completions,
        rank,
    };
    const response = {
        success: true,
        data: userProfile,
    };
    res.json(response);
});
exports.updateCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError('Not authenticated', 401);
    }
    const userId = req.user.id;
    const { name, email } = req.body;
    const updateData = {};
    if (typeof name === 'string' && name.trim().length > 0) {
        updateData.name = name.trim();
    }
    if (typeof email === 'string' && email.trim().length > 0) {
        updateData.email = email.trim().toLowerCase();
    }
    if (Object.keys(updateData).length === 0) {
        throw new errorHandler_1.AppError('Nothing to update', 400);
    }
    const currentUser = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });
    if (!currentUser) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const emailChanged = typeof updateData.email === 'string' && updateData.email !== currentUser.email;
    if (emailChanged) {
        const { error: supabaseError } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(req.user.supabaseId, {
            email: updateData.email,
        });
        if (supabaseError) {
            logger_1.default.error('Failed to update email in Supabase', { error: supabaseError, userId });
            throw new errorHandler_1.AppError('Failed to update email. Please try again.', 400);
        }
    }
    try {
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        const response = {
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully',
        };
        res.json(response);
    }
    catch (err) {
        if (emailChanged) {
            await supabase_1.supabaseAdmin.auth.admin.updateUserById(req.user.supabaseId, {
                email: currentUser.email,
            }).catch((rollbackError) => {
                logger_1.default.error('Failed to roll back Supabase email update', { error: rollbackError, userId });
            });
        }
        if (err?.code === 'P2002' && Array.isArray(err?.meta?.target) && err.meta.target.includes('email')) {
            throw new errorHandler_1.AppError('Email already in use', 409);
        }
        throw new errorHandler_1.AppError('User not found', 404);
    }
});
exports.getUserCompletions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new errorHandler_1.AppError('Invalid user ID', 400);
    }
    const userExists = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    if (!userExists) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const viewerId = req.user?.id;
    const isOwner = viewerId === userId;
    const isAdmin = req.user?.role === 'admin';
    const completions = await prisma_1.prisma.challengeCompletion.findMany({
        where: {
            userId,
            ...(!isOwner && !isAdmin ? { reviewStatus: client_1.ChallengeReviewStatus.approved } : {}),
        },
        include: {
            challenge: true,
            flags: {
                select: {
                    id: true,
                    reason: true,
                    createdAt: true,
                    flaggedBy: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
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
exports.getUserStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new errorHandler_1.AppError('Invalid user ID', 400);
    }
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
    const completions = await prisma_1.prisma.challengeCompletion.findMany({
        where: { userId, reviewStatus: client_1.ChallengeReviewStatus.approved },
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
    const totalCompletions = completions.length;
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
    let currentStreakRun = 0;
    let longestStreak = 0;
    let lastDate = null;
    completions.forEach((c) => {
        const date = new Date(c.completedAt);
        date.setHours(0, 0, 0, 0);
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
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const completedThisWeek = completions.filter((c) => c.completedAt >= oneWeekAgo).length;
    const completedThisMonth = completions.filter((c) => c.completedAt >= oneMonthAgo).length;
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
