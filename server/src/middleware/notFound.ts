import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/api.js';

export function notFoundHandler(req: Request, res: Response<ApiErrorResponse>): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint "${req.method} ${req.originalUrl}" does not exist.`,
    },
  });
}
