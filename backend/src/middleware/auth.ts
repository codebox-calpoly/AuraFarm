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
        supabaseId: string;
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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      throw new AppError('Invalid or expired token', 401);
    }

    const email = supabaseUser.email?.toLowerCase() ?? null;
    const user = await prisma.user.findFirst({
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

    if (!user) {
      throw new AppError('User not found in database', 404);
    }

    if (user.supabaseId !== supabaseUser.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseId: supabaseUser.id },
      }).catch((syncError) => {
        logger.warn('Failed to backfill Supabase user id', { error: syncError, userId: user.id });
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as string,
      supabaseId: supabaseUser.id,
    };

    next();
  } catch (error) {
    logger.error('Authentication failed', { error });

    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
});

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  next();
};
