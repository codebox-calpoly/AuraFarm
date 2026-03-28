import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { Challenge, ChallengeWithCompletions, ChallengeWithDistance, ApiResponse, PaginatedResponse } from '../types';
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


/**
 * GET /api/challenges
 * Get all challenges with optional filtering
 */
export const getChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { difficulty, search, page = '1', limit = '20' } = req.query as {
    difficulty?: string;
    search?: string;
    page?: string;
    limit?: string;
  }

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

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
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
 * GET /api/challenges/nearby
 * Get challenges within a specified radius of user's location
 */
export const getNearbyChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius, page, limit } = req.query as unknown as {
    latitude: number;
    longitude: number;
    radius: number;
    page: number;
    limit: number;
  };

  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 20, 100);
  const radiusNum = Number(radius) || 5000;
  const skip = (pageNum - 1) * limitNum;

  const earthRadius = 6371000;
  const latDelta = (radiusNum / earthRadius) * (180 / Math.PI);
  const lonDelta = (radiusNum / (earthRadius * Math.max(Math.cos((latitude * Math.PI) / 180), 0.000001))) * (180 / Math.PI);

  const countRows = await prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
    WITH challenge_distances AS (
      SELECT
        c.id,
        6371000 * 2 * ASIN(SQRT(
          POWER(SIN(RADIANS(c.latitude - ${latitude}) / 2), 2) +
          COS(RADIANS(${latitude})) * COS(RADIANS(c.latitude)) *
          POWER(SIN(RADIANS(c.longitude - ${longitude}) / 2), 2)
        )) AS distance
      FROM "Challenge" c
      WHERE c.latitude BETWEEN ${latitude - latDelta} AND ${latitude + latDelta}
        AND c.longitude BETWEEN ${longitude - lonDelta} AND ${longitude + lonDelta}
    )
    SELECT COUNT(*)::bigint AS total
    FROM challenge_distances
    WHERE distance <= ${radiusNum}
  `);

  const total = Number(countRows[0]?.total ?? 0);

  const rows = await prisma.$queryRaw<Array<ChallengeWithDistance>>(Prisma.sql`
    WITH challenge_distances AS (
      SELECT
        c.id,
        c.title,
        c.description,
        c.latitude,
        c.longitude,
        c.difficulty,
        c."pointsReward",
        c."createdAt",
        6371000 * 2 * ASIN(SQRT(
          POWER(SIN(RADIANS(c.latitude - ${latitude}) / 2), 2) +
          COS(RADIANS(${latitude})) * COS(RADIANS(c.latitude)) *
          POWER(SIN(RADIANS(c.longitude - ${longitude}) / 2), 2)
        )) AS distance
      FROM "Challenge" c
      WHERE c.latitude BETWEEN ${latitude - latDelta} AND ${latitude + latDelta}
        AND c.longitude BETWEEN ${longitude - lonDelta} AND ${longitude + lonDelta}
    )
    SELECT *
    FROM challenge_distances
    WHERE distance <= ${radiusNum}
    ORDER BY distance ASC, "createdAt" DESC
    LIMIT ${limitNum} OFFSET ${skip}
  `);

  const response: PaginatedResponse<ChallengeWithDistance> = {
    success: true,
    data: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };

  res.json(response);
});
