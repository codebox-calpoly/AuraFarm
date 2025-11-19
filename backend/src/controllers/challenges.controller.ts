import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { Challenge, ChallengeWithCompletions, ApiResponse, PaginatedResponse } from '../types';
import { prisma } from '../prisma';


// Mock data - will be replaced with Prisma queries once database is connected
const mockChallenges: Challenge[] = [
  {
    id: 1,
    title: 'Visit the Library',
    description: 'Explore the main campus library and find a quiet study spot',
    latitude: 37.7749,
    longitude: -122.4194,
    difficulty: 'easy',
    pointsReward: 10,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    title: 'Hike to the Viewpoint',
    description: 'Complete the trail hike to the scenic viewpoint',
    latitude: 37.7849,
    longitude: -122.4094,
    difficulty: 'medium',
    pointsReward: 25,
    createdAt: new Date('2024-01-16'),
  },
];

/**
 * GET /api/challenges
 * Get all challenges with optional filtering
 */
export const getChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { difficulty, page = 1, limit = 20 } = req.query;
  
  let filtered = [...mockChallenges];
  
  // Filter by difficulty if provided
  if (difficulty && typeof difficulty === 'string') {
    filtered = filtered.filter(c => c.difficulty === difficulty);
  }
  
  // Pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginated = filtered.slice(startIndex, endIndex);
  
  const response: PaginatedResponse<Challenge> = {
    success: true,
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limitNum),
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
    where: {id: challengeId}
  })
  
  if (!challenge) {
    throw new AppError('Challenge not found', 404);
  }
  
  // Mock completions count
  const challengeWithCompletions: ChallengeWithCompletions = {
    ...challenge,
    completionsCount: Math.floor(Math.random() * 50),
  };
  
  const response: ApiResponse<ChallengeWithCompletions> = {
    success: true,
    data: challengeWithCompletions,
  };
  
  res.json(response);
});

/**
 * POST /api/challenges
 * Create a new challenge (admin only - placeholder)
 */
export const createChallenge = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add authentication middleware to check admin role
  const { title, description, latitude, longitude, difficulty, pointsReward } = req.body;
  
  const newChallenge: Challenge = {
    id: mockChallenges.length + 1,
    title,
    description,
    latitude,
    longitude,
    difficulty,
    pointsReward,
    createdAt: new Date(),
  };
  
  mockChallenges.push(newChallenge);
  
  const response: ApiResponse<Challenge> = {
    success: true,
    data: newChallenge,
    message: 'Challenge created successfully',
  };
  
  res.status(201).json(response);
});

