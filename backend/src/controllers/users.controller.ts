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

