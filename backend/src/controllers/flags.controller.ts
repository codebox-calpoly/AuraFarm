import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { Flag, CreateFlagRequest, ApiResponse } from '../types';
import { prisma } from '../prisma';
import { ChallengeReviewStatus } from '@prisma/client';
import { sendModerationNotification } from '../utils/email';
import logger from '../utils/logger';

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

  if (completion.reviewStatus !== ChallengeReviewStatus.approved) {
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

  // Fire-and-forget moderation notification — never block the user response on email.
  Promise.all([
    prisma.user.findUnique({
      where: { id: flaggedById },
      select: { id: true, email: true, name: true },
    }),
    prisma.challengeCompletion.findUnique({
      where: { id: completionId },
      select: {
        id: true,
        caption: true,
        imageUrl: true,
        imageUri: true,
        user: { select: { id: true, email: true, name: true } },
        challenge: { select: { title: true } },
      },
    }),
  ])
    .then(([actor, full]) => {
      if (!actor || !full) return;
      return sendModerationNotification({
        kind: 'flag',
        actor,
        target: full.user,
        reason: reason || null,
        completion: {
          id: full.id,
          challengeTitle: full.challenge?.title ?? null,
          caption: full.caption,
          imageUrl: full.imageUrl ?? full.imageUri ?? null,
        },
      });
    })
    .catch((err) =>
      logger.error('Flag notification email failed', { error: err, completionId, flaggedById }),
    );

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
