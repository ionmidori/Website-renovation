import jwt from 'jsonwebtoken';

const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET!;

export interface UserPayload {
    uid: string;
    email: string;
}

/**
 * Creates a short-lived Internal JWT for Python backend authentication.
 * This token is signed by Next.js after validating the Firebase token.
 */
export function createInternalToken(payload: UserPayload): string {
    if (!INTERNAL_JWT_SECRET) {
        throw new Error('INTERNAL_JWT_SECRET is not configured');
    }

    return jwt.sign(
        payload,
        INTERNAL_JWT_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: '5m', // Short-lived: forces periodic Firebase revalidation
        }
    );
}

/**
 * Validates an Internal JWT (for testing/debugging purposes).
 * Production use: Python backend validates these tokens.
 */
export function verifyInternalToken(token: string): UserPayload {
    if (!INTERNAL_JWT_SECRET) {
        throw new Error('INTERNAL_JWT_SECRET is not configured');
    }

    return jwt.verify(token, INTERNAL_JWT_SECRET, {
        algorithms: ['HS256'],
    }) as UserPayload;
}
