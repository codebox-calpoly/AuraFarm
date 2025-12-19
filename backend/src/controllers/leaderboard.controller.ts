import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { LeaderboardEntry, PaginatedResponse } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/leaderboard
 * Get leaderboard sorted by aura points with completions count and rank
 */
export const getLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
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
    const rankMap = new Map<number, number>();
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

    const data: LeaderboardEntry[] = users.map((u: any) => ({
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      auraPoints: u.auraPoints ?? 0,
      streak: u.streak ?? 0,
      completionsCount: u._count?.completions ?? 0,
      rank: rankMap.get(u.auraPoints ?? 0) ?? 0,
    }));

    const response: PaginatedResponse<LeaderboardEntry> = {
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
  }
);
