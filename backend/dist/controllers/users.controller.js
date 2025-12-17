"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCompletions = exports.updateCurrentUser = exports.getCurrentUser = exports.getUserById = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
// Mock data - will be replaced with Prisma queries once database is connected
const mockUsers = [
    {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
        role: types_1.UserRole.user,
        auraPoints: 150,
        streak: 5,
        lastCompletedAt: new Date('2024-01-20'),
        createdAt: new Date('2024-01-01'),
    },
    {
        id: 2,
        email: 'user2@example.com',
        name: 'Jane Smith',
        role: types_1.UserRole.user,
        auraPoints: 200,
        streak: 10,
        lastCompletedAt: new Date('2024-01-21'),
        createdAt: new Date('2024-01-02'),
    },
];
/**
 * GET /api/users/:id
 * Get user profile by ID
 */
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new errorHandler_1.AppError('Invalid user ID', 400);
    }
    // TODO: Get userId from authentication middleware and verify access
    // TODO: Replace with Prisma query: prisma.user.findUnique({ where: { id: userId }, include: { completions: true } })
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Mock completions count
    const userProfile = {
        ...user,
        completionsCount: Math.floor(Math.random() * 20),
    };
    const response = {
        success: true,
        data: userProfile,
    };
    res.json(response);
});
/**
 * GET /api/users/me
 * Get current user's profile
 */
exports.getCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Get userId from authentication middleware
    const userId = 1; // Placeholder
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    const userProfile = {
        ...user,
        completionsCount: Math.floor(Math.random() * 20),
    };
    const response = {
        success: true,
        data: userProfile,
    };
    res.json(response);
});
/**
 * PATCH /api/users/me
 * Update current user's profile
 */
exports.updateCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Get userId from authentication middleware
    const userId = 1; // Placeholder
    const { name } = req.body;
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Update user
    if (name) {
        user.name = name;
    }
    const response = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
    };
    res.json(response);
});
/**
 * GET /api/users/:id/completions
 * Get all completions for a specific user
 */
exports.getUserCompletions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
        throw new errorHandler_1.AppError('Invalid user ID', 400);
    }
    // TODO: Get userId from authentication middleware and verify access
    // TODO: Replace with Prisma query:
    // prisma.challengeCompletion.findMany({
    //   where: { userId },
    //   include: { challenge: true },
    //   orderBy: { completedAt: 'desc' }
    // })
    // Verify user exists
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    // Mock completions - in real implementation, fetch from database
    const mockCompletions = [
        {
            id: 1,
            userId,
            challengeId: 1,
            latitude: 37.7749,
            longitude: -122.4194,
            completedAt: new Date('2024-01-20'),
        },
        {
            id: 2,
            userId,
            challengeId: 2,
            latitude: 37.7849,
            longitude: -122.4094,
            completedAt: new Date('2024-01-19'),
        },
    ];
    const response = {
        success: true,
        data: mockCompletions,
    };
    res.json(response);
});
