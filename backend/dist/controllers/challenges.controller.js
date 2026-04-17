"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyChallenges = exports.getChallengeById = exports.createChallenge = exports.getChallenges = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
/**
 * GET /api/challenges
 * Get all challenges with optional filtering
 */
exports.getChallenges = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { difficulty, search, category, page = '1', limit = '20' } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Number(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (difficulty) {
        where.difficulty = difficulty;
    }
    if (category) {
        where.tags = { has: category };
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [total, challenges] = await Promise.all([
        prisma_1.prisma.challenge.count({ where }),
        prisma_1.prisma.challenge.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
        }),
    ]);
    const response = {
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
 * POST /api/challenges
 * Create a new challenge (admin only)
 */
exports.createChallenge = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, photoGuidelines, latitude, longitude, difficulty, pointsReward, tags } = req.body;
    try {
        const newChallenge = await prisma_1.prisma.challenge.create({
            data: {
                title,
                description,
                photoGuidelines: typeof photoGuidelines === 'string' ? photoGuidelines : '',
                latitude,
                longitude,
                difficulty,
                pointsReward,
                tags,
            },
        });
        const response = {
            success: true,
            data: newChallenge,
            message: 'Challenge created successfully',
        };
        res.status(201).json(response);
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new errorHandler_1.AppError('A challenge with this title already exists', 409);
        }
        throw error;
    }
});
/**
 * GET /api/challenges/:id
 * Get a specific challenge by ID
 */
exports.getChallengeById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const challengeId = parseInt(id);
    if (isNaN(challengeId)) {
        throw new errorHandler_1.AppError('Invalid challenge ID', 400);
    }
    const challenge = await prisma_1.prisma.challenge.findUnique({
        where: { id: challengeId },
    });
    if (!challenge) {
        throw new errorHandler_1.AppError('Challenge not found', 404);
    }
    const completionsCount = await prisma_1.prisma.challengeCompletion.count({
        where: { challengeId },
    });
    const challengeWithCompletions = {
        ...challenge,
        completionsCount,
    };
    const response = {
        success: true,
        data: challengeWithCompletions,
    };
    res.json(response);
});
/**
 * GET /api/challenges/nearby
 * Get challenges within a specified radius of user's location
 */
exports.getNearbyChallenges = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { latitude, longitude, radius, page, limit } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Number(limit) || 20, 100);
    const radiusNum = Number(radius) || 5000;
    const skip = (pageNum - 1) * limitNum;
    const earthRadius = 6371000;
    const latDelta = (radiusNum / earthRadius) * (180 / Math.PI);
    const lonDelta = (radiusNum / (earthRadius * Math.max(Math.cos((latitude * Math.PI) / 180), 0.000001))) * (180 / Math.PI);
    const countRows = await prisma_1.prisma.$queryRaw(client_1.Prisma.sql `
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
    const rows = await prisma_1.prisma.$queryRaw(client_1.Prisma.sql `
    WITH challenge_distances AS (
      SELECT
        c.id,
        c.title,
        c.description,
        c."photoGuidelines",
        c.latitude,
        c.longitude,
        c.difficulty,
        c."pointsReward",
        c."tags",
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
    const response = {
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
