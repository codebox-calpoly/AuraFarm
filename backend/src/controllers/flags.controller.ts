import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { Flag, CreateFlagRequest, ApiResponse } from '../types';
import { prisma } from '../prisma';

/**
 * POST /api/flags
 * Flag a challenge completion
 */
export const flagCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { completionId, reason } = req.body;

  // Get userId from authentication middleware
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const flaggedById = req.user.id;

  // Verify completion exists
  const completion = await prisma.challengeCompletion.findUnique({
    where: { id: completionId },
  });

  if (!completion) {
    throw new AppError('Completion not found', 404);
  }

  // Prevent users from flagging their own completions
  if (completion.userId === flaggedById) {
    throw new AppError('You cannot flag your own completion', 400);
  }

  // Check if user already flagged this completion
  const existingFlag = await prisma.flag.findFirst({
    where: {
      completionId,
      flaggedById,
    },
  });

  if (existingFlag) {
    throw new AppError('You have already flagged this completion', 409);
  }

  // Create the flag
  const newFlag = await prisma.flag.create({
    data: {
      completionId,
      flaggedById,
      reason: reason || null,
    },
  });

  const response: ApiResponse<Flag> = {
    success: true,
    data: newFlag,
    message: 'Completion flagged successfully',
  };

  res.status(201).json(response);
});

/**
 * GET /api/flags
 * Get all flags for admin review (admin only)
 * 
 * Requires admin authentication via authenticate and requireAdmin middleware.
 * Fetches all flags with related data:
 * - flaggedBy: User who created the flag
 * - completion.user: User who created the flagged completion
 * - completion.challenge: Challenge that was completed
 * 
 * Results are sorted by most recent first.
 * 
 * @returns {ApiResponse<Flag[]>} 200 OK with array of flags
 * @throws {AppError} 401 if not authenticated
 * @throws {AppError} 403 if not admin
 */

export const getFlags = asyncHandler(async (req: Request, res: Response) => {
  const flags = await prisma.flag.findMany({
    include: {
      flaggedBy: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      completion: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          challenge: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Most recent goes first
    },
  });

  const response: ApiResponse<typeof flags> = {
    success: true,
    data: flags,
  };

  res.json(response);
});
