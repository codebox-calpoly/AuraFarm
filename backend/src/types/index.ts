import { z } from 'zod';

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  auraPoints: number;
  streak: number;
  lastCompletedAt: Date | null;
  createdAt: Date;
}

export interface UserProfile extends User {
  completionsCount: number;
  rank?: number;
}

// Challenge Types
export interface Challenge {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  difficulty: string;
  pointsReward: number;
  createdAt: Date;
}

export interface ChallengeWithCompletions extends Challenge {
  completionsCount: number;
}

// Challenge Completion Types
export interface ChallengeCompletion {
  id: number;
  userId: number;
  challengeId: number;
  latitude: number;
  longitude: number;
  completedAt: Date;
  user?: User;
  challenge?: Challenge;
}

export interface CreateCompletionRequest {
  challengeId: number;
  latitude: number;
  longitude: number;
}

// Flag Types
export interface Flag {
  id: number;
  completionId: number;
  flaggedById: number;
  reason: string | null;
  createdAt: Date;
}

export interface CreateFlagRequest {
  completionId: number;
  reason?: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  userId: number;
  userName: string;
  userEmail: string;
  auraPoints: number;
  streak: number;
  rank: number;
  completionsCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Validation Schemas
export const createCompletionSchema = z.object({
  challengeId: z.number().int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const createFlagSchema = z.object({
  completionId: z.number().int().positive(),
  reason: z.string().optional(),
});

export const createChallengeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  pointsReward: z.number().int().positive(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const queryParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number),
  limit: z.string().regex(/^\d+$/).transform(Number),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const completionsListQuerySchema = z
  .object({
    userId: z.string().regex(/^\d+$/).transform((v: string) => Number(v)).optional(),
    challengeId: z.string().regex(/^\d+$/).transform((v: string) => Number(v)).optional(),

    startDate: z
      .string()
      .refine((v: string) => !isNaN(Date.parse(v)), { message: 'Invalid startDate' })
      .transform((v: string) => new Date(v))
      .optional(),

    endDate: z
      .string()
      .refine((v: string) => !isNaN(Date.parse(v)), { message: 'Invalid endDate' })
      .transform((v: string) => new Date(v))
      .optional(),

    page: z.string().regex(/^\d+$/).optional().default('1').transform((v: string) => Number(v)),
    limit: z.string().regex(/^\d+$/).optional().default('20').transform((v: string) => Number(v)),

    sortBy: z.enum(['completedAt']).optional().default('completedAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .superRefine((val: {
    startDate?: Date;
    endDate?: Date;
    limit: number;
  }, ctx: z.RefinementCtx) => {
    if (val.startDate && val.endDate && val.startDate > val.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'startDate must be before or equal to endDate',
        path: ['startDate'],
      });
    }

    if (val.limit < 1 || val.limit > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'limit must be between 1 and 100',
        path: ['limit'],
      });
    }
  });


// Param validation schemas
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const challengeIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const completionIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});


