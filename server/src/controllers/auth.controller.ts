import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { generateCsrfToken } from '../middleware/csrf.js';

export class AuthController {
  /**
   * POST /api/v1/auth/login
   * Authenticate administrator and establish a new session (with ID regeneration).
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);

      // Session regeneration prevents session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          return next(err);
        }

        req.session.adminUserId = user.id;
        req.session.csrfToken = generateCsrfToken();

        req.session.save((saveErr) => {
          if (saveErr) {
            return next(saveErr);
          }

          res.status(200).json({
            success: true,
            data: {
              user,
              csrfToken: req.session.csrfToken,
            },
          });
        });
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Terminate current server session and clear the session cookie.
   */
  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.session) {
        res.clearCookie('df_sid', { path: '/' });
        res.status(200).json({
          success: true,
          data: { message: 'Logged out successfully.' },
        });
        return;
      }

      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }

        res.clearCookie('df_sid', { path: '/' });
        res.status(200).json({
          success: true,
          data: { message: 'Logged out successfully.' },
        });
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Return authenticated administrator's safe profile.
   */
  public async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session?.adminUserId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated.',
          },
        });
        return;
      }

      const user = await authService.getSafeUserById(userId);

      if (!user) {
        req.session.destroy(() => {});
        res.clearCookie('df_sid', { path: '/' });
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Session is invalid or account no longer exists.',
          },
        });
        return;
      }

      // Ensure CSRF token is present on the session
      if (!req.session.csrfToken) {
        req.session.csrfToken = generateCsrfToken();
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          csrfToken: req.session.csrfToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/csrf
   * Obtain current session CSRF token.
   */
  public getCsrf(req: Request, res: Response): void {
    if (!req.session) {
      res.status(200).json({
        success: true,
        data: { csrfToken: null },
      });
      return;
    }

    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken();
    }

    res.status(200).json({
      success: true,
      data: {
        csrfToken: req.session.csrfToken,
      },
    });
  }
}

export const authController = new AuthController();
