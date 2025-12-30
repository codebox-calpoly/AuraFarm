import { z } from 'zod';

// Define UserRole enum locally to match Prisma schema
export enum UserRole {
  user = 'user',
  admin = 'admin',
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  auraPoints: number;
  streak: number;
  lastCompletedAt: Date | null;
  createdAt: Date;
  role: UserRole;
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

export interface ChallengeWithDistance extends Challenge {
  distance: number; // Distance in meters from user's location
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

export const nearbyChallengesQuerySchema = z.object({
  latitude: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
  longitude: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
  radius: z.string().optional().default('5000').transform(Number).pipe(z.number().positive().max(50000)),
  page: z.string().optional().default('1').transform(Number).pipe(z.number().int().positive()),
  limit: z.string().optional().default('20').transform(Number).pipe(z.number().int().positive().max(100)),
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


// Response Schemas (for Swagger)
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  auraPoints: z.number(),
  streak: z.number(),
  lastCompletedAt: z.string().nullable().transform((str) => str ? new Date(str) : null), // Date comes as string in JSON
  createdAt: z.string().transform((str) => new Date(str)),
  role: z.enum(['user', 'admin']),
});

export const userProfileSchema = userSchema.extend({
  completionsCount: z.number(),
  rank: z.number().optional(),
});

export const challengeSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  difficulty: z.string(),
  pointsReward: z.number(),
  createdAt: z.string().transform((str) => new Date(str)),
});

export const challengeWithCompletionsSchema = challengeSchema.extend({
  completionsCount: z.number(),
});

export const challengeWithDistanceSchema = challengeSchema.extend({
  distance: z.number(),
});

export const challengeCompletionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  challengeId: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  completedAt: z.string().transform((str) => new Date(str)),
  user: userSchema.optional(),
  challenge: challengeSchema.optional(),
});

export const flagSchema = z.object({
  id: z.number(),
  completionId: z.number(),
  flaggedById: z.number(),
  reason: z.string().nullable(),
  createdAt: z.string().transform((str) => new Date(str)),
});

export const leaderboardEntrySchema = z.object({
  userId: z.number(),
  userName: z.string(),
  userEmail: z.string(),
  auraPoints: z.number(),
  streak: z.number(),
  rank: z.number(),
  completionsCount: z.number(),
});
