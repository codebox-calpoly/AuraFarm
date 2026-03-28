import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { User, UserProfile, PublicUserProfile, ApiResponse } from '../types';
import { prisma } from '../prisma';
import { supabase, supabaseAdmin } from '../supabase';
import logger from '../utils/logger';
import {
  User as PrismaUser,
} from '@prisma/client';

function toPublicUserProfile(
  user: Pick<PrismaUser, 'id' | 'name' | 'auraPoints' | 'streak' | 'lastCompletedAt' | 'createdAt' | 'role'> & { completionsCount: number; rank?: number }
): PublicUserProfile {
  return {
    id: user.id,
    name: user.name,
    role: user.role as any,
    auraPoints: user.auraPoints,
    streak: user.streak,
    lastCompletedAt: user.lastCompletedAt,
    createdAt: user.createdAt,
    completionsCount: user.completionsCount,
    rank: user.rank,
  };
}

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
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
    throw new AppError('User not found', 404);
  }

  const userProfile = toPublicUserProfile({
    id: user.id,
    name: user.name,
    role: user.role,
    auraPoints: user.auraPoints,
    streak: user.streak,
    lastCompletedAt: user.lastCompletedAt,
    createdAt: user.createdAt,
    completionsCount: user._count.completions,
  });

  const response: ApiResponse<PublicUserProfile> = {
    success: true,
    data: userProfile,
  };

  res.json(response);
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
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
    throw new AppError('User not found', 404);
  }

  const higherRankedUsers = await prisma.user.count({
    where: { auraPoints: { gt: user.auraPoints } },
  });
  const rank = higherRankedUsers + 1;

  const userProfile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as any,
    auraPoints: user.auraPoints,
    streak: user.streak,
    lastCompletedAt: user.lastCompletedAt,
    createdAt: user.createdAt,
    completionsCount: user._count.completions,
    rank,
  };

  const response: ApiResponse<UserProfile> = {
    success: true,
    data: userProfile,
  };

  res.json(response);
});

export const updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const userId = req.user.id;
  const { name, email } = req.body as { name?: string; email?: string };

  const updateData: { name?: string; email?: string } = {};
  if (typeof name === 'string' && name.trim().length > 0) {
    updateData.name = name.trim();
  }
  if (typeof email === 'string' && email.trim().length > 0) {
    updateData.email = email.trim().toLowerCase();
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('Nothing to update', 400);
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!currentUser) {
    throw new AppError('User not found', 404);
  }

  const emailChanged = typeof updateData.email === 'string' && updateData.email !== currentUser.email;

  if (emailChanged) {
    const { error: supabaseError } = await supabaseAdmin.auth.admin.updateUserById(req.user.supabaseId, {
      email: updateData.email,
    });

    if (supabaseError) {
      logger.error('Failed to update email in Supabase', { error: supabaseError, userId });
      throw new AppError('Failed to update email. Please try again.', 400);
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const response: ApiResponse<PrismaUser> = {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    };

    res.json(response);
  } catch (err: any) {
    if (emailChanged) {
      await supabaseAdmin.auth.admin.updateUserById(req.user.supabaseId, {
        email: currentUser.email,
      }).catch((rollbackError) => {
        logger.error('Failed to roll back Supabase email update', { error: rollbackError, userId });
      });
    }

    if (err?.code === 'P2002' && Array.isArray(err?.meta?.target) && err.meta.target.includes('email')) {
      throw new AppError('Email already in use', 409);
    }
    throw new AppError('User not found', 404);
  }
});

export const getUserCompletions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new AppError('User not found', 404);
  }

  const completions = await prisma.challengeCompletion.findMany({
    where: { userId },
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

  const response: ApiResponse<typeof completions> = {
    success: true,
    data: completions,
  };

  res.json(response);
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      auraPoints: true,
      streak: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const completions = await prisma.challengeCompletion.findMany({
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

  const totalCompletions = completions.length;

  const difficultyStats = completions.reduce((acc: Record<string, number>, curr: any) => {
    const diff = curr.challenge.difficulty.toLowerCase();
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pointsByDifficulty = completions.reduce((acc: Record<string, number>, curr: any) => {
    const diff = curr.challenge.difficulty.toLowerCase();
    acc[diff] = (acc[diff] || 0) + curr.challenge.pointsReward;
    return acc;
  }, {} as Record<string, number>);

  let currentStreakRun = 0;
  let longestStreak = 0;
  let lastDate: Date | null = null;

  completions.forEach((c: any) => {
    const date = new Date(c.completedAt);
    date.setHours(0, 0, 0, 0);

    if (!lastDate) {
      currentStreakRun = 1;
      longestStreak = 1;
    } else {
      const diffTime = Math.abs(date.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreakRun++;
      } else if (diffDays > 1) {
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

  const completedThisWeek = completions.filter((c: any) => c.completedAt >= oneWeekAgo).length;
  const completedThisMonth = completions.filter((c: any) => c.completedAt >= oneMonthAgo).length;

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
