import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { PasswordService } from '../src/services/password.service.js';
import { AdminRole } from '@prisma/client';
import { businessSettingsRepository } from '../src/repositories/businessSettings.repository.js';

describe('Business Settings API (/api/v1/business-settings & /api/v1/admin/business-settings)', () => {
  const app = createApp();

  let adminAgent: ReturnType<typeof request.agent>;
  let adminCsrfToken: string = '';
  let adminUserId: string = '';

  let staffAgent: ReturnType<typeof request.agent>;
  let staffCsrfToken: string = '';
  let staffUserId: string = '';

  const testAdminEmail = `settings-admin-${Date.now()}@divinefavour.com`;
  const testStaffEmail = `settings-staff-${Date.now()}@divinefavour.com`;
  const testPassword = 'SettingsPassword123!';

  beforeAll(async () => {
    // 1. Create test admin and staff users
    const hash = await PasswordService.hashPassword(testPassword);
    const adminUser = await prisma.adminUser.create({
      data: {
        name: 'Settings Admin',
        email: testAdminEmail,
        passwordHash: hash,
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });
    adminUserId = adminUser.id;

    const staffUser = await prisma.adminUser.create({
      data: {
        name: 'Settings Staff',
        email: testStaffEmail,
        passwordHash: hash,
        role: AdminRole.STAFF,
        isActive: true,
      },
    });
    staffUserId = staffUser.id;

    // 2. Set up authenticated session agents
    adminAgent = request.agent(app);
    const adminLoginRes = await adminAgent
      .post('/api/v1/auth/login')
      .send({ email: testAdminEmail, password: testPassword });
    adminCsrfToken = adminLoginRes.body.data.csrfToken;

    staffAgent = request.agent(app);
    const staffLoginRes = await staffAgent
      .post('/api/v1/auth/login')
      .send({ email: testStaffEmail, password: testPassword });
    staffCsrfToken = staffLoginRes.body.data.csrfToken;

    // 3. Ensure default business settings singleton is reset to baseline defaults
    await businessSettingsRepository.updateSettings({
      businessName: 'Divine Favour',
      tagline: 'Quality Packaging. Reliable Supply.',
      phone: null,
      email: null,
      whatsAppNumber: null,
      address: null,
    });
  });

  afterAll(async () => {
    // Cleanup test users
    if (adminUserId) {
      await prisma.adminUser.delete({ where: { id: adminUserId } }).catch(() => {});
    }
    if (staffUserId) {
      await prisma.adminUser.delete({ where: { id: staffUserId } }).catch(() => {});
    }
  });

  describe('1. Public Business Settings Endpoint (GET /api/v1/business-settings)', () => {
    it('returns HTTP 200 with public business identity and defaults', async () => {
      const res = await request(app).get('/api/v1/business-settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const data = res.body.data;
      expect(data.businessName).toBe('Divine Favour');
      expect(data.tagline).toBe('Quality Packaging. Reliable Supply.');
      expect(data.updatedAt).toBeDefined();
    });

    it('strictly excludes internal IDs, secrets, and database artifacts', async () => {
      const res = await request(app).get('/api/v1/business-settings');

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.id).toBeUndefined();
      expect(data.createdAt).toBeUndefined();
      expect(data.presentation).toBeUndefined();
      expect(data.password).toBeUndefined();
      expect(data.secret).toBeUndefined();
    });

    it('provides consistent aliases for public channels', async () => {
      const res = await request(app).get('/api/v1/business-settings');

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.email).toEqual(data.publicEmail);
      expect(data.phone).toEqual(data.publicPhone);
      expect(data.whatsAppNumber).toEqual(data.publicWhatsApp);
      expect(data.address).toEqual(data.businessAddress);
    });
  });

  describe('2. Administrative Retrieval (GET /api/v1/admin/business-settings)', () => {
    it('rejects unauthenticated requests with HTTP 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/admin/business-settings');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('permits authenticated STAFF to read settings', async () => {
      const res = await staffAgent.get('/api/v1/admin/business-settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businessName).toBeDefined();
      expect(res.body.data.createdAt).toBeDefined();
    });

    it('permits authenticated ADMIN to read settings', async () => {
      const res = await adminAgent.get('/api/v1/admin/business-settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businessName).toBeDefined();
      expect(res.body.data.createdAt).toBeDefined();
    });
  });

  describe('3. Administrative Updates & Authorization (PATCH /api/v1/admin/business-settings)', () => {
    it('rejects unauthenticated updates with HTTP 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/business-settings')
        .send({ businessName: 'Hacked Co' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects updates without valid CSRF token with HTTP 403 CSRF_TOKEN_INVALID', async () => {
      const res = await adminAgent
        .patch('/api/v1/admin/business-settings')
        .send({ businessName: 'CSRF Missing Co' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_TOKEN_INVALID');
    });

    it('rejects STAFF role from modifying settings with HTTP 403 FORBIDDEN', async () => {
      const res = await staffAgent
        .patch('/api/v1/admin/business-settings')
        .set('X-CSRF-Token', staffCsrfToken)
        .send({ businessName: 'Staff Attempt' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects invalid email format with HTTP 400 VALIDATION_ERROR', async () => {
      const res = await adminAgent
        .patch('/api/v1/admin/business-settings')
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ email: 'not-an-email-address' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects short phone number with HTTP 400 VALIDATION_ERROR', async () => {
      const res = await adminAgent
        .patch('/api/v1/admin/business-settings')
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ phone: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects mass-assignment of non-editable fields with HTTP 400 VALIDATION_ERROR', async () => {
      const res = await adminAgent
        .patch('/api/v1/admin/business-settings')
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ id: 'custom-id', createdAt: '2020-01-01', maliciousField: true });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('permits authenticated ADMIN with CSRF to execute partial update', async () => {
      const res = await adminAgent
        .patch('/api/v1/admin/business-settings')
        .set('X-CSRF-Token', adminCsrfToken)
        .send({
          businessName: 'Divine Favour Packaging Works',
          publicPhone: '+234 803 123 4567',
          publicEmail: 'contact@divinefavour.com',
          businessAddress: 'Industrial Zone, Onitsha, Anambra State, Nigeria',
          socialLinks: {
            instagram: 'https://instagram.com/divinefavour',
            facebook: 'https://facebook.com/divinefavour',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businessName).toBe('Divine Favour Packaging Works');
      expect(res.body.data.phone).toBe('+234 803 123 4567');
      expect(res.body.data.email).toBe('contact@divinefavour.com');
      expect(res.body.data.address).toBe('Industrial Zone, Onitsha, Anambra State, Nigeria');
      expect(res.body.data.socialLinks.instagram).toBe('https://instagram.com/divinefavour');
    });

    it('preserves fields omitted from the PATCH request', async () => {
      // Update only tagline
      const res = await adminAgent
        .patch('/api/v1/admin/business-settings')
        .set('X-CSRF-Token', adminCsrfToken)
        .send({
          tagline: 'Precision Extrusion. Dependable Delivery.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.tagline).toBe('Precision Extrusion. Dependable Delivery.');
      // Omitted fields should be preserved from prior update
      expect(res.body.data.businessName).toBe('Divine Favour Packaging Works');
      expect(res.body.data.phone).toBe('+234 803 123 4567');
      expect(res.body.data.email).toBe('contact@divinefavour.com');
    });

    it('persists updates across public endpoint queries', async () => {
      const publicRes = await request(app).get('/api/v1/business-settings');

      expect(publicRes.status).toBe(200);
      expect(publicRes.body.data.businessName).toBe('Divine Favour Packaging Works');
      expect(publicRes.body.data.tagline).toBe('Precision Extrusion. Dependable Delivery.');
      expect(publicRes.body.data.phone).toBe('+234 803 123 4567');
      expect(publicRes.body.data.email).toBe('contact@divinefavour.com');
    });

    it('allows clearing optional fields by sending null or empty string', async () => {
      const res = await adminAgent
        .patch('/api/v1/admin/business-settings')
        .set('X-CSRF-Token', adminCsrfToken)
        .send({
          publicEmail: '',
          publicPhone: null,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBeNull();
      expect(res.body.data.phone).toBeNull();
    });
  });

  describe('4. Singleton Pattern & Duplicate Prevention', () => {
    it('maintains exactly one settings record in the database', async () => {
      // Call repository getSettings multiple times
      await businessSettingsRepository.getSettings();
      await businessSettingsRepository.getSettings();

      const count = await prisma.businessSettings.count();
      expect(count).toBe(1);

      const records = await prisma.businessSettings.findMany();
      expect(records[0].id).toBe('default');
    });
  });
});
