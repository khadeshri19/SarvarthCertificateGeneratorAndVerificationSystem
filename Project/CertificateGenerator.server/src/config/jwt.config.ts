/**
 * jwt.config.ts — JSON Web Token Configuration
 *
 * We use JWTs for authentication. The access token is short-lived (15 min)
 * so that even if it gets stolen, the damage window is small. The refresh
 * token lasts longer (7 days) and lets the client silently get a new
 * access token without forcing the user to log in again.
 */

import dotenv from 'dotenv';
dotenv.config();

// Access token — used for authenticating every API request
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const JWT_EXPIRES_IN = process.env.JWT_TOKEN_EXPIRES_IN || '15m';

// Refresh token — used to get a new access token when the old one expires
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
