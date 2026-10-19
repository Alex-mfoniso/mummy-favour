import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { PasswordService } from '../src/services/password.service.js';
import { AdminRole } from '@prisma/client';

describe('Admin Authentication & Authorization API (/api/v1/auth)', () => {
  const app = createApp();

  const testAdminEmail = `test-admin-${Date.now()}@divinefavour.com`;
  const testStaffEmail = `test-staff-${Date.now()}@divinefavour.com`;
  const testInactiveEmail = `test-inactive-${Date.now()}@divinefavour.com`;
  const testPassword = 'SecurePassword123!';

  let testAdminId: string;
  let testStaffId: string;
  let testInactiveId: string;

  beforeAll(async () => {
    // 1. Create active ADMIN user
    const adminHash = await PasswordService.hashPassword(testPassword);
    const admin = await prisma.adminUser.create({
      data: {
        name: 'Test Administrator',
        email: testAdminEmail,
        passwordHash: adminHash,
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });
    testAdminId = admin.id;

    // 2. Create active STAFF user
    const staffHash = await PasswordService.hashPassword(testPassword);
    const staff = await prisma.adminUser.create({
      data: {
        name: 'Test Staff',
        email: testStaffEmail,
        passwordHash: staffHash,
        role: AdminRole.STAFF,
        isActive: true,
      },
    });
    testStaffId = staff.id;

    // 3. Create inactive ADMIN user
    const inactiveHash = await PasswordService.hashPassword(testPassword);
    const inactive = await prisma.adminUser.create({
      data: {
        name: 'Disabled Administrator',
        email: testInactiveEmail,
        passwordHash: inactiveHash,
        role: AdminRole.ADMIN,
        isActive: false,
      },
    });
    testInactiveId = inactive.id;
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.adminUser.deleteMany({
      where: {
        id: {
          in: [testAdminId, testStaffId, testInactiveId].filter(Boolean),
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/login', () => {
    it('rejects missing email and password with 400 validation error', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid email format with 400 validation error', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'invalid-email-address',
        password: testPassword,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects non-existent administrator with generic 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@divinefavour.com',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email address or password.');
    });

    it('rejects incorrect password with generic 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testAdminEmail,
        password: 'CompletelyWrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email address or password.');
    });

    it('rejects inactive administrator with generic 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testInactiveEmail,
        password: testPassword,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('successfully logs in with valid credentials, sets HttpOnly cookie and returns safe user with csrfToken', async () => {
      const agent = request.agent(app);

      const res = await agent.post('/api/v1/auth/login').send({
        email: testAdminEmail,
        password: testPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testAdminEmail);
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.csrfToken).toBeDefined();
      expect(typeof res.body.data.csrfToken).toBe('string');

      // Check cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const sessionCookie = cookies.find((c: string) => c.startsWith('df_sid='));
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toContain('HttpOnly');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 401 UNAUTHORIZED when no session exists', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns safe user profile and csrfToken when authenticated', async () => {
      const agent = request.agent(app);

      // Log in
      await agent.post('/api/v1/auth/login').send({
        email: testAdminEmail,
        password: testPassword,
      });

      // Get me
      const meRes = await agent.get('/api/v1/auth/me');

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.email).toBe(testAdminEmail);
      expect(meRes.body.data.user.role).toBe('ADMIN');
      expect(meRes.body.data.user.passwordHash).toBeUndefined();
      expect(meRes.body.data.csrfToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('rejects logout without CSRF token with 403 CSRF_TOKEN_INVALID', async () => {
      const agent = request.agent(app);

      await agent.post('/api/v1/auth/login').send({
        email: testAdminEmail,
        password: testPassword,
      });

      const res = await agent.post('/api/v1/auth/logout').send({});
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_TOKEN_INVALID');
    });

    it('successfully logs out with valid CSRF token, invalidating session', async () => {
      const agent = request.agent(app);

      const loginRes = await agent.post('/api/v1/auth/login').send({
        email: testAdminEmail,
        password: testPassword,
      });

      const csrfToken = loginRes.body.data.csrfToken;

      const logoutRes = await agent
        .post('/api/v1/auth/logout')
        .set('X-CSRF-Token', csrfToken)
        .send({});

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Verify that subsequent /me returns 401
      const meRes = await agent.get('/api/v1/auth/me');
      expect(meRes.status).toBe(401);
    });
  });

  describe('Protected Administrative Routes & RBAC', () => {
    it('rejects unauthenticated product creation with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Unauthenticated Product' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects authenticated request without CSRF token with 403 CSRF_TOKEN_INVALID', async () => {
      const agent = request.agent(app);

      await agent.post('/api/v1/auth/login').send({
        email: testAdminEmail,
        password: testPassword,
      });

      const res = await agent
        .post('/api/v1/categories')
        .send({ name: 'No CSRF Category', slug: 'no-csrf-cat', description: 'desc' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_TOKEN_INVALID');
    });

    it('rejects STAFF user with 403 FORBIDDEN for admin-only category mutations', async () => {
      const agent = request.agent(app);

      const loginRes = await agent.post('/api/v1/auth/login').send({
        email: testStaffEmail,
        password: testPassword,
      });

      const csrfToken = loginRes.body.data.csrfToken;

      const res = await agent
        .post('/api/v1/categories')
        .set('X-CSRF-Token', csrfToken)
        .send({ name: 'Staff Category', slug: 'staff-cat', description: 'desc' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('permits authenticated ADMIN with valid CSRF token to create a category', async () => {
      const agent = request.agent(app);

      const loginRes = await agent.post('/api/v1/auth/login').send({
        email: testAdminEmail,
        password: testPassword,
      });

      const csrfToken = loginRes.body.data.csrfToken;
      const slug = `auth-test-cat-${Date.now()}`;

      const res = await agent
        .post('/api/v1/categories')
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Authenticated Admin Category',
          slug,
          description: 'Created by authorized administrator.',
          displayOrder: 10,
          visibility: 'visible',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe(slug);

      // Clean up category
      await agent
        .delete(`/api/v1/categories/${res.body.data.id}`)
        .set('X-CSRF-Token', csrfToken);
    });

    it('public GET /api/v1/products remains accessible without authentication', async () => {
      const res = await request(app).get('/api/v1/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
