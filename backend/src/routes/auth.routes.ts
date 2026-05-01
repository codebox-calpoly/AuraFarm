import { Router } from 'express';
import {
    signUp,
    signIn,
    changePassword,
    forgotPassword,
    verifyOtp,
    resendOtp,
} from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import rateLimiter from '../middleware/rateLimiter';

const router = Router();

const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(30),
    username: z.string().min(2).max(30),
});

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8).max(30),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const verifyOtpSchema = z.object({
    email: z.string().email(),
    code: z.string().regex(/^\d{6}$/, 'code must be a 6-digit number'),
    password: z.string().min(1).max(72).optional(),
});

const resendOtpSchema = z.object({
    email: z.string().email(),
});

router.post('/signup', rateLimiter.authLimiter, validateBody(signUpSchema), signUp);
router.post('/login', rateLimiter.authLimiter, validateBody(signInSchema), signIn);
router.post('/verify-otp', rateLimiter.authLimiter, validateBody(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', rateLimiter.authLimiter, validateBody(resendOtpSchema), resendOtp);
router.post('/forgot-password', rateLimiter.authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/change-password', authenticate, rateLimiter.authLimiter, validateBody(changePasswordSchema), changePassword);

export default router;
