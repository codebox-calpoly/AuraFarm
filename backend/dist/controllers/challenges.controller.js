"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChallenge = exports.getChallengeById = exports.getChallenges = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../prisma");
const library_1 = require("@prisma/client/runtime/library");
/**
 * GET /api/challenges
 * Get all challenges with optional filtering
 */
exports.getChallenges = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { difficulty, page = '1', limit = '20' } = req.query;
    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Math.min(Number(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (difficulty) {
        where.difficulty = difficulty;
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
    // Get real completions count from database
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
exports.createChallenge = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, latitude, longitude, difficulty, pointsReward } = req.body;
    try {
        const newChallenge = await prisma_1.prisma.challenge.create({
            data: {
                title,
                description,
                latitude,
                longitude,
                difficulty,
                pointsReward,
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
            // unique constraint violation
            throw new errorHandler_1.AppError('A challenge with this title already exists', 409);
        }
        throw error;
    }
});
