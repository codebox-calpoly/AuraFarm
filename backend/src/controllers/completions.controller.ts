import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { ChallengeCompletion, CreateCompletionRequest, ApiResponse } from '../types';

// Mock data - will be replaced with Prisma queries once database is connected
const mockCompletions: ChallengeCompletion[] = [
  {
    id: 1,
    userId: 1,
    challengeId: 1,
    latitude: 37.7749,
    longitude: -122.4194,
    completedAt: new Date('2024-01-20'),
  },
];

/**
 * POST /api/completions
 * Submit a challenge completion
 */
export const completeChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { challengeId, latitude, longitude } = req.body;
  
  if (!challengeId || isNaN(Number(challengeId))) {
    throw new AppError('Invalid challenge ID', 400);
  }
  
  // TODO: Get userId from authentication middleware
  const userId = 1; // Placeholder
  
  // TODO: Verify challenge exists
  // TODO: Check if user already completed this challenge
  // TODO: Verify location is within acceptable range of challenge location
  
  const newCompletion: ChallengeCompletion = {
    id: mockCompletions.length + 1,
    userId,
    challengeId,
    latitude,
    longitude,
    completedAt: new Date(),
  };
  
  mockCompletions.push(newCompletion);
  
  // TODO: Update user's auraPoints and streak
  // TODO: Return updated user stats
  
  const response: ApiResponse<ChallengeCompletion> = {
    success: true,
    data: newCompletion,
    message: 'Challenge completed successfully!',
  };
  
  res.status(201).json(response);
});

/**
 * GET /api/completions/:id
 * Get a specific completion by ID
 */
export const getCompletionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const completionId = parseInt(id);
  
  if (isNaN(completionId)) {
    throw new AppError('Invalid completion ID', 400);
  }
  
  const completion = mockCompletions.find(c => c.id === completionId);
  
  if (!completion) {
    throw new AppError('Completion not found', 404);
  }
  
  const response: ApiResponse<ChallengeCompletion> = {
    success: true,
    data: completion,
  };
  
  res.json(response);
});

