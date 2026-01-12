import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { User, UserProfile, ApiResponse, ChallengeCompletion, UserRole } from '../types';
import { prisma } from '../prisma';

// Mock data - will be replaced with Prisma queries once database is connected
const mockUsers: User[] = [
  {
    id: 1,
    email: 'user@example.com',
    name: 'John Doe',
    role: UserRole.user,
    auraPoints: 150,
    streak: 5,
    lastCompletedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 2,
    email: 'user2@example.com',
    name: 'Jane Smith',
    role: UserRole.user,
    auraPoints: 200,
    streak: 10,
    lastCompletedAt: new Date('2024-01-21'),
    createdAt: new Date('2024-01-02'),
  },
];

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

  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Mock completions count
  const userProfile: UserProfile = {
    ...user,
    completionsCount: Math.floor(Math.random() * 20),
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

  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const userProfile: UserProfile = {
    ...user,
    completionsCount: Math.floor(Math.random() * 20),
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
  // TODO: Get userId from authentication middleware
  const userId = 1; // Placeholder
  const { name } = req.body;

  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update user
  if (name) {
    user.name = name;
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    message: 'Profile updated successfully',
  };

  res.json(response);
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
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Mock completions - in real implementation, fetch from database
  const mockCompletions: ChallengeCompletion[] = [
    {
      id: 1,
      userId,
      challengeId: 1,
      latitude: 37.7749,
      longitude: -122.4194,
      completedAt: new Date('2024-01-20'),
    },
    {
      id: 2,
      userId,
      challengeId: 2,
      latitude: 37.7849,
      longitude: -122.4094,
      completedAt: new Date('2024-01-19'),
    },
  ];

  const response: ApiResponse<ChallengeCompletion[]> = {
    success: true,
    data: mockCompletions,
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
