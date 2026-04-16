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

async function lookupUserFromSupabaseUser(supabaseUser: {
  id: string;
  email?: string | null;
}): Promise<{
  id: number;
  email: string;
  role: string;
  supabaseId: string;
} | null> {
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

  if (!user) return null;

  if (user.supabaseId !== supabaseUser.id) {
    await prisma.user.update({
      where: { id: user.id },
      data: { supabaseId: supabaseUser.id },
    }).catch((syncError) => {
      logger.warn('Failed to backfill Supabase user id', { error: syncError, userId: user.id });
    });
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as string,
    supabaseId: supabaseUser.id,
  };
}

/**
 * If Authorization Bearer is present and valid, attaches req.user.
 * Invalid/missing user: leaves req.user unset (no throw).
 */
export const optionalAuthenticate = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      next();
      return;
    }

    const user = await lookupUserFromSupabaseUser(supabaseUser);
    if (user) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
});

/**
 * Authentication middleware - verifies JWT token and attaches user to request
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

    const user = await lookupUserFromSupabaseUser(supabaseUser);

    if (!user) {
      throw new AppError('User not found in database', 404);
    }

    req.user = user;

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
