"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = exports.optionalAuthenticate = void 0;
const supabase_1 = require("../supabase");
const prisma_1 = require("../prisma");
const errorHandler_1 = require("./errorHandler");
const asyncHandler_1 = require("./asyncHandler");
const logger_1 = __importDefault(require("../utils/logger"));
async function lookupUserFromSupabaseUser(supabaseUser) {
    const email = supabaseUser.email?.toLowerCase() ?? null;
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            OR: [
                { supabaseId: supabaseUser.id },
                ...(email ? [{ email }] : []),
            ],
        },
        select: {
            id: true,
            email: true,
            role: true,
            supabaseId: true,
        },
    });
    if (!user)
        return null;
    if (user.supabaseId !== supabaseUser.id) {
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { supabaseId: supabaseUser.id },
        }).catch((syncError) => {
            logger_1.default.warn('Failed to backfill Supabase user id', { error: syncError, userId: user.id });
        });
    }
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        supabaseId: supabaseUser.id,
    };
}
/**
 * If Authorization Bearer is present and valid, attaches req.user.
 * Invalid/missing user: leaves req.user unset (no throw).
 */
exports.optionalAuthenticate = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            next();
            return;
        }
        const token = authHeader.substring(7);
        const { data: { user: supabaseUser }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !supabaseUser) {
            next();
            return;
        }
        const user = await lookupUserFromSupabaseUser(supabaseUser);
        if (user) {
            req.user = user;
        }
        next();
    }
    catch {
        next();
    }
});
/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
exports.authenticate = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('No token provided', 401);
        }
        const token = authHeader.substring(7);
        const { data: { user: supabaseUser }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !supabaseUser) {
            throw new errorHandler_1.AppError('Invalid or expired token', 401);
        }
        const user = await lookupUserFromSupabaseUser(supabaseUser);
        if (!user) {
            throw new errorHandler_1.AppError('User not found in database', 404);
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication failed', { error });
        if (error instanceof errorHandler_1.AppError) {
            next(error);
        }
        else {
            next(new errorHandler_1.AppError('Authentication failed', 401));
        }
    }
});
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new errorHandler_1.AppError('Authentication required', 401));
    }
    if (req.user.role !== 'admin') {
        return next(new errorHandler_1.AppError('Admin access required', 403));
    }
    next();
};
exports.requireAdmin = requireAdmin;
