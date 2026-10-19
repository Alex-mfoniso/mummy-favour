import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ApiErrorResponse } from '../types/api.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err);
  }

  // 1. Handle JSON parsing syntax errors (e.g., malformed JSON payload)
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'The request body contains invalid or malformed JSON syntax.',
      },
    });
    return;
  }

  // 2. Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedDetails = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed.',
        details: formattedDetails,
      },
    });
    return;
  }

  // 3. Handle explicit AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // 4. Fallback for unhandled unexpected internal errors
  // Server-side logging without leaking secrets or stack traces to client
  console.error('[Internal Server Error]', {
    name: err.name,
    message: err.message,
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred. Please try again later.',
    },
  });
}
