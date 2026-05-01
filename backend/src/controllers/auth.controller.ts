import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { supabase, supabaseAdmin } from '../supabase';
import { prisma } from '../prisma';
import logger from '../utils/logger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
    OTP_MAX_ATTEMPTS,
    OTP_TTL_MS,
    generateOtp,
    hashOtp,
    timingSafeEqualHex,
} from '../utils/otp';
import { sendVerificationEmail } from '../utils/email';

/**
 * Generate, persist, and email a fresh 6-digit OTP for `email`.
 * Replaces any existing pending verification for that address.
 */
async function issueAndSendOtp(email: string): Promise<void> {
    const code = generateOtp();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.emailVerification.upsert({
        where: { email },
        create: { email, codeHash, expiresAt, attempts: 0 },
        update: { codeHash, expiresAt, attempts: 0 },
    });

    try {
        await sendVerificationEmail(email, code);
    } catch (err) {
        logger.error('Failed to send verification email', { error: err, email });
        throw new AppError('Could not send verification email. Please try again.', 502);
    }
}

export const signUp = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim();

    if (!normalizedEmail || !password || !normalizedUsername) {
        throw new AppError('email, password, and username are required', 400);
    }

    if (!/.+@calpoly\.edu$/.test(normalizedEmail)) {
        throw new AppError('Email must be a @calpoly.edu address', 400);
    }

    if (normalizedUsername.length < 2 || normalizedUsername.length > 30) {
        throw new AppError('Username must be between 2 and 30 characters', 400);
    }

    if (password.length < 8 || password.length > 30) {
        throw new AppError('Password must be between 8 and 30 characters', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
        if (existingUser.supabaseId) {
            const { data: existingAuthData, error: existingAuthError } =
                await supabaseAdmin.auth.admin.getUserById(existingUser.supabaseId);

            if (!existingAuthError && existingAuthData.user) {
                if (existingAuthData.user.email_confirmed_at) {
                    throw new AppError('An account with this email already exists', 409);
                }

                // Unverified — refresh password + name and re-send OTP.
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                    existingUser.supabaseId,
                    { password },
                );
                if (updateError) {
                    logger.error('Failed to update existing unverified user', {
                        error: updateError,
                        userId: existingUser.id,
                    });
                    throw new AppError('Failed to restart sign up', 500);
                }

                if (existingUser.name !== normalizedUsername) {
                    await prisma.user
                        .update({ where: { id: existingUser.id }, data: { name: normalizedUsername } })
                        .catch((err) =>
                            logger.warn('Failed to update username for unverified user', {
                                error: err,
                                userId: existingUser.id,
                            }),
                        );
                }

                await issueAndSendOtp(normalizedEmail);

                logger.info('Re-issued verification OTP for existing unverified user', {
                    userId: existingUser.id,
                    email: normalizedEmail,
                });

                res.status(200).json({
                    success: true,
                    message: 'Verification code sent. Check your email.',
                    data: { requiresVerification: true, email: normalizedEmail },
                });
                return;
            }

            if (existingAuthError) {
                logger.warn('Could not check existing Supabase user during signup', {
                    error: existingAuthError,
                    userId: existingUser.id,
                    supabaseUserId: existingUser.supabaseId,
                });
            }
        }

        throw new AppError('An account with this email already exists', 409);
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: false,
    });

    if (error) {
        logger.error('Supabase createUser error', { error });
        if (error.message.toLowerCase().includes('already registered')) {
            throw new AppError('An account with this email already exists', 409);
        }
        if (error.message.toLowerCase().includes('invalid') && error.message.toLowerCase().includes('api key')) {
            throw new AppError('Supabase is misconfigured. Please check SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.', 500);
        }
        throw new AppError(error.message || 'Sign up failed', 400);
    }

    const supabaseUserId = data.user?.id;
    if (!supabaseUserId) {
        throw new AppError('Sign up failed: no user returned', 500);
    }

    let createdUserId: number | null = null;
    try {
        const user = await prisma.user.create({
            data: {
                supabaseId: supabaseUserId,
                email: normalizedEmail,
                name: normalizedUsername,
            },
        });
        createdUserId = user.id;

        await issueAndSendOtp(normalizedEmail);

        logger.info('New user signed up; OTP sent', { userId: user.id, email: normalizedEmail });

        res.status(201).json({
            success: true,
            message: 'Verification code sent. Check your email.',
            data: { requiresVerification: true, email: normalizedEmail },
        });
    } catch (dbError) {
        logger.error('Failed to finish signup after Supabase user creation', {
            error: dbError,
            supabaseUserId,
            email: normalizedEmail,
        });

        // Roll back: delete Prisma user (if created) and Supabase auth user.
        if (createdUserId) {
            await prisma.user
                .delete({ where: { id: createdUserId } })
                .catch((err) =>
                    logger.error('Failed to roll back Prisma user', { error: err, userId: createdUserId }),
                );
        }
        await supabaseAdmin.auth.admin.deleteUser(supabaseUserId).catch((cleanupError) => {
            logger.error('Failed to roll back Supabase user', { error: cleanupError, supabaseUserId });
        });

        if (dbError instanceof AppError) {
            throw dbError;
        }
        if (dbError instanceof PrismaClientKnownRequestError && dbError.code === 'P2002') {
            throw new AppError('An account with this email already exists', 409);
        }
        throw new AppError('Failed to complete sign up', 500);
    }
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, code, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCode = String(code).trim();

    if (!normalizedEmail || !normalizedCode) {
        throw new AppError('email and code are required', 400);
    }

    const record = await prisma.emailVerification.findUnique({
        where: { email: normalizedEmail },
    });

    if (!record) {
        throw new AppError('No verification in progress for this email. Please sign up again.', 400);
    }

    if (record.expiresAt.getTime() < Date.now()) {
        await prisma.emailVerification
            .delete({ where: { email: normalizedEmail } })
            .catch(() => undefined);
        throw new AppError('Verification code expired. Request a new code.', 400);
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
        await prisma.emailVerification
            .delete({ where: { email: normalizedEmail } })
            .catch(() => undefined);
        throw new AppError('Too many attempts. Request a new code.', 429);
    }

    const submittedHash = hashOtp(normalizedCode);
    if (!timingSafeEqualHex(submittedHash, record.codeHash)) {
        await prisma.emailVerification.update({
            where: { email: normalizedEmail },
            data: { attempts: { increment: 1 } },
        });
        throw new AppError('Invalid verification code', 400);
    }

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, name: true, auraPoints: true, streak: true, supabaseId: true },
    });
    if (!user || !user.supabaseId) {
        throw new AppError('User not found. Please sign up again.', 404);
    }

    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        user.supabaseId,
        { email_confirm: true },
    );
    if (confirmError) {
        logger.error('Failed to confirm Supabase user after OTP', {
            error: confirmError,
            userId: user.id,
        });
        throw new AppError('Could not finalize verification. Please try again.', 500);
    }

    await prisma.emailVerification
        .delete({ where: { email: normalizedEmail } })
        .catch(() => undefined);

    logger.info('Email verified via OTP', { userId: user.id, email: normalizedEmail });

    // Try to sign the user in immediately if a password was supplied
    // (the freshly-signed-up flow keeps it in client memory and forwards it).
    if (password) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        });

        if (!signInError && signInData.session) {
            res.json({
                success: true,
                message: 'Email verified.',
                data: {
                    accessToken: signInData.session.access_token,
                    refreshToken: signInData.session.refresh_token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        auraPoints: user.auraPoints,
                        streak: user.streak,
                    },
                },
            });
            return;
        }

        logger.warn('Email confirmed but post-OTP sign in failed', {
            error: signInError,
            userId: user.id,
        });
    }

    // Fallback: client should send the user to the login screen.
    res.json({
        success: true,
        message: 'Email verified. Please log in.',
        data: { verified: true, requiresLogin: true },
    });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail) {
        throw new AppError('email is required', 400);
    }

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, supabaseId: true },
    });

    // Always respond with a generic success to avoid leaking which emails exist.
    if (!user || !user.supabaseId) {
        res.json({ success: true, message: 'If an account is pending verification, a new code has been sent.' });
        return;
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.supabaseId);
    if (authError) {
        logger.warn('Could not look up Supabase user during resend', {
            error: authError,
            userId: user.id,
        });
    }

    if (authData?.user?.email_confirmed_at) {
        // Already verified — silently no-op so we don't tip off attackers.
        res.json({ success: true, message: 'If an account is pending verification, a new code has been sent.' });
        return;
    }

    await issueAndSendOtp(normalizedEmail);

    logger.info('Resent verification OTP', { userId: user.id, email: normalizedEmail });

    res.json({
        success: true,
        message: 'A new verification code has been sent.',
    });
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail || !password) {
        throw new AppError('email and password are required', 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (error || !data.session) {
        if (error?.message?.toLowerCase().includes('email') && error?.message?.toLowerCase().includes('confirm')) {
            throw new AppError('Please verify your email before logging in.', 403);
        }
        if (error?.message?.toLowerCase().includes('invalid') && error?.message?.toLowerCase().includes('api key')) {
            throw new AppError('Supabase is misconfigured. Please check SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.', 500);
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

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail) {
        throw new AppError('email is required', 400);
    }

    if (!/.+@calpoly\.edu$/.test(normalizedEmail)) {
        throw new AppError('Email must be a @calpoly.edu address', 400);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);

    if (error) {
        logger.warn('Forgot password request failed', { email: normalizedEmail, error });
        if (error.message.toLowerCase().includes('invalid') && error.message.toLowerCase().includes('api key')) {
            throw new AppError('Supabase is misconfigured. Please check your .env file.', 500);
        }
        throw new AppError('Could not send reset email. Please try again.', 400);
    }

    logger.info('Password reset email sent', { email: normalizedEmail });

    res.json({
        success: true,
        message: 'If an account exists for that email, a password reset link has been sent.',
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

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
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
