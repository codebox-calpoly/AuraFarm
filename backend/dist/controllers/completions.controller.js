"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletions = exports.reviewChallengeCompletion = exports.getCompletionById = exports.unlikeCompletion = exports.likeCompletion = exports.updateCompletion = exports.completeChallenge = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const date_1 = require("../utils/date");
function viewerMaySeeCompletion(completion, viewer) {
    if (completion.reviewStatus === client_1.ChallengeReviewStatus.approved) {
        return true;
    }
    if (!viewer)
        return false;
    if (viewer.role === 'admin')
        return true;
    return completion.userId === viewer.id;
}
/**
 * POST /api/completions
 * Submit a challenge completion
 */
exports.completeChallenge = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { challengeId, latitude, longitude, imageUrl, caption } = req.body;
    if (!challengeId || isNaN(Number(challengeId))) {
        throw new errorHandler_1.AppError('Invalid challenge ID', 400);
    }
    if (!imageUrl || typeof imageUrl !== 'string') {
        throw new errorHandler_1.AppError('imageUrl is required', 400);
    }
    if (!req.user) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    const userId = req.user.id;
    const challenge = await prisma_1.prisma.challenge.findUnique({
        where: { id: Number(challengeId) },
    });
    if (!challenge) {
        throw new errorHandler_1.AppError('Challenge not found', 404);
    }
    const lat = latitude !== undefined && latitude !== null && !Number.isNaN(Number(latitude))
        ? Number(latitude)
        : challenge.latitude;
    const lng = longitude !== undefined && longitude !== null && !Number.isNaN(Number(longitude))
        ? Number(longitude)
        : challenge.longitude;
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
    const completion = await prisma_1.prisma.challengeCompletion.create({
        data: {
            userId,
            challengeId: Number(challengeId),
            latitude: lat,
            longitude: lng,
            imageUri: imageUrl,
            caption: caption ?? null,
            reviewStatus: client_1.ChallengeReviewStatus.pending,
        },
    });
    const response = {
        success: true,
        data: completion,
        message: 'Challenge submitted! It will appear on the feed once reviewed.',
    };
    res.status(201).json(response);
});
exports.updateCompletion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const completionId = parseInt(id);
    if (isNaN(completionId)) {
        throw new errorHandler_1.AppError('Invalid completion ID', 400);
    }
    if (!req.user) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    const completion = await prisma_1.prisma.challengeCompletion.findUnique({
        where: { id: completionId },
    });
    if (!completion) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    if (completion.userId !== req.user.id) {
        throw new errorHandler_1.AppError('You can only edit your own posts', 403);
    }
    const updated = await prisma_1.prisma.challengeCompletion.update({
        where: { id: completionId },
        data: { caption: req.body.caption ?? null },
        include: {
            user: { select: { id: true, name: true } },
            challenge: { select: { id: true, title: true, pointsReward: true } },
        },
    });
    const response = {
        success: true,
        data: updated,
    };
    res.json(response);
});
exports.likeCompletion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const completionId = parseInt(id);
    if (isNaN(completionId)) {
        throw new errorHandler_1.AppError('Invalid completion ID', 400);
    }
    if (!req.user) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    const completion = await prisma_1.prisma.challengeCompletion.findUnique({
        where: { id: completionId },
        select: { id: true, reviewStatus: true },
    });
    if (!completion) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    if (completion.reviewStatus !== client_1.ChallengeReviewStatus.approved) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.completionLike.createMany({
            data: [{ completionId, userId: req.user.id }],
            skipDuplicates: true,
        });
        const likes = await tx.completionLike.count({
            where: { completionId },
        });
        return tx.challengeCompletion.update({
            where: { id: completionId },
            data: { likes },
            select: { id: true, likes: true },
        });
    });
    const response = {
        success: true,
        data: updated,
    };
    res.json(response);
});
exports.unlikeCompletion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const completionId = parseInt(id);
    if (isNaN(completionId)) {
        throw new errorHandler_1.AppError('Invalid completion ID', 400);
    }
    if (!req.user) {
        throw new errorHandler_1.AppError('Authentication required', 401);
    }
    const completion = await prisma_1.prisma.challengeCompletion.findUnique({
        where: { id: completionId },
        select: { id: true, reviewStatus: true },
    });
    if (!completion) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    if (completion.reviewStatus !== client_1.ChallengeReviewStatus.approved) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.completionLike.deleteMany({
            where: { completionId, userId: req.user.id },
        });
        const likes = await tx.completionLike.count({
            where: { completionId },
        });
        return tx.challengeCompletion.update({
            where: { id: completionId },
            data: { likes },
            select: { id: true, likes: true },
        });
    });
    const response = {
        success: true,
        data: updated,
    };
    res.json(response);
});
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
    if (!viewerMaySeeCompletion(completion, req.user)) {
        throw new errorHandler_1.AppError('Completion not found', 404);
    }
    const response = {
        success: true,
        data: completion,
    };
    res.json(response);
});
/**
 * PATCH /api/completions/:id/review (admin)
 * Approve or reject a completion for the public feed.
 */
exports.reviewChallengeCompletion = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const completionId = parseInt(id);
    if (isNaN(completionId)) {
        throw new errorHandler_1.AppError('Invalid completion ID', 400);
    }
    const body = req.body;
    const reviewStatus = body.reviewStatus === 'approved'
        ? client_1.ChallengeReviewStatus.approved
        : client_1.ChallengeReviewStatus.rejected;
    const now = new Date();
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        const completion = await tx.challengeCompletion.update({
            where: { id: completionId },
            data: {
                reviewStatus,
                reviewedAt: now,
                postedAt: reviewStatus === client_1.ChallengeReviewStatus.approved ? now : null,
            },
            include: {
                user: { select: { id: true, name: true, streak: true, lastCompletedAt: true } },
                challenge: { select: { id: true, title: true, pointsReward: true } },
            },
        });
        if (reviewStatus === client_1.ChallengeReviewStatus.approved) {
            const user = completion.user;
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
                where: { id: completion.userId },
                data: {
                    auraPoints: { increment: completion.challenge.pointsReward },
                    streak: newStreak,
                    lastCompletedAt: now,
                },
            });
        }
        return completion;
    });
    const response = {
        success: true,
        data: updated,
    };
    res.json(response);
});
exports.getCompletions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, challengeId, startDate, endDate, page, limit, sortBy, sortOrder, } = req.query;
    const where = {};
    const userIdNum = userId !== undefined && userId !== null && userId !== ''
        ? Number(userId)
        : undefined;
    if (userIdNum !== undefined && !Number.isNaN(userIdNum)) {
        where.userId = userIdNum;
        const viewerId = req.user?.id;
        const isOwner = viewerId === userIdNum;
        const isAdmin = req.user?.role === 'admin';
        if (!isOwner && !isAdmin) {
            where.reviewStatus = client_1.ChallengeReviewStatus.approved;
        }
    }
    else {
        where.reviewStatus = client_1.ChallengeReviewStatus.approved;
    }
    if (challengeId)
        where.challengeId = challengeId;
    if (startDate || endDate) {
        where.completedAt = {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
        };
    }
    const pageNum = Number(page ?? 1);
    const limitNum = Number(limit ?? 20);
    const skip = (pageNum - 1) * limitNum;
    const orderBy = {
        completedAt: (sortOrder === 'asc' ? 'asc' : 'desc'),
    };
    const [total, completions] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.challengeCompletion.count({ where }),
        prisma_1.prisma.challengeCompletion.findMany({
            where,
            orderBy,
            skip,
            take: limitNum,
            select: {
                id: true,
                userId: true,
                challengeId: true,
                latitude: true,
                longitude: true,
                imageUri: true,
                imageUrl: true,
                caption: true,
                completedAt: true,
                reviewStatus: true,
                reviewedAt: true,
                postedAt: true,
                likes: true,
                user: {
                    select: { id: true, name: true },
                },
                challenge: {
                    select: { id: true, title: true, pointsReward: true },
                },
            },
        }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const response = {
        success: true,
        data: completions,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
        },
    };
    res.json(response);
});
