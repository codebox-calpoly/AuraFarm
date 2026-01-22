import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { User, UserProfile, ApiResponse, ChallengeCompletion } from '../types';
import { prisma } from '../prisma';
import {
  User as PrismaUser,
  ChallengeCompletion as PrismaChallengeCompletion,
} from '@prisma/client';

function toUserProfile(
  user: PrismaUser & { completions: PrismaChallengeCompletion[] }
): UserProfile {
  return {
    ...user,
    completionsCount: user.completions.length,
  };
}

/**
 * GET /api/users/:id
 * Get user profile by ID
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }
  
  // TODO: Get userId from authentication middleware and verify access
  // TODO: Replace with Prisma query: prisma.user.findUnique({ where: { id: userId }, include: { completions: true } })
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      completions: true, // ChallengeCompletion[]
      // flags: true, // you can include this too if you need it in the profile
    },
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Calculate rank (simplified for now, ideally cached or optimized query)
  // For now, we can omit rank or do a simple count query if strictly needed
  // Let's just return basic profile first

  const userProfile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as any, // Cast to match enum if needed
    auraPoints: user.auraPoints,
    streak: user.streak,
    lastCompletedAt: user.lastCompletedAt,
    createdAt: user.createdAt,
    completionsCount: user._count.completions,
  };

  const response: ApiResponse<UserProfile> = {
    success: true,
    data: userProfile,
  };

  res.json(response);
});

/**
 * GET /api/users/me
 * Get current user's profile
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Get userId from authentication middleware
  const userId = 1; // Placeholder
  

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      completions: true,
      // flags: true,
    },
  });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get rank
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

/**
 * PATCH /api/users/me
 * Update current user's profile
 */
export const updateCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const userId = req.user.id;
  const { name } = req.body;
  
  if (!name) {
    throw new AppError('Nothing to update', 400);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
  });

    const response: ApiResponse<PrismaUser> = {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    };
  
  res.json(response);
  } catch (err: any) {
    // If Prisma cannot find the user, it throws
    throw new AppError('User not found', 404);
  }
});

/**
 * GET /api/users/:id/completions
 * Get all completions for a specific user
 */
export const getUserCompletions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }
  
  // TODO: Get userId from authentication middleware and verify access
  // TODO: Replace with Prisma query:
  // prisma.challengeCompletion.findMany({
  //   where: { userId },
  //   include: { challenge: true },
  //   orderBy: { completedAt: 'desc' }
  // })
  
  // Verify user exists
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
      challenge: true,        // Challenge details
      flags: {
        include: {
          flaggedBy: true,    // User who flagged it
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


/**
 * GET /api/users/:id/stats
 * Get comprehensive statistics for a user
 */
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new AppError('Invalid user ID', 400);
  }

  // Check if user exists
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

  // Optimize: Select only necessary fields for statistics
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

  // Calculate statistics
  const totalCompletions = completions.length;

  // Stats by difficulty
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

  // Calculate longest streak
  let currentStreakRun = 0;
  let longestStreak = 0;
  let lastDate: Date | null = null;

  completions.forEach((c: any) => {
    const date = new Date(c.completedAt);
    date.setHours(0, 0, 0, 0); // Normalize to day

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

  // Weekly/Monthly stats
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const completedThisWeek = completions.filter((c: any) => c.completedAt >= oneWeekAgo).length;
  const completedThisMonth = completions.filter((c: any) => c.completedAt >= oneMonthAgo).length;

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
