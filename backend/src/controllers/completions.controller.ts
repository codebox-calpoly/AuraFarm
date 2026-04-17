import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { prisma } from '../prisma';
import { ChallengeReviewStatus, Prisma } from '@prisma/client';
import { isConsecutiveDay, isSameCalendarDay } from '../utils/date';
import { getAcceptedFriendIds } from '../utils/friendship';

function viewerMaySeeCompletion(
  completion: { userId: number; reviewStatus: ChallengeReviewStatus },
  viewer: { id: number; role: string } | undefined
): boolean {
  if (completion.reviewStatus === ChallengeReviewStatus.approved) {
    return true;
  }
  if (!viewer) return false;
  if (viewer.role === 'admin') return true;
  return completion.userId === viewer.id;
}

/**
 * POST /api/completions
 * Submit a challenge completion
 */
export const completeChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { challengeId, latitude, longitude, imageUrl, caption } = req.body;

  if (!challengeId || isNaN(Number(challengeId))) {
    throw new AppError('Invalid challenge ID', 400);
  }

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new AppError('imageUrl is required', 400);
  }

  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const userId = req.user.id;

  const challenge = await prisma.challenge.findUnique({
    where: { id: Number(challengeId) },
  });

  if (!challenge) {
    throw new AppError('Challenge not found', 404);
  }

  const lat =
    latitude !== undefined && latitude !== null && !Number.isNaN(Number(latitude))
      ? Number(latitude)
      : challenge.latitude;
  const lng =
    longitude !== undefined && longitude !== null && !Number.isNaN(Number(longitude))
      ? Number(longitude)
      : challenge.longitude;

  const existingCompletion = await prisma.challengeCompletion.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId: Number(challengeId),
      },
    },
  });

  if (existingCompletion) {
    throw new AppError('You have already completed this challenge', 400);
  }

  const completion = await prisma.challengeCompletion.create({
    data: {
      userId,
      challengeId: Number(challengeId),
      latitude: lat,
      longitude: lng,
      imageUri: imageUrl,
      caption: caption ?? null,
      reviewStatus: ChallengeReviewStatus.pending,
    },
  });

  const response: ApiResponse<typeof completion> = {
    success: true,
    data: completion,
    message: 'Challenge submitted! It will appear on the feed once reviewed.',
  };

  res.status(201).json(response);
});

export const updateCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const completionId = parseInt(id);

  if (isNaN(completionId)) {
    throw new AppError('Invalid completion ID', 400);
  }

  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const completion = await prisma.challengeCompletion.findUnique({
    where: { id: completionId },
  });

  if (!completion) {
    throw new AppError('Completion not found', 404);
  }

  if (completion.userId !== req.user.id) {
    throw new AppError('You can only edit your own posts', 403);
  }

  const updated = await prisma.challengeCompletion.update({
    where: { id: completionId },
    data: { caption: req.body.caption ?? null },
    include: {
      user: { select: { id: true, name: true } },
      challenge: { select: { id: true, title: true, pointsReward: true } },
    },
  });

  const response: ApiResponse<typeof updated> = {
    success: true,
    data: updated,
  };

  res.json(response);
});

export const likeCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const completionId = parseInt(id);

  if (isNaN(completionId)) {
    throw new AppError('Invalid completion ID', 400);
  }

  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const completion = await prisma.challengeCompletion.findUnique({
    where: { id: completionId },
    select: { id: true, reviewStatus: true },
  });

  if (!completion) {
    throw new AppError('Completion not found', 404);
  }

  if (completion.reviewStatus !== ChallengeReviewStatus.approved) {
    throw new AppError('Completion not found', 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.completionLike.createMany({
      data: [{ completionId, userId: req.user!.id }],
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

  const response: ApiResponse<typeof updated> = {
    success: true,
    data: updated,
  };

  res.json(response);
});

export const unlikeCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const completionId = parseInt(id);

  if (isNaN(completionId)) {
    throw new AppError('Invalid completion ID', 400);
  }

  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const completion = await prisma.challengeCompletion.findUnique({
    where: { id: completionId },
    select: { id: true, reviewStatus: true },
  });

  if (!completion) {
    throw new AppError('Completion not found', 404);
  }

  if (completion.reviewStatus !== ChallengeReviewStatus.approved) {
    throw new AppError('Completion not found', 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.completionLike.deleteMany({
      where: { completionId, userId: req.user!.id },
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

  const response: ApiResponse<typeof updated> = {
    success: true,
    data: updated,
  };

  res.json(response);
});

export const getCompletionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const completionId = parseInt(id);

  if (isNaN(completionId)) {
    throw new AppError('Invalid completion ID', 400);
  }

  const completion = await prisma.challengeCompletion.findUnique({
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
    throw new AppError('Completion not found', 404);
  }

  if (!viewerMaySeeCompletion(completion, req.user)) {
    throw new AppError('Completion not found', 404);
  }

  const response: ApiResponse<typeof completion> = {
    success: true,
    data: completion,
  };

  res.json(response);
});

/**
 * PATCH /api/completions/:id/review (admin)
 * Approve or reject a completion for the public feed.
 */
export const reviewChallengeCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const completionId = parseInt(id);

  if (isNaN(completionId)) {
    throw new AppError('Invalid completion ID', 400);
  }

  const body = req.body as { reviewStatus: 'approved' | 'rejected' };
  const reviewStatus =
    body.reviewStatus === 'approved'
      ? ChallengeReviewStatus.approved
      : ChallengeReviewStatus.rejected;

  const now = new Date();

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const completion = await tx.challengeCompletion.update({
      where: { id: completionId },
      data: {
        reviewStatus,
        reviewedAt: now,
        postedAt: reviewStatus === ChallengeReviewStatus.approved ? now : null,
      },
      include: {
        user: { select: { id: true, name: true, streak: true, lastCompletedAt: true } },
        challenge: { select: { id: true, title: true, pointsReward: true } },
      },
    });

    if (reviewStatus === ChallengeReviewStatus.approved) {
      const user = completion.user;
      const lastCompleted = user.lastCompletedAt;
      let newStreak: number;

      if (lastCompleted === null) {
        newStreak = 1;
      } else if (isSameCalendarDay(now, lastCompleted)) {
        newStreak = user.streak;
      } else if (isConsecutiveDay(lastCompleted, now)) {
        newStreak = user.streak + 1;
      } else {
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

  const response: ApiResponse<typeof updated> = {
    success: true,
    data: updated,
  };

  res.json(response);
});

export const getCompletions = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    challengeId,
    startDate,
    endDate,
    page,
    limit,
    sortBy,
    sortOrder,
    feed,
  } = req.query as {
    userId?: number;
    challengeId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    feed?: 'global' | 'friends';
  };

  const where: Prisma.ChallengeCompletionWhereInput = {};

  const userIdNum =
    userId !== undefined && userId !== null && !Number.isNaN(Number(userId))
      ? Number(userId)
      : undefined;

  const feedScope = feed === 'friends' ? 'friends' : 'global';

  if (userIdNum !== undefined && !Number.isNaN(userIdNum)) {
    where.userId = userIdNum;
    const viewerId = req.user?.id;
    const isOwner = viewerId === userIdNum;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      where.reviewStatus = ChallengeReviewStatus.approved;
      where.user = { shareCompletionsInFeed: true };
    }
  } else {
    where.reviewStatus = ChallengeReviewStatus.approved;

    if (feedScope === 'friends') {
      if (!req.user) {
        throw new AppError('Sign in to view your friends feed', 401);
      }
      const friendIds = await getAcceptedFriendIds(req.user.id);
      if (friendIds.length === 0) {
        const pageNum = Number(page ?? 1);
        const limitNum = Number(limit ?? 20);
        res.json({
          success: true,
          data: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            totalPages: 1,
          },
        });
        return;
      }
      where.userId = { in: friendIds };
    }

    where.user = { shareCompletionsInFeed: true };
  }

  if (challengeId) where.challengeId = challengeId;

  if (startDate || endDate) {
    where.completedAt = {
      ...(startDate ? { gte: startDate } : {}),
      ...(endDate ? { lte: endDate } : {}),
    };
  }

  const pageNum = Number(page ?? 1);
  const limitNum = Number(limit ?? 20);
  const skip = (pageNum - 1) * limitNum;

  const orderBy: Prisma.ChallengeCompletionOrderByWithRelationInput = {
    completedAt: (sortOrder === 'asc' ? 'asc' : 'desc'),
  };

  const [total, completions] = await prisma.$transaction([
    prisma.challengeCompletion.count({ where }),
    prisma.challengeCompletion.findMany({
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
