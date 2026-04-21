import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { LeaderboardEntry, PaginatedResponse } from "../types";
import { prisma } from "../prisma";
import { ChallengeReviewStatus } from "@prisma/client";
import { toJsonSafe } from "../utils/jsonSafe";

/**
 * DENSE_RANK over auraPoints DESC: each distinct score tier gets rank 1, 2, 3…
 * (Same formula as SQL DENSE_RANK() OVER (ORDER BY auraPoints DESC).)
 */
function buildDenseRankByAura(
  distinctDescending: { auraPoints: number }[]
): Map<number, number> {
  const map = new Map<number, number>();
  distinctDescending.forEach((row, index) => {
    map.set(row.auraPoints, index + 1);
  });
  return map;
}

export const getLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const pageNum = Math.max(1, Number(req.query.page ?? 1));
    const limitNum = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const startIndex = (pageNum - 1) * limitNum;

    // No $queryRaw — works cleanly with PgBouncer transaction mode and avoids
    // holding extra pooled connections. Rank map is one small DISTINCT query.
    const [total, distinctAurasDesc, pageRows] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.findMany({
        select: { auraPoints: true },
        distinct: ["auraPoints"],
        orderBy: { auraPoints: "desc" },
      }),
      prisma.user.findMany({
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
                where: { reviewStatus: ChallengeReviewStatus.approved },
              },
            },
          },
        },
      }),
    ]);

    const auraToRank = buildDenseRankByAura(distinctAurasDesc);

    const data: LeaderboardEntry[] = pageRows.map((u) => ({
      userId: u.id,
      userName: u.name,
      auraPoints: u.auraPoints,
      streak: u.streak,
      completionsCount: u._count.completions,
      rank: auraToRank.get(u.auraPoints) ?? 1,
    }));

    const response: PaginatedResponse<LeaderboardEntry> = {
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    };

    res.json(toJsonSafe(response));
  }
);
