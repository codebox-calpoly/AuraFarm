import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { supabaseAuth as supabase } from '../supabase';
import { prisma } from '../prisma';
import logger from '../utils/logger';

/**
 * POST /api/auth/signup
 * Registers a new user in Supabase Auth and creates a Prisma User record.
 *
 * Body: { email: string, password: string, username: string }
 */
export const signUp = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        throw new AppError('email, password, and username are required', 400);
    }

    // Enforce Cal Poly email domain
    if (!/.+@calpoly\.edu$/.test(email)) {
        throw new AppError('Email must be a @calpoly.edu address', 400);
    }

    if (username.length < 2 || username.length > 30) {
        throw new AppError('Username must be between 2 and 30 characters', 400);
    }

    if (password.length < 8 || password.length > 30) {
        throw new AppError('Password must be between 8 and 30 characters', 400);
    }

    // Check if email is already registered in Prisma (belt-and-suspenders)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError('An account with this email already exists', 409);
    }

    // Register with Supabase – sends OTP verification email automatically
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        logger.error('Supabase signUp error', { error });
        // Surface a friendly message
        if (error.message.toLowerCase().includes('already registered')) {
            throw new AppError('An account with this email already exists', 409);
        }
        throw new AppError(error.message || 'Sign up failed', 400);
    }

    if (!data.user) {
        throw new AppError('Sign up failed: no user returned', 500);
    }

    // Create the Prisma User row so the rest of the API can reference it
    const user = await prisma.user.create({
        data: {
            email,
            name: username,
        },
    });

    logger.info('New user signed up', { userId: user.id, email });

    res.status(201).json({
        success: true,
        message: 'Account created. Please check your email for the verification code.',
        data: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    });
});

/**
 * POST /api/auth/login
 * Signs in with email + password via Supabase and returns the session tokens.
 *
 * Body: { email: string, password: string }
 */
export const signIn = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('email and password are required', 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
        // Generic message to avoid leaking which part is wrong
        throw new AppError('Invalid email or password', 401);
    }

    // Fetch the Prisma user record for extra profile info
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, auraPoints: true, streak: true },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    logger.info('User logged in', { userId: user.id });

    res.json({
        success: true,
        data: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                auraPoints: user.auraPoints,
                streak: user.streak,
            },
        },
    });
});

/**
 * POST /api/auth/verify
 * Verifies the 6-digit OTP code emailed during sign up.
 *
 * Body: { email: string, token: string }
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, token } = req.body;

    if (!email || !token) {
        throw new AppError('email and token are required', 400);
    }

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
    });

    if (error || !data.session) {
        logger.warn('OTP verification failed', { email, error });
        throw new AppError('Invalid or expired verification code', 400);
    }

    // Fetch the Prisma user now that they are verified
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, auraPoints: true, streak: true },
    });

    if (!user) {
        throw new AppError('User not found after verification', 404);
    }

    logger.info('User email verified', { userId: user.id });

    res.json({
        success: true,
        message: 'Email verified successfully.',
        data: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                auraPoints: user.auraPoints,
                streak: user.streak,
            },
        },
    });
});
