"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
// Mock data - will be replaced with Prisma queries once database is connected
const mockLeaderboard = [
    {
        userId: 2,
        userName: 'Jane Smith',
        userEmail: 'user2@example.com',
        auraPoints: 200,
        streak: 10,
        rank: 1,
        completionsCount: 15,
    },
    {
        userId: 1,
        userName: 'John Doe',
        userEmail: 'user@example.com',
        auraPoints: 150,
        streak: 5,
        rank: 2,
        completionsCount: 10,
    },
];
/**
 * GET /api/leaderboard
 * Get leaderboard sorted by aura points
 */
exports.getLeaderboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    // TODO: Replace with Prisma query:
    // prisma.user.findMany({
    //   orderBy: { auraPoints: 'desc' },
    //   select: { id, name, email, auraPoints, streak, completions: { count: true } },
    //   skip: (page - 1) * limit,
    //   take: limit,
    // })
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginated = mockLeaderboard.slice(startIndex, endIndex);
    const response = {
        success: true,
        data: paginated,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total: mockLeaderboard.length,
            totalPages: Math.ceil(mockLeaderboard.length / limitNum),
        },
    };
    res.json(response);
});
