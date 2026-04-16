import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { LeaderboardEntry, PaginatedResponse } from "../types";
import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { toJsonSafe } from "../utils/jsonSafe";

export const getLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const pageNum = Math.max(1, Number(req.query.page ?? 1));
    const limitNum = Math.max(1, Number(req.query.limit ?? 20));
    const startIndex = (pageNum - 1) * limitNum;

    // Single round-trip: Supabase Session pooler has a low max client limit; avoid
    // a separate count() query that doubles connections per leaderboard request.
    const rows = await prisma.$queryRaw<Array<{
      userId: number;
      userName: string;
      auraPoints: number;
      streak: number;
      completionsCount: number;
      rank: number;
      totalUsers: bigint;
    }>>(Prisma.sql`
      WITH ranked_users AS (
        SELECT
          u.id AS "userId",
          u.name AS "userName",
          COALESCE(u."auraPoints", 0) AS "auraPoints",
          COALESCE(u.streak, 0) AS streak,
          COUNT(cc.id)::int AS "completionsCount",
          (DENSE_RANK() OVER (ORDER BY COALESCE(u."auraPoints", 0) DESC))::int AS rank
        FROM "User" u
        LEFT JOIN "ChallengeCompletion" cc ON cc."userId" = u.id
        GROUP BY u.id
      ),
      tot AS (SELECT COUNT(*)::bigint AS c FROM "User")
      SELECT
        r."userId",
        r."userName",
        r."auraPoints",
        r.streak,
        r."completionsCount",
        r.rank,
        tot.c AS "totalUsers"
      FROM ranked_users r
      CROSS JOIN tot
      ORDER BY r."auraPoints" DESC, r."userId" ASC
      LIMIT ${limitNum} OFFSET ${startIndex}
    `);

    const total = rows.length > 0 ? Number(rows[0].totalUsers) : 0;

    // Raw SQL can return bigint for rank/counts — JSON cannot serialize BigInt.
    const data: LeaderboardEntry[] = rows.map((row) => ({
      userId: Number(row.userId),
      userName: row.userName,
      auraPoints: Number(row.auraPoints),
      streak: Number(row.streak),
      completionsCount: Number(row.completionsCount),
      rank: Number(row.rank),
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
