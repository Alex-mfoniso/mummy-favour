import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getConfig } from '../config/index.js';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware that ensures a CSRF token exists on the session for any request.
 */
export function ensureCsrfToken(req: Request, _res: Response, next: NextFunction): void {
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  next();
}

/**
 * Middleware to verify CSRF tokens on state-changing authenticated requests.
 * Uses the Synchronizer Token Pattern with timing-safe comparison.
 */
export function verifyCsrf(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Login is exempt since session is not established yet
  const isLoginRoute = req.originalUrl.endsWith('/auth/login') || req.path === '/login';
  if (isLoginRoute && req.method === 'POST') {
    return next();
  }

  // 1. Origin verification as defense-in-depth
  const config = getConfig();
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
  if (origin) {
    const isAllowed =
      config.corsOrigins.includes('*') ||
      config.corsOrigins.includes(origin) ||
      (config.isDevelopment && origin.startsWith('http://localhost:'));

    if (!isAllowed) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ORIGIN_MISMATCH',
          message: 'Cross-origin request rejected.',
        },
      });
      return;
    }
  }

  // 2. Synchronizer token verification
  const sessionToken = req.session?.csrfToken;
  const headerToken = req.headers['x-csrf-token'] as string | undefined;

  if (!sessionToken || !headerToken) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'Missing or invalid CSRF token. State-changing operations require a valid CSRF token.',
      },
    });
    return;
  }

  const sessionTokenBuf = Buffer.from(sessionToken, 'utf-8');
  const headerTokenBuf = Buffer.from(headerToken, 'utf-8');

  if (
    sessionTokenBuf.length !== headerTokenBuf.length ||
    !crypto.timingSafeEqual(sessionTokenBuf, headerTokenBuf)
  ) {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'Invalid CSRF token.',
      },
    });
    return;
  }

  next();
}
