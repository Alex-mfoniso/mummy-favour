import { Request, Response, NextFunction } from 'express';
import { AdminRole } from '@prisma/client';
import { authService } from '../services/auth.service.js';

/**
 * Middleware that requires a valid, active administrator session.
 * Rejects unauthenticated requests with HTTP 401.
 * Terminates sessions for deactivated accounts immediately.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.session?.adminUserId;

  if (!userId) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource.',
      },
    });
    return;
  }

  try {
    const user = await authService.getSafeUserById(userId);

    if (!user || !user.isActive) {
      // Invalidate session for deleted or disabled accounts
      req.session.destroy(() => {});
      res.clearCookie('df_sid');

      res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account has been deactivated or no longer exists.',
        },
      });
      return;
    }

    req.adminUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Normalize role for backwards and forwards compatibility
 * (SUPER_ADMIN and legacy SUPERADMIN are treated as identical).
 */
export function normalizeRole(role: AdminRole | string): string {
  if (role === 'SUPERADMIN' || role === 'SUPER_ADMIN') {
    return 'SUPER_ADMIN';
  }
  return role;
}

/**
 * Check if a user's role is in the allowed roles list.
 */
export function isUserAuthorized(userRole: AdminRole, allowedRoles: (AdminRole | string)[]): boolean {
  const normalizedUser = normalizeRole(userRole);
  return allowedRoles.some((r) => normalizeRole(r) === normalizedUser);
}

/**
 * Middleware factory that enforces role-based authorization.
 * Rejects users without an allowed role with HTTP 403.
 */
export function requireRole(allowedRoles: (AdminRole | string)[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.adminUser) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
      return;
    }

    if (!isUserAuthorized(req.adminUser.role, allowedRoles)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient administrative permissions to perform this operation.',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Helper middleware specifically restricting an endpoint to SUPER_ADMIN (the business owner).
 */
export const requireSuperAdmin = requireRole(['SUPER_ADMIN', 'SUPERADMIN']);

/**
 * Helper middleware for manager-level actions (ADMIN and SUPER_ADMIN).
 */
export const requireAdminOrSuperAdmin = requireRole(['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']);
