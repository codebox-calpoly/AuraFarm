import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { Challenge, ChallengeWithCompletions, ApiResponse, PaginatedResponse } from '../types';
import { prisma } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


/**
 * GET /api/challenges
 * Get all challenges with optional filtering
 */
export const getChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { difficulty, page = '1', limit = '20' } = req.query as {
    difficulty?: string;
    page?: string;
    limit?: string;
  }

  
  // Pagination
  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 20, 100);
  const skip = (pageNum - 1) * limitNum;

  const where: {
    difficulty?: string;
  } = {};
  if (difficulty) {
    where.difficulty = difficulty;
  }
  
  const [total, challenges] = await Promise.all([
    prisma.challenge.count({ where }),
    prisma.challenge.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  const response: PaginatedResponse<Challenge> = {
    success: true,
    data: challenges,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };

  res.json(response);
});

/**
 * GET /api/challenges/:id
 * Get a specific challenge by ID
 */
export const getChallengeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const challengeId = parseInt(id);
  
  if (isNaN(challengeId)) {
    throw new AppError('Invalid challenge ID', 400);
  }
  
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });
  
  if (!challenge) {
    throw new AppError('Challenge not found', 404);
  }
  
  // Get real completions count from database
  const completionsCount = await prisma.challengeCompletion.count({
    where: { challengeId },
  });
  
  const challengeWithCompletions: ChallengeWithCompletions = {
    ...challenge,
    completionsCount,
  };
  
  const response: ApiResponse<ChallengeWithCompletions> = {
    success: true,
    data: challengeWithCompletions,
  };
  
  res.json(response);
});

/**
 * POST /api/challenges
 * Create a new challenge (admin only)
 * 
 * Requires admin authentication via authenticate and requireAdmin middleware.
 * Validates input using createChallengeSchema.
 * Creates challenge in database using Prisma.
 * 
 * @returns {ApiResponse<Challenge>} 201 Created with new challenge
 * @throws {AppError} 400 if validation fails
 * @throws {AppError} 401 if not authenticated
 * @throws {AppError} 403 if not admin
 */
export const createChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, latitude, longitude, difficulty, pointsReward } = req.body;
  
  try {
    const newChallenge = await prisma.challenge.create({
      data: {
        title,
        description,
        latitude,
        longitude,
        difficulty,
        pointsReward,
      },
    });

    const response: ApiResponse<Challenge> = {
      success: true,
      data: newChallenge,
      message: 'Challenge created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      // unique constraint violation
      throw new AppError('A challenge with this title already exists', 409);
    }

    throw error;
  }
});