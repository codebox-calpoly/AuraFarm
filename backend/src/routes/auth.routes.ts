import { Router } from 'express';
import { signUp, signIn, verifyOtp, resendOtp, changePassword, forgotPassword } from '../controllers/auth.controller';
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

const verifyOtpSchema = z.object({
    email: z.string().email(),
    token: z.string().min(4).max(8),
});

const resendSchema = z.object({
    email: z.string().email(),
});

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8).max(30),
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

router.post('/signup', rateLimiter.authLimiter, validateBody(signUpSchema), signUp);
router.post('/login', rateLimiter.authLimiter, validateBody(signInSchema), signIn);
router.post('/verify', rateLimiter.authLimiter, validateBody(verifyOtpSchema), verifyOtp);
router.post('/resend', rateLimiter.authLimiter, validateBody(resendSchema), resendOtp);
router.post('/forgot-password', rateLimiter.authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/change-password', authenticate, rateLimiter.authLimiter, validateBody(changePasswordSchema), changePassword);

export default router;
