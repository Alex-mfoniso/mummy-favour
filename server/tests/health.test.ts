import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import * as prismaLib from '../src/lib/prisma.js';

describe('Health & Readiness Endpoints', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.restoreAllMocks();
    app = createApp();
  });

  it('GET /api/v1/health returns 200 with liveness details', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('status', 'ok');
    expect(res.body.data).toHaveProperty('uptimeSeconds');
    expect(res.body.data).toHaveProperty('timestamp');
    expect(res.body.data).toHaveProperty('environment');
  });

  it('GET /api/v1/health/ready returns 200 when database is connected', async () => {
    vi.spyOn(prismaLib, 'checkDatabaseConnection').mockResolvedValueOnce({
      connected: true,
      latencyMs: 12,
    });

    const res = await request(app).get('/api/v1/health/ready');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        status: 'ready',
        database: 'connected',
        latencyMs: 12,
        timestamp: expect.any(String),
      },
    });
  });

  it('GET /api/v1/health/ready returns 503 when database is unreachable', async () => {
    vi.spyOn(prismaLib, 'checkDatabaseConnection').mockResolvedValueOnce({
      connected: false,
      error: 'Connection refused',
    });

    const res = await request(app).get('/api/v1/health/ready');

    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'SERVICE_UNAVAILABLE');
    // Ensure no sensitive connection details or internal error stack traces leaked
    expect(res.body.error.message).not.toContain('postgresql://');
    expect(res.body.error.message).not.toContain('postgres:');
  });
});
