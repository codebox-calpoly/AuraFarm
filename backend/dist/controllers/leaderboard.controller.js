"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * GET /api/leaderboard
 * Get leaderboard sorted by aura points with completions count and rank
 */
exports.getLeaderboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pageNum = Math.max(1, Number(req.query.page ?? 1));
    const limitNum = Math.max(1, Number(req.query.limit ?? 20));
    const startIndex = (pageNum - 1) * limitNum;
    // total users
    const total = await prisma.user.count();
    // Group users by auraPoints to compute ranks efficiently (descending)
    const groups = await prisma.user.groupBy({
        by: ["auraPoints"],
        _count: { _all: true },
        orderBy: { auraPoints: "desc" },
    });
    // build map: auraPoints -> rank (dense ranking where ties get same rank)
    const rankMap = new Map();
    let cumulative = 0;
    for (const group of groups) {
        const auraPoints = group.auraPoints ?? 0;
        // rank is 1 + number of users with strictly greater auraPoints
        rankMap.set(auraPoints, cumulative + 1);
        cumulative += group._count._all;
    }
    // fetch paginated users ordered by auraPoints desc, include completions count
    const users = await prisma.user.findMany({
        orderBy: { auraPoints: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            auraPoints: true,
            streak: true,
            _count: {
                select: { completions: true },
            },
        },
        skip: startIndex,
        take: limitNum,
    });
    const data = users.map((u) => ({
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        auraPoints: u.auraPoints ?? 0,
        streak: u.streak ?? 0,
        completionsCount: u._count?.completions ?? 0,
        rank: rankMap.get(u.auraPoints ?? 0) ?? 0,
    }));
    const response = {
        success: true,
        data,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
    res.json(response);
});
