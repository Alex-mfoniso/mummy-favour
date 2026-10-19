import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Administrative Route Protection & Security Boundary', () => {
  const app = createApp();

  it('rejects unauthenticated POST /api/v1/products with 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Blocked Unauthenticated Product' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects unauthenticated POST /api/v1/categories with 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Blocked Unauthenticated Category' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects unauthenticated PATCH /api/v1/products/:id with 401 UNAUTHORIZED', async () => {
    const res = await request(app)
      .patch('/api/v1/products/some-product-id')
      .send({ name: 'Blocked Patch' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects unauthenticated DELETE /api/v1/categories/:id with 401 UNAUTHORIZED', async () => {
    const res = await request(app).delete('/api/v1/categories/some-category-id');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('allows public GET /api/v1/products without authentication', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('allows public GET /api/v1/categories without authentication', async () => {
    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
