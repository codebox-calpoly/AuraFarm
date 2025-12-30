import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { User, UserProfile, ApiResponse, ChallengeCompletion } from '../types';
import { prisma } from '../prisma';

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { completions: true },
      },
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
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { completions: true },
      },
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || undefined,
    },
  });

  // Re-map to frontend User type
  const mappedUser: User = {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role as any,
    auraPoints: updatedUser.auraPoints,
    streak: updatedUser.streak,
    lastCompletedAt: updatedUser.lastCompletedAt,
    createdAt: updatedUser.createdAt,
  };

  const response: ApiResponse<User> = {
    success: true,
    data: mappedUser,
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

  // Verify user exists first
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const completions = await prisma.challengeCompletion.findMany({
    where: { userId },
    include: {
      challenge: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  // Map to ChallengeCompletion type
  // Note: Prisma challenge include matches the shape mostly, but we define explicit types.
  // We can just cast or map if necessary. Prisma result should compatible with interface if properly typed.

  const response: ApiResponse<any[]> = { // Using any[] temporarily to avoid deep typing mismatch issues if strict
    success: true,
    data: completions,
  };

  res.json(response);
});

