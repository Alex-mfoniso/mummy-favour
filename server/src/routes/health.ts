import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../lib/prisma.js';
import { getConfig } from '../config/index.js';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/api.js';

export const healthRouter = Router();

/**
 * Liveness probe: returns 200 when the Express HTTP process is alive.
 * Suitable for container orchestrators and load balancers.
 * GET /api/v1/health
 */
healthRouter.get('/', (_req: Request, res: Response<ApiSuccessResponse<{
  status: string;
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
}>>) => {
  const config = getConfig();

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    },
  });
});

/**
 * Readiness probe: checks database connectivity without leaking credentials.
 * Returns 200 when database is ready, 503 when unreachable.
 * GET /api/v1/health/ready
 */
healthRouter.get('/ready', async (_req: Request, res: Response<
  ApiSuccessResponse<{
    status: string;
    database: string;
    latencyMs?: number;
    timestamp: string;
  }> | ApiErrorResponse
>) => {
  const check = await checkDatabaseConnection();

  if (!check.connected) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database readiness check failed. Database is currently unreachable.',
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      status: 'ready',
      database: 'connected',
      latencyMs: check.latencyMs,
      timestamp: new Date().toISOString(),
    },
  });
});
