"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const supabase_1 = require("../supabase");
const prisma_1 = require("../prisma");
const errorHandler_1 = require("./errorHandler");
const asyncHandler_1 = require("./asyncHandler");
/**
 * Authentication middleware - verifies JWT token and attaches user to request
 *
 * Extracts JWT token from Authorization header, verifies it with Supabase,
 * and looks up the user in the database. Attaches user info to req.user
 * for use in subsequent middleware and controllers.
 *
 * @middleware
 * @throws {AppError} 401 if no token provided
 * @throws {AppError} 401 if token is invalid or expired
 * @throws {AppError} 404 if user not found in database
 */
exports.authenticate = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        // Get the authorization header
        const authHeader = req.headers.authorization;
        // Check if header exists and has correct format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('No token provided', 401);
        }
        // Extract the token (remove 'Bearer ' prefix)
        const token = authHeader.substring(7);
        // Verify the token with Supabase
        const { data: { user: supabaseUser }, error } = await supabase_1.supabase.auth.getUser(token);
        // Check if verification failed
        if (error || !supabaseUser) {
            throw new errorHandler_1.AppError('Invalid or expired token', 401);
        }
        // Get user from database using email
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: supabaseUser.email },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
        // Check if user exists in database
        if (!user) {
            throw new errorHandler_1.AppError('User not found in database', 404);
        }
        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        // Continue to next middleware/controller
        next();
    }
    catch (error) {
        // Handle errors
        if (error instanceof errorHandler_1.AppError) {
            next(error);
        }
        else {
            next(new errorHandler_1.AppError('Authentication failed', 401));
        }
    }
});
/**
 * Authorization middleware - verifies user has admin role
 *
 * Must be used after authenticate middleware. Checks if req.user exists
 * and has role === 'admin'. Returns 403 Forbidden if user is not admin.
 *
 * @middleware
 * @throws {AppError} 401 if user not authenticated
 * @throws {AppError} 403 if user is not admin
 */
const requireAdmin = (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
        return next(new errorHandler_1.AppError('Authentication required', 401));
    }
    // Check if user has admin role
    if (req.user.role !== 'admin') {
        return next(new errorHandler_1.AppError('Admin access required', 403));
    }
    // User is admin, continue
    next();
};
exports.requireAdmin = requireAdmin;
