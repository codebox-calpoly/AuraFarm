"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardEntrySchema = exports.flagSchema = exports.challengeCompletionSchema = exports.challengeWithDistanceSchema = exports.challengeWithCompletionsSchema = exports.challengeSchema = exports.userProfileSchema = exports.userSchema = exports.completionIdParamSchema = exports.challengeIdParamSchema = exports.userIdParamSchema = exports.idParamSchema = exports.completionsListQuerySchema = exports.nearbyChallengesQuerySchema = exports.queryParamsSchema = exports.updateUserSchema = exports.createChallengeSchema = exports.createFlagSchema = exports.createCompletionSchema = exports.UserRole = void 0;
const zod_1 = require("zod");
// Define UserRole enum locally to match Prisma schema
var UserRole;
(function (UserRole) {
    UserRole["user"] = "user";
    UserRole["admin"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
// Validation Schemas
exports.createCompletionSchema = zod_1.z.object({
    challengeId: zod_1.z.number().int().positive(),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
});
exports.createFlagSchema = zod_1.z.object({
    completionId: zod_1.z.number().int().positive(),
    reason: zod_1.z.string().optional(),
});
exports.createChallengeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().min(1).max(1000),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']),
    pointsReward: zod_1.z.number().int().positive(),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
});
exports.queryParamsSchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
    // Search by title or description (max 100 chars)
    search: zod_1.z.string().min(1).max(100).optional(),
});
exports.nearbyChallengesQuerySchema = zod_1.z.object({
    latitude: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(-90).max(90)),
    longitude: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(-180).max(180)),
    radius: zod_1.z.string().optional().default('5000').transform(Number).pipe(zod_1.z.number().positive().max(50000)),
    page: zod_1.z.string().optional().default('1').transform(Number).pipe(zod_1.z.number().int().positive()),
    limit: zod_1.z.string().optional().default('20').transform(Number).pipe(zod_1.z.number().int().positive().max(100)),
});
exports.completionsListQuerySchema = zod_1.z
    .object({
    userId: zod_1.z.string().regex(/^\d+$/).transform((v) => Number(v)).optional(),
    challengeId: zod_1.z.string().regex(/^\d+$/).transform((v) => Number(v)).optional(),
    startDate: zod_1.z
        .string()
        .refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid startDate' })
        .transform((v) => new Date(v))
        .optional(),
    endDate: zod_1.z
        .string()
        .refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid endDate' })
        .transform((v) => new Date(v))
        .optional(),
    page: zod_1.z.string().regex(/^\d+$/).optional().default('1').transform((v) => Number(v)),
    limit: zod_1.z.string().regex(/^\d+$/).optional().default('20').transform((v) => Number(v)),
    sortBy: zod_1.z.enum(['completedAt']).optional().default('completedAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
})
    .superRefine((val, ctx) => {
    if (val.startDate && val.endDate && val.startDate > val.endDate) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'startDate must be before or equal to endDate',
            path: ['startDate'],
        });
    }
    if (val.limit < 1 || val.limit > 100) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'limit must be between 1 and 100',
            path: ['limit'],
        });
    }
});
// Param validation schemas
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
exports.userIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
exports.challengeIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
exports.completionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
// Response Schemas (for Swagger)
exports.userSchema = zod_1.z.object({
    id: zod_1.z.number(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    auraPoints: zod_1.z.number(),
    streak: zod_1.z.number(),
    lastCompletedAt: zod_1.z.string().nullable().transform((str) => str ? new Date(str) : null), // Date comes as string in JSON
    createdAt: zod_1.z.string().transform((str) => new Date(str)),
    role: zod_1.z.enum(['user', 'admin']),
});
exports.userProfileSchema = exports.userSchema.extend({
    completionsCount: zod_1.z.number(),
    rank: zod_1.z.number().optional(),
});
exports.challengeSchema = zod_1.z.object({
    id: zod_1.z.number(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    difficulty: zod_1.z.string(),
    pointsReward: zod_1.z.number(),
    createdAt: zod_1.z.string().transform((str) => new Date(str)),
});
exports.challengeWithCompletionsSchema = exports.challengeSchema.extend({
    completionsCount: zod_1.z.number(),
});
exports.challengeWithDistanceSchema = exports.challengeSchema.extend({
    distance: zod_1.z.number(),
});
exports.challengeCompletionSchema = zod_1.z.object({
    id: zod_1.z.number(),
    userId: zod_1.z.number(),
    challengeId: zod_1.z.number(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    completedAt: zod_1.z.string().transform((str) => new Date(str)),
    user: exports.userSchema.optional(),
    challenge: exports.challengeSchema.optional(),
});
exports.flagSchema = zod_1.z.object({
    id: zod_1.z.number(),
    completionId: zod_1.z.number(),
    flaggedById: zod_1.z.number(),
    reason: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string().transform((str) => new Date(str)),
});
exports.leaderboardEntrySchema = zod_1.z.object({
    userId: zod_1.z.number(),
    userName: zod_1.z.string(),
    userEmail: zod_1.z.string(),
    auraPoints: zod_1.z.number(),
    streak: zod_1.z.number(),
    rank: zod_1.z.number(),
    completionsCount: zod_1.z.number(),
});
