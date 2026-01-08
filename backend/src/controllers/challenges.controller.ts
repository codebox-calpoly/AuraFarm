import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { Challenge, ChallengeWithCompletions, ChallengeWithDistance, ApiResponse, PaginatedResponse } from '../types';
import { prisma } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { calculateDistance } from '../utils/geo';


/**
 * GET /api/challenges
 * Get all challenges with optional filtering
 */
export const getChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { difficulty, search, page = '1', limit = '20' } = req.query as {
    difficulty?: string;
    search?: string; // Optional search term for title/description
    page?: string;
    limit?: string;
  }


  // Pagination
  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 20, 100);
  const skip = (pageNum - 1) * limitNum;

  const where: {
    difficulty?: string;
    OR?: Array<{ title?: { contains: string; mode: 'insensitive' } } | { description?: { contains: string; mode: 'insensitive' } }>;
  } = {};
  if (difficulty) {
    where.difficulty = difficulty;
  }

  // If a search term is provided, filter challenges where the title OR description contains the term
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } }, // Case-insensitive title search
      { description: { contains: search, mode: 'insensitive' } }, // Case-insensitive description search
    ];
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

/**
 * GET /api/challenges/nearby
 * Get challenges within a specified radius of user's location
 * 
 * @query {number} latitude - User's latitude (-90 to 90)
 * @query {number} longitude - User's longitude (- 180 to 180)
 * @query {number} radius - Search radius in meters (default: 5000, max: 50000)
 * @query {number} page - Page number for pagination (default: 1)
 * @query {number} limit - Items per page (default: 20, max: 100)
 * 
 * @returns {PaginatedResponse<ChallengeWithDistance>} Challenges with distance field, sorted by proximity
 * @throws {AppError} 400 if validation fails
 */
export const getNearbyChallenges = asyncHandler(async (req: Request, res: Response) => {
  // Query params are validated and transformed by nearbyChallengesQuerySchema middleware
  const { latitude, longitude, radius, page, limit } = req.query as unknown as {
    latitude: number;
    longitude: number;
    radius: number;
    page: number;
    limit: number;
  };

  // Pagination
  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 20, 100);
  const radiusNum = Number(radius) || 5000;

  // Fetch all challenges from database
  const allChallenges = await prisma.challenge.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Calculate distance for each challenge and filter by radius
  const challengesWithDistance: ChallengeWithDistance[] = allChallenges
    .map((challenge: Challenge) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        challenge.latitude,
        challenge.longitude
      );

      return {
        ...challenge,
        distance,
      };
    })
    .filter((challenge: ChallengeWithDistance) => challenge.distance <= radiusNum)
    .sort((a: ChallengeWithDistance, b: ChallengeWithDistance) => a.distance - b.distance); // Sort by distance (closest first)

  // Apply pagination
  const total = challengesWithDistance.length;
  const totalPages = Math.ceil(total / limitNum);
  const skip = (pageNum - 1) * limitNum;
  const paginatedChallenges = challengesWithDistance.slice(skip, skip + limitNum);

  const response: PaginatedResponse<ChallengeWithDistance> = {
    success: true,
    data: paginatedChallenges,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  };

  res.json(response);
});