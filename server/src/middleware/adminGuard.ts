import { Request, Response, NextFunction } from 'express';
import { getConfig } from '../config/index.js';
import { ApiErrorResponse } from '../types/api.js';

/**
 * Temporary development-only guard for administrative write operations (POST, PATCH, DELETE).
 *
 * IMPORTANT SECURITY BOUNDARY:
 * In production (NODE_ENV === 'production') or whenever ALLOW_DEV_ADMIN_WRITES is false,
 * all administrative mutations are strictly rejected with HTTP 403 until proper
 * authentication and authorization middleware are implemented in a subsequent phase.
 */
export function adminWriteGuard(
  _req: Request,
  res: Response<ApiErrorResponse>,
  next: NextFunction
): void {
  const config = getConfig();

  if (!config.allowDevAdminWrites || config.isProduction) {
    res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_WRITES_DISABLED',
        message:
          'Administrative write operations are disabled in this environment until production authentication is configured.',
      },
    });
    return;
  }

  next();
}
