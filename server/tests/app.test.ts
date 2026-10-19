import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createApp } from '../src/app.js';
import { AppError } from '../src/types/api.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

describe('App Core Middleware & Error Handling', () => {
  const app = createApp();

  it('returns standardized 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested endpoint "GET /api/v1/unknown-endpoint" does not exist.',
      },
    });
  });

  it('returns 400 MALFORMED_JSON when request body has invalid JSON syntax', async () => {
    const res = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('{ "badJson": invalid-syntax }');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'The request body contains invalid or malformed JSON syntax.',
      },
    });
  });

  it('formats custom AppError correctly', async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.get('/test-app-error', () => {
      throw new AppError('Resource already exists', 409, 'RESOURCE_CONFLICT', { item: 'slug' });
    });
    testApp.use(errorHandler);

    const res = await request(testApp).get('/test-app-error');

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'RESOURCE_CONFLICT',
        message: 'Resource already exists',
        details: { item: 'slug' },
      },
    });
  });

  it('masks unexpected errors with 500 without leaking stack traces', async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.get('/test-unexpected-error', () => {
      throw new Error('Database password was super_secret');
    });
    testApp.use(errorHandler);

    const res = await request(testApp).get('/test-unexpected-error');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(res.body.error.message).not.toContain('super_secret');
    expect(res.body.error).not.toHaveProperty('stack');
  });
});
