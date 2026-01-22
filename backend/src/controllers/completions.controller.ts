import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { prisma } from '../prisma';
import { calculateDistance } from '../utils/geo';
import { Prisma } from '@prisma/client';
import { isConsecutiveDay, isSameCalendarDay } from '../utils/date';

/**
 * POST /api/completions
 * Submit a challenge completion
 */
export const completeChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { challengeId, latitude, longitude } = req.body;

  if (!challengeId || isNaN(Number(challengeId))) {
    throw new AppError('Invalid challenge ID', 400);
  }

  // Get userId from authentication middleware
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const userId = req.user.id;

  // Verify challenge exists
  const challenge = await prisma.challenge.findUnique({
    where: { id: Number(challengeId) },
  });

  if (!challenge) {
    throw new AppError('Challenge not found', 404);
  }

  // Verify location is within acceptable range (e.g., 100 meters)
  const distance = calculateDistance(
    latitude,
    longitude,
    challenge.latitude,
    challenge.longitude
  );

  if (distance > 100) {
    throw new AppError(`You are too far from the challenge location (${Math.round(distance)}m away)`, 400);
  }

  // Check if user already completed this challenge
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

  // Use transaction to ensure data consistency
  const completion = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
        streak: newStreak,  // Use calculated value, not increment
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

/**
 * GET /api/completions/:id
 * Get a specific completion by ID
 */
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

/**
 * GET /api/completions
 * List completions with optional filters + pagination
 */
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

  // Only sorting allowed is completedAt
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
        completedAt: true,
        user: {
          select: { id: true, name: true },
        },
        challenge: {
          select: { id: true, title: true },
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

