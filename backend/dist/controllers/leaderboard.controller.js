"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const prisma_1 = require("../prisma");
const client_1 = require("@prisma/client");
const jsonSafe_1 = require("../utils/jsonSafe");
/**
 * DENSE_RANK over auraPoints DESC: each distinct score tier gets rank 1, 2, 3…
 * (Same formula as SQL DENSE_RANK() OVER (ORDER BY auraPoints DESC).)
 */
function buildDenseRankByAura(distinctDescending) {
    const map = new Map();
    distinctDescending.forEach((row, index) => {
        map.set(row.auraPoints, index + 1);
    });
    return map;
}
exports.getLeaderboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pageNum = Math.max(1, Number(req.query.page ?? 1));
    const limitNum = Math.max(1, Number(req.query.limit ?? 20));
    const startIndex = (pageNum - 1) * limitNum;
    // No $queryRaw — works cleanly with PgBouncer transaction mode and avoids
    // holding extra pooled connections. Rank map is one small DISTINCT query.
    const [total, distinctAurasDesc, pageRows] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.user.findMany({
            select: { auraPoints: true },
            distinct: ["auraPoints"],
            orderBy: { auraPoints: "desc" },
        }),
        prisma_1.prisma.user.findMany({
            orderBy: [{ auraPoints: "desc" }, { id: "asc" }],
            skip: startIndex,
            take: limitNum,
            select: {
                id: true,
                name: true,
                auraPoints: true,
                streak: true,
                _count: {
                    select: {
                        completions: {
                            where: { reviewStatus: client_1.ChallengeReviewStatus.approved },
                        },
                    },
                },
            },
        }),
    ]);
    const auraToRank = buildDenseRankByAura(distinctAurasDesc);
    const data = pageRows.map((u) => ({
        userId: u.id,
        userName: u.name,
        auraPoints: u.auraPoints,
        streak: u.streak,
        completionsCount: u._count.completions,
        rank: auraToRank.get(u.auraPoints) ?? 1,
    }));
    const response = {
        success: true,
        data,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.max(1, Math.ceil(total / limitNum)),
        },
    };
    res.json((0, jsonSafe_1.toJsonSafe)(response));
});
