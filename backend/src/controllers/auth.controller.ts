import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { supabase } from '../supabase';
import { prisma } from '../prisma';
import logger from '../utils/logger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const signUp = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail || !password || !username) {
        throw new AppError('email, password, and username are required', 400);
    }

    if (!/.+@calpoly\.edu$/.test(normalizedEmail)) {
        throw new AppError('Email must be a @calpoly.edu address', 400);
    }

    if (username.length < 2 || username.length > 30) {
        throw new AppError('Username must be between 2 and 30 characters', 400);
    }

    if (password.length < 8 || password.length > 30) {
        throw new AppError('Password must be between 8 and 30 characters', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
        throw new AppError('An account with this email already exists', 409);
    }

    const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });

    if (error) {
        logger.error('Supabase signUp error', { error });
        if (error.message.toLowerCase().includes('already registered')) {
            throw new AppError('An account with this email already exists', 409);
        }
        if (error.message.toLowerCase().includes('invalid') && error.message.toLowerCase().includes('api key')) {
            throw new AppError('Supabase is misconfigured. Check SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_KEY) in backend/.env.', 500);
        }
        throw new AppError(error.message || 'Sign up failed', 400);
    }

    const supabaseUserId = data.user?.id;
    if (!supabaseUserId) {
        throw new AppError('Sign up failed: no user returned', 500);
    }

    try {
        const user = await prisma.user.create({
            data: {
                supabaseId: supabaseUserId,
                email: normalizedEmail,
                name: username,
            },
        });

        logger.info('New user signed up', { userId: user.id, email: normalizedEmail });

        res.status(201).json({
            success: true,
            message: 'Account created. Please check your email for the verification code.',
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (dbError) {
        logger.error('Failed to create Prisma user after Supabase signup', { error: dbError, supabaseUserId, email: normalizedEmail });
        await supabase.auth.admin.deleteUser(supabaseUserId).catch((cleanupError) => {
            logger.error('Failed to roll back Supabase user after Prisma create failure', { error: cleanupError, supabaseUserId });
        });

        if (dbError instanceof PrismaClientKnownRequestError && dbError.code === 'P2002') {
            throw new AppError('An account with this email already exists', 409);
        }

        throw new AppError('Failed to complete sign up', 500);
    }
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail || !password) {
        throw new AppError('email and password are required', 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (error || !data.session) {
        if (error?.message?.toLowerCase().includes('invalid') && error?.message?.toLowerCase().includes('api key')) {
            throw new AppError('Supabase is misconfigured. Check SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env.', 500);
        }
        throw new AppError('Invalid email or password', 401);
    }

    const supabaseUserId = data.user?.id;
    if (!supabaseUserId) {
        throw new AppError('User not found', 404);
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { supabaseId: supabaseUserId },
                { email: normalizedEmail },
            ],
        },
        select: { id: true, email: true, name: true, auraPoints: true, streak: true, supabaseId: true },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!user.supabaseId) {
        await prisma.user.update({
            where: { id: user.id },
            data: { supabaseId: supabaseUserId },
        }).catch((syncError) => logger.warn('Failed to backfill Supabase user id during sign in', { error: syncError, userId: user.id }));
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

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, token } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail || !token) {
        throw new AppError('email and token are required', 400);
    }

    const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token,
        type: 'signup',
    });

    if (error || !data.session) {
        logger.warn('OTP verification failed', { email: normalizedEmail, error });
        if (error?.message?.toLowerCase().includes('invalid') && error?.message?.toLowerCase().includes('api key')) {
            throw new AppError('Supabase is misconfigured. Check backend/.env.', 500);
        }
        throw new AppError('Invalid or expired verification code', 400);
    }

    const supabaseUserId = data.user?.id;
    if (!supabaseUserId) {
        throw new AppError('User not found after verification', 404);
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { supabaseId: supabaseUserId },
                { email: normalizedEmail },
            ],
        },
        select: { id: true, email: true, name: true, auraPoints: true, streak: true, supabaseId: true },
    });

    if (!user) {
        throw new AppError('User not found after verification', 404);
    }

    if (!user.supabaseId) {
        await prisma.user.update({
            where: { id: user.id },
            data: { supabaseId: supabaseUserId },
        }).catch((syncError) => logger.warn('Failed to backfill Supabase user id during verification', { error: syncError, userId: user.id }));
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

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail) {
        throw new AppError('email is required', 400);
    }

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
    });

    if (error) {
        logger.warn('Resend OTP failed', { email: normalizedEmail, error });
        if (error?.message?.toLowerCase().includes('invalid') && error?.message?.toLowerCase().includes('api key')) {
            throw new AppError('Supabase is misconfigured. Check backend/.env.', 500);
        }
        throw new AppError('Could not resend code. Please try again.', 400);
    }

    res.json({
        success: true,
        message: 'A new code has been sent to your email.',
    });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new AppError('oldPassword and newPassword are required', 400);
    }

    if (newPassword.length < 8 || newPassword.length > 30) {
        throw new AppError('New password must be between 8 and 30 characters', 400);
    }

    if (!req.user) {
        throw new AppError('Authentication required', 401);
    }

    const userEmail = req.user.email;
    if (!userEmail) {
        throw new AppError('Cannot determine user email', 401);
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: oldPassword,
    });

    if (verifyError) {
        throw new AppError('Current password is incorrect', 400);
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
        req.user.supabaseId,
        { password: newPassword }
    );

    if (updateError) {
        logger.error('Password update failed', { error: updateError });
        throw new AppError('Failed to update password. Please try again.', 500);
    }

    logger.info('Password changed', { userId: req.user.id });

    res.json({ success: true, message: 'Password updated successfully.' });
});
