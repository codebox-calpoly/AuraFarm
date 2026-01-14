import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';
import { prisma } from '../prisma';
import { AppError } from './errorHandler';
import { asyncHandler } from './asyncHandler';
import logger from '../utils/logger';
// Declare global user interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

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

export const authenticate = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    // Extract the token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify the token with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    // Check if verification failed
    if (error || !supabaseUser) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Get user from database using email
    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    // Check if user exists in database
    if (!user) {
      throw new AppError('User not found in database', 404);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as string,
    };

    // Continue to next middleware/controller
    next();
  } catch (error) {
    // Log auth error
    logger.error('Authentication failed', { error });

    // Handle errors
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
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

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if user is authenticated
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  // User is admin, continue
  next();
};
