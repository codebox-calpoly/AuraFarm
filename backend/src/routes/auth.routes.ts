import { Router } from 'express';
import { signUp, signIn, verifyOtp } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
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

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, username]
 *             properties:
 *               email:
 *                 type: string
 *                 example: mmustang@calpoly.edu
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *               username:
 *                 type: string
 *                 example: musty_mustang
 *     responses:
 *       201:
 *         description: Account created – verification email sent
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post('/signup', validateBody(signUpSchema), signUp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns session tokens and user info
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateBody(signInSchema), signIn);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify email OTP code after signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token]
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *                 description: 6-digit OTP from email
 *     responses:
 *       200:
 *         description: Email verified – returns session tokens
 *       400:
 *         description: Invalid or expired code
 */
router.post('/verify', validateBody(verifyOtpSchema), verifyOtp);

export default router;
