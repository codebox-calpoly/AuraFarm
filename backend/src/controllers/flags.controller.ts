import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { Flag, CreateFlagRequest, ApiResponse } from '../types';
import { prisma } from '../prisma';

// Mock data - will be replaced with Prisma queries once database is connected
const mockFlags: Flag[] = [];

/**
 * POST /api/flags
 * Flag a challenge completion
 */
export const flagCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { completionId, reason } = req.body;
  
  if (!completionId || isNaN(Number(completionId))) {
    throw new AppError('Invalid completion ID', 400);
  }
  
  // TODO: Get userId from authentication middleware
  const flaggedById = 1; // Placeholder
  
  // TODO: Verify completion exists
  // TODO: Check if user already flagged this completion
  // TODO: Prevent users from flagging their own completions
  
  const newFlag: Flag = {
    id: mockFlags.length + 1,
    completionId,
    flaggedById,
    reason: reason || null,
    createdAt: new Date(),
  };
  
  mockFlags.push(newFlag);
  
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

