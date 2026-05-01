import crypto from 'crypto';

export const OTP_LENGTH = 8;
export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;

const OTP_SECRET =
    process.env.OTP_SECRET ||
    process.env.SUPABASE_SERVICE_KEY ||
    'aurafarm-dev-otp-secret';

export function generateOtp(): string {
    return String(crypto.randomInt(0, 100_000_000)).padStart(OTP_LENGTH, '0');
}

export function hashOtp(code: string): string {
    return crypto
        .createHmac('sha256', OTP_SECRET)
        .update(code.trim())
        .digest('hex');
}

/** Constant-time compare for hex digests of equal length. */
export function timingSafeEqualHex(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    try {
        return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
    } catch {
        return false;
    }
}
