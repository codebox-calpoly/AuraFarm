import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { Flag, CreateFlagRequest, ApiResponse } from '../types';

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
 * Get all flags (admin only - placeholder)
 */
export const getFlags = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add authentication middleware to check admin role
  
  const response: ApiResponse<Flag[]> = {
    success: true,
    data: mockFlags,
  };
  
  res.json(response);
});

