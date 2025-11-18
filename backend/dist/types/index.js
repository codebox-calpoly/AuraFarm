"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completionIdParamSchema = exports.challengeIdParamSchema = exports.userIdParamSchema = exports.idParamSchema = exports.queryParamsSchema = exports.updateUserSchema = exports.createChallengeSchema = exports.createFlagSchema = exports.createCompletionSchema = void 0;
const zod_1 = require("zod");
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
    page: zod_1.z.string().regex(/^\d+$/).transform(Number),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
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
