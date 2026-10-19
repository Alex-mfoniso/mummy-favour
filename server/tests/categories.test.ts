import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Categories API (/api/v1/categories)', () => {
  const app = createApp();
  let createdCategoryId: string = '';
  const testCategorySlug = `test-cat-${Date.now()}`;

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

  it('GET /api/v1/categories returns visible categories ordered by displayOrder', async () => {
    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Verify ordering
    for (let i = 0; i < res.body.data.length - 1; i++) {
      expect(res.body.data[i].displayOrder).toBeLessThanOrEqual(res.body.data[i + 1].displayOrder);
    }
  });

  it('GET /api/v1/categories?includeProductCounts=true returns productCount numbers', async () => {
    const res = await request(app).get('/api/v1/categories?includeProductCounts=true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0]).toHaveProperty('productCount');
    expect(typeof res.body.data[0].productCount).toBe('number');
  });

  it('GET /api/v1/categories/:slug returns 200 for an existing category', async () => {
    const res = await request(app).get('/api/v1/categories/carrier-bags');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('carrier-bags');
    expect(res.body.data.name).toBe('Carrier Bags');
  });

  it('GET /api/v1/categories/:slug returns 404 for a non-existent category', async () => {
    const res = await request(app).get('/api/v1/categories/non-existent-category-slug');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('POST /api/v1/categories creates a new category with authenticated admin session', async () => {
    const payload = {
      name: 'Test Category For Vitest',
      slug: testCategorySlug,
      description: 'Automated test category description for verifying Category API CRUD.',
      displayOrder: 99,
      visibility: 'visible',
    };

    const res = await adminAgent
      .post('/api/v1/categories')
      .set('X-CSRF-Token', csrfToken)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(testCategorySlug);
    expect(res.body.data.displayOrder).toBe(99);

    createdCategoryId = res.body.data.id;
  });

  it('POST /api/v1/categories rejects duplicate slug with 409 SLUG_CONFLICT', async () => {
    const payload = {
      name: 'Duplicate Category',
      slug: testCategorySlug,
      description: 'Should fail with duplicate conflict',
    };

    const res = await adminAgent
      .post('/api/v1/categories')
      .set('X-CSRF-Token', csrfToken)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SLUG_CONFLICT');
  });

  it('PATCH /api/v1/categories/:id updates category fields', async () => {
    const res = await adminAgent
      .patch(`/api/v1/categories/${createdCategoryId}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        description: 'Updated test category description.',
        displayOrder: 88,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.description).toBe('Updated test category description.');
    expect(res.body.data.displayOrder).toBe(88);
  });

  it('DELETE /api/v1/categories/:id prevents deletion when products are associated (409)', async () => {
    // carrier-bags has associated products
    const res = await adminAgent
      .delete('/api/v1/categories/carrier-bags')
      .set('X-CSRF-Token', csrfToken);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CATEGORY_HAS_PRODUCTS');
  });

  it('DELETE /api/v1/categories/:id deletes category when no products exist', async () => {
    const res = await adminAgent
      .delete(`/api/v1/categories/${createdCategoryId}`)
      .set('X-CSRF-Token', csrfToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdCategoryId);

    // Verify 404 after deletion
    const verifyRes = await request(app).get(`/api/v1/categories/${testCategorySlug}`);
    expect(verifyRes.status).toBe(404);
  });
});
