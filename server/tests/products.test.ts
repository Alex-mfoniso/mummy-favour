import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Products API (/api/v1/products)', () => {
  const app = createApp();
  let createdProductId: string = '';
  const testProductSlug = `test-poly-bag-${Date.now()}`;

  let adminAgent: ReturnType<typeof request.agent>;
  let csrfToken: string = '';

  beforeAll(async () => {
    adminAgent = request.agent(app);
    const loginRes = await adminAgent.post('/api/v1/auth/login').send({
      email: 'admin@divinefavour.com',
      password: 'DivineFavour2026!',
    });
    if (loginRes.body?.data?.csrfToken) {
      csrfToken = loginRes.body.data.csrfToken;
    }
  });

  it('GET /api/v1/products returns paginated products with metadata', async () => {
    const res = await request(app).get('/api/v1/products?page=1&limit=3');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 3,
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it('GET /api/v1/products?search=Carrier matches by title or description', async () => {
    const res = await request(app).get('/api/v1/products?search=Carrier');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.some((p: any) => p.name.includes('Carrier') || p.description.includes('carrier'))
    ).toBe(true);
  });

  it('GET /api/v1/products?category=carrier-bags filters by category slug', async () => {
    const res = await request(app).get('/api/v1/products?category=carrier-bags');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    for (const prod of res.body.data) {
      expect(prod.categoryDetails.slug).toBe('carrier-bags');
    }
  });

  it('GET /api/v1/products?featured=true filters only featured products', async () => {
    const res = await request(app).get('/api/v1/products?featured=true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    for (const prod of res.body.data) {
      expect(prod.featured).toBe(true);
    }
  });

  it('GET /api/v1/products?sort=name-asc sorts products alphabetically', async () => {
    const res = await request(app).get('/api/v1/products?sort=name-asc');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const names = res.body.data.map((p: any) => p.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('GET /api/v1/products/:slug returns 200 with full product details', async () => {
    const listRes = await request(app).get('/api/v1/products?limit=1');
    const existingSlug = listRes.body.data[0].slug;

    const res = await request(app).get(`/api/v1/products/${existingSlug}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(existingSlug);
    expect(res.body.data).toHaveProperty('specifications');
  });

  it('GET /api/v1/products/:slug returns 404 for missing slug', async () => {
    const res = await request(app).get('/api/v1/products/non-existent-product-slug');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('POST /api/v1/products creates product with authenticated admin session', async () => {
    const payload = {
      name: 'Automated Vitest Test Bag',
      slug: testProductSlug,
      categoryId: 'carrier-bags',
      shortDescription: 'Short description for automated testing.',
      description: 'Comprehensive detailed description of the poly bag for automated test verification.',
      status: 'in-stock',
      featured: false,
      specifications: [{ label: 'Test Gauge', value: '50 Microns' }],
    };

    const res = await adminAgent
      .post('/api/v1/products')
      .set('X-CSRF-Token', csrfToken)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(testProductSlug);
    expect(res.body.data.category).toBe('Carrier Bags');

    createdProductId = res.body.data.id;
  });

  it('POST /api/v1/products rejects invalid category with 400 INVALID_CATEGORY', async () => {
    const payload = {
      name: 'Bad Category Bag',
      slug: `bad-cat-${Date.now()}`,
      categoryId: 'non-existent-category-id-999',
      shortDescription: 'Short description.',
      description: 'Full description.',
    };

    const res = await adminAgent
      .post('/api/v1/products')
      .set('X-CSRF-Token', csrfToken)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CATEGORY');
  });

  it('POST /api/v1/products rejects duplicate slug with 409 SLUG_CONFLICT', async () => {
    const payload = {
      name: 'Duplicate Slug Bag',
      slug: testProductSlug,
      categoryId: 'carrier-bags',
      shortDescription: 'Short description.',
      description: 'Full description.',
    };

    const res = await adminAgent
      .post('/api/v1/products')
      .set('X-CSRF-Token', csrfToken)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SLUG_CONFLICT');
  });

  it('PATCH /api/v1/products/:id updates product fields', async () => {
    const res = await adminAgent
      .patch(`/api/v1/products/${createdProductId}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: 'Updated Automated Vitest Bag',
        featured: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Automated Vitest Bag');
    expect(res.body.data.featured).toBe(true);
  });

  it('DELETE /api/v1/products/:id deletes product successfully', async () => {
    const res = await adminAgent
      .delete(`/api/v1/products/${createdProductId}`)
      .set('X-CSRF-Token', csrfToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdProductId);

    const verifyRes = await request(app).get(`/api/v1/products/${testProductSlug}`);
    expect(verifyRes.status).toBe(404);
  });
});
