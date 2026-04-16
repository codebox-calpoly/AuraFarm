import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import { isConsecutiveDay, isSameCalendarDay } from '../utils/date';

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

  const completion = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const newCompletion = await tx.challengeCompletion.create({
      data: {
        userId,
        challengeId: Number(challengeId),
        latitude: lat,
        longitude: lng,
        imageUri: imageUrl,
        caption: caption ?? null,
      },
    });

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const now = new Date();
    const lastCompleted = user.lastCompletedAt;
    let newStreak: number;

    if (lastCompleted === null) {
      newStreak = 1;
    }
    else if (isSameCalendarDay(now, lastCompleted)) {
      newStreak = user.streak;
    }
    else if (isConsecutiveDay(lastCompleted, now)) {
      newStreak = user.streak + 1;
    }
    else {
      newStreak = 1;
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        auraPoints: { increment: challenge.pointsReward },
        streak: newStreak,
        lastCompletedAt: now,
      },
    });

    return newCompletion;
  });

  const response: ApiResponse<typeof completion> = {
    success: true,
    data: completion,
    message: 'Challenge completed successfully!',
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
    select: { id: true },
  });

  if (!completion) {
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
    select: { id: true },
  });

  if (!completion) {
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

  const response: ApiResponse<typeof completion> = {
    success: true,
    data: completion,
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
  } = req.query as any;

  const where: Prisma.ChallengeCompletionWhereInput = {};

  if (userId) where.userId = userId;
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
