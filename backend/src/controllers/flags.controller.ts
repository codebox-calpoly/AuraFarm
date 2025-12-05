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
  
  // TODO: Get userId from authentication middleware
  const flaggedById = 1; // Placeholder
  
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
 * Get all flags (admin only - placeholder)
 */
export const getFlags = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add authentication middleware to check admin role
  
  const flags = await prisma.flag.findMany();
  
  const response: ApiResponse<Flag[]> = {
    success: true,
    data: flags,
  };
  
  res.json(response);
});
