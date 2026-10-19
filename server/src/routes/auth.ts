import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { verifyCsrf } from '../middleware/csrf.js';
import { loginSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

/**
 * POST /api/v1/auth/login
 * Public authentication route with brute-force rate limiting.
 */
authRouter.post(
  '/login',
  loginRateLimiter,
  validateRequest({ body: loginSchema }),
  authController.login
);

/**
 * POST /api/v1/auth/logout
 * Terminates the authenticated session and invalidates the session cookie.
 * Requires CSRF verification.
 */
authRouter.post('/logout', verifyCsrf, authController.logout);

/**
 * GET /api/v1/auth/me
 * Retrieves current authenticated administrator profile.
 */
authRouter.get('/me', authController.me);

/**
 * GET /api/v1/auth/csrf
 * Retrieves CSRF synchronizer token for the active session.
 */
authRouter.get('/csrf', authController.getCsrf);
