"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChallenge = exports.getChallengeById = exports.getChallenges = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
// Mock data - will be replaced with Prisma queries once database is connected
const mockChallenges = [
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
exports.getChallenges = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
    const response = {
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
exports.getChallengeById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const challengeId = parseInt(id);
    if (isNaN(challengeId)) {
        throw new errorHandler_1.AppError('Invalid challenge ID', 400);
    }
    const challenge = mockChallenges.find(c => c.id === challengeId);
    if (!challenge) {
        throw new errorHandler_1.AppError('Challenge not found', 404);
    }
    // Mock completions count
    const challengeWithCompletions = {
        ...challenge,
        completionsCount: Math.floor(Math.random() * 50),
    };
    const response = {
        success: true,
        data: challengeWithCompletions,
    };
    res.json(response);
});
/**
 * POST /api/challenges
 * Create a new challenge (admin only - placeholder)
 */
exports.createChallenge = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Add authentication middleware to check admin role
    const { title, description, latitude, longitude, difficulty, pointsReward } = req.body;
    const newChallenge = {
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
    const response = {
        success: true,
        data: newChallenge,
        message: 'Challenge created successfully',
    };
    res.status(201).json(response);
});
