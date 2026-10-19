import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { PasswordService } from '../src/services/password.service.js';
import { AdminRole, CategoryVisibility } from '@prisma/client';

describe('Enquiry Management & Quotation APIs (/api/v1/enquiries & /api/v1/admin/enquiries)', () => {
  const app = createApp();

  let adminAgent: ReturnType<typeof request.agent>;
  let adminCsrfToken: string = '';
  let adminUserId: string = '';

  let staffAgent: ReturnType<typeof request.agent>;
  let staffCsrfToken: string = '';
  let staffUserId: string = '';

  const testAdminEmail = `enq-admin-${Date.now()}@divinefavour.com`;
  const testStaffEmail = `enq-staff-${Date.now()}@divinefavour.com`;
  const testPassword = 'Password123!';

  let testCategory: any;
  let hiddenCategory: any;
  let testProduct: any;
  let hiddenProduct: any;

  beforeAll(async () => {
    // 1. Create test admin and staff users
    const hash = await PasswordService.hashPassword(testPassword);
    const adminUser = await prisma.adminUser.create({
      data: {
        name: 'Enquiry Admin',
        email: testAdminEmail,
        passwordHash: hash,
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });
    adminUserId = adminUser.id;

    const staffUser = await prisma.adminUser.create({
      data: {
        name: 'Enquiry Staff',
        email: testStaffEmail,
        passwordHash: hash,
        role: AdminRole.STAFF,
        isActive: true,
      },
    });
    staffUserId = staffUser.id;

    // 2. Create visible and hidden test categories & products
    testCategory = await prisma.category.create({
      data: {
        name: `Test Cat ${Date.now()}`,
        slug: `test-cat-${Date.now()}`,
        description: 'Test category description',
        visibility: CategoryVisibility.VISIBLE,
      },
    });

    hiddenCategory = await prisma.category.create({
      data: {
        name: `Hidden Cat ${Date.now()}`,
        slug: `hidden-cat-${Date.now()}`,
        description: 'Hidden category description',
        visibility: CategoryVisibility.HIDDEN,
      },
    });

    testProduct = await prisma.product.create({
      data: {
        name: `Shopping Bag ${Date.now()}`,
        slug: `shopping-bag-${Date.now()}`,
        shortDescription: 'High quality shopping bag',
        description: 'High quality shopping bag full details',
        categoryId: testCategory.id,
      },
    });

    hiddenProduct = await prisma.product.create({
      data: {
        name: `Secret Product ${Date.now()}`,
        slug: `secret-prod-${Date.now()}`,
        shortDescription: 'Unlisted test item',
        description: 'Unlisted test item details',
        categoryId: hiddenCategory.id,
      },
    });

    // 3. Establish authenticated session for admin
    adminAgent = request.agent(app);
    const adminLoginRes = await adminAgent.post('/api/v1/auth/login').send({
      email: testAdminEmail,
      password: testPassword,
    });
    expect(adminLoginRes.status).toBe(200);
    adminCsrfToken = adminLoginRes.body.data.csrfToken;

    // 4. Establish authenticated session for staff
    staffAgent = request.agent(app);
    const staffLoginRes = await staffAgent.post('/api/v1/auth/login').send({
      email: testStaffEmail,
      password: testPassword,
    });
    expect(staffLoginRes.status).toBe(200);
    staffCsrfToken = staffLoginRes.body.data.csrfToken;
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.enquiryItem.deleteMany({
      where: {
        enquiry: {
          customerName: { startsWith: 'Test ' },
        },
      },
    });
    await prisma.enquiryNote.deleteMany({
      where: {
        enquiry: {
          customerName: { startsWith: 'Test ' },
        },
      },
    });
    await prisma.enquiry.deleteMany({
      where: {
        customerName: { startsWith: 'Test ' },
      },
    });
    if (testProduct?.id) {
      await prisma.product.deleteMany({ where: { id: { in: [testProduct.id, hiddenProduct.id] } } });
    }
    if (testCategory?.id) {
      await prisma.category.deleteMany({ where: { id: { in: [testCategory.id, hiddenCategory.id] } } });
    }
    await prisma.adminUser.deleteMany({ where: { id: { in: [adminUserId, staffUserId] } } });
  });

  // ==========================================================================
  // SECTION 1: PUBLIC ENQUIRY SUBMISSIONS (POST /api/v1/enquiries)
  // ==========================================================================
  describe('Public Enquiry Submissions', () => {
    it('successfully submits a valid standard quotation request with catalog product', async () => {
      const payload = {
        customerName: 'Test John Retailer',
        businessName: 'John Stores Ltd',
        customerPhone: '+234 801 234 5678',
        customerEmail: 'john@stores.example.com',
        customerType: 'RETAILER',
        enquiryType: 'QUOTE_STANDARD',
        customerMessage: 'Looking for prompt delivery next week.',
        items: [
          {
            productSlug: testProduct.slug,
            quantity: 5000,
            unit: 'pieces',
            size: '12x18 inches',
            color: 'Green',
            customPrinting: '2 colours on one side',
          },
        ],
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reference');
      expect(res.body.data.reference).toMatch(/^DF-\d{6}-[A-Z0-9]{4,6}$/);
      expect(res.body.data.customerName).toBe('Test John Retailer');
      expect(res.body.data.status).toBe('NEW');
      expect(res.body.data).toHaveProperty('message');
      // Must NOT leak internal IDs, note fields, or private database internals
      expect(res.body.data).not.toHaveProperty('id');
      expect(res.body.data).not.toHaveProperty('internalNotes');
      expect(res.body.data).not.toHaveProperty('notes');
    });

    it('successfully submits a valid general contact enquiry without items', async () => {
      const payload = {
        customerName: 'Test Sarah Smith',
        customerPhone: '08098765432',
        customerEmail: 'sarah@example.com',
        customerType: 'INDIVIDUAL',
        enquiryType: 'CONTACT_GENERAL',
        customerMessage: 'Do you offer factory visits for bulk industrial buyers?',
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toMatch(/^DF-\d{6}-[A-Z0-9]{4,6}$/);
      expect(res.body.data.enquiryType).toBe('CONTACT_GENERAL');
    });

    it('successfully submits a custom packaging request without a catalogue product ID', async () => {
      const payload = {
        customerName: 'Test Commercial Logistics',
        businessName: 'Apex Logistics Inc',
        customerPhone: '+234 703 111 2233',
        customerType: 'COMMERCIAL',
        enquiryType: 'QUOTE_CUSTOM',
        customerMessage: 'We need heavy-gauge gusseted pallet wrap with UV stabiliser.',
        items: [
          {
            productName: 'Heavy Duty UV Pallet Film',
            quantity: 200,
            unit: 'rolls',
            gauge: '80 microns',
            size: '500mm wide',
          },
        ],
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toBeDefined();
    });

    it('successfully accepts submission with optional fields omitted', async () => {
      const payload = {
        customerName: 'Test Minimalist Buyer',
        customerPhone: '08011223344',
        customerType: 'INDIVIDUAL',
        enquiryType: 'QUOTE_STANDARD',
        items: [
          {
            productSlug: testProduct.slug,
          },
        ],
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toBeDefined();
    });

    it('rejects submission with invalid email format', async () => {
      const payload = {
        customerName: 'Test Bad Email',
        customerPhone: '08011223344',
        customerEmail: 'not-an-email',
        customerType: 'INDIVIDUAL',
        enquiryType: 'CONTACT_GENERAL',
        customerMessage: 'Hello there.',
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects submission with missing required customerName or phone', async () => {
      const payload = {
        customerType: 'INDIVIDUAL',
        enquiryType: 'CONTACT_GENERAL',
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects submission referencing non-existent product slug', async () => {
      const payload = {
        customerName: 'Test Invalid Product Slug',
        customerPhone: '08011223344',
        customerType: 'INDIVIDUAL',
        enquiryType: 'QUOTE_STANDARD',
        items: [
          {
            productSlug: 'this-slug-does-not-exist-at-all',
          },
        ],
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PRODUCT_REFERENCE');
    });

    it('rejects submission referencing a product in a hidden category', async () => {
      const payload = {
        customerName: 'Test Hidden Product',
        customerPhone: '08011223344',
        customerType: 'INDIVIDUAL',
        enquiryType: 'QUOTE_STANDARD',
        items: [
          {
            productSlug: hiddenProduct.slug,
          },
        ],
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PRODUCT_UNAVAILABLE');
    });

    it('rejects submission with excessively long message (>3000 chars)', async () => {
      const payload = {
        customerName: 'Test Long Message',
        customerPhone: '08011223344',
        customerType: 'INDIVIDUAL',
        enquiryType: 'CONTACT_GENERAL',
        customerMessage: 'A'.repeat(3005),
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects submission with too many items (>20 items)', async () => {
      const payload = {
        customerName: 'Test Too Many Items',
        customerPhone: '08011223344',
        customerType: 'INDIVIDUAL',
        enquiryType: 'QUOTE_STANDARD',
        items: Array.from({ length: 25 }, (_, i) => ({
          productName: `Item #${i}`,
          quantity: 10,
        })),
      };

      const res = await request(app).post('/api/v1/enquiries').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ==========================================================================
  // SECTION 2: ADMINISTRATIVE ENQUIRY ENDPOINTS
  // ==========================================================================
  describe('Administrative Enquiry Management', () => {
    let createdEnquiryId: string = '';

    beforeAll(async () => {
      // Seed a known enquiry for administrative testing
      const seedRes = await request(app).post('/api/v1/enquiries').send({
        customerName: 'Test Admin Flow Customer',
        businessName: 'Flow Enterprises',
        customerPhone: '08055667788',
        customerEmail: 'flow@example.com',
        customerType: 'WHOLESALER',
        enquiryType: 'QUOTE_STANDARD',
        customerMessage: 'Need wholesale quote for monthly container.',
        items: [
          {
            productSlug: testProduct.slug,
            quantity: 20000,
            unit: 'pieces',
          },
        ],
      });

      expect(seedRes.status).toBe(201);
      const ref = seedRes.body.data.reference;

      // Find the ID in DB to test admin endpoints
      const inDb = await prisma.enquiry.findUnique({ where: { reference: ref } });
      expect(inDb).not.toBeNull();
      createdEnquiryId = inDb!.id;
    });

    it('rejects unauthenticated GET /api/v1/admin/enquiries with 401', async () => {
      const res = await request(app).get('/api/v1/admin/enquiries');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated GET /api/v1/admin/enquiries/:id with 401', async () => {
      const res = await request(app).get(`/api/v1/admin/enquiries/${createdEnquiryId}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated PATCH /api/v1/admin/enquiries/:id/status with 401', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/enquiries/${createdEnquiryId}/status`)
        .send({ status: 'IN_REVIEW' });
      expect(res.status).toBe(401);
    });

    it('allows authenticated admin to list enquiries with pagination and meta', async () => {
      const res = await adminAgent.get('/api/v1/admin/enquiries?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.total).toBeGreaterThan(0);

      // Verify list items do not leak private internal notes
      for (const item of res.body.data) {
        expect(item).not.toHaveProperty('notes');
        expect(item).not.toHaveProperty('internalNotes');
      }
    });

    it('filters enquiries by status and search keyword', async () => {
      const res = await adminAgent.get('/api/v1/admin/enquiries?status=new&search=Flow');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].customerName).toContain('Flow');
    });

    it('allows authenticated admin to fetch full enquiry details including items', async () => {
      const res = await adminAgent.get(`/api/v1/admin/enquiries/${createdEnquiryId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdEnquiryId);
      expect(res.body.data.customerName).toBe('Test Admin Flow Customer');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].productName).toBe(testProduct.name);
      expect(Array.isArray(res.body.data.notes)).toBe(true);
    });

    it('returns 404 for non-existent enquiry ID', async () => {
      const res = await adminAgent.get('/api/v1/admin/enquiries/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ENQUIRY_NOT_FOUND');
    });

    it('allows updating enquiry status with valid enum and CSRF token', async () => {
      const res = await adminAgent
        .patch(`/api/v1/admin/enquiries/${createdEnquiryId}/status`)
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ status: 'IN_REVIEW' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_REVIEW');

      // Verify in DB
      const updated = await prisma.enquiry.findUnique({ where: { id: createdEnquiryId } });
      expect(updated?.status).toBe('IN_REVIEW');
    });

    it('rejects status update with invalid status string', async () => {
      const res = await adminAgent
        .patch(`/api/v1/admin/enquiries/${createdEnquiryId}/status`)
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ status: 'INVALID_STATUS_VALUE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects status update without CSRF token', async () => {
      const res = await adminAgent
        .patch(`/api/v1/admin/enquiries/${createdEnquiryId}/status`)
        .send({ status: 'CONTACTED' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CSRF_TOKEN_INVALID');
    });
  });

  // ==========================================================================
  // SECTION 3: INTERNAL STAFF NOTES CRUD & AUTHORIZATION
  // ==========================================================================
  describe('Internal Staff Notes CRUD', () => {
    let testEnquiryId: string = '';
    let createdNoteId: string = '';

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/enquiries').send({
        customerName: 'Test Notes Subject Customer',
        customerPhone: '08099887766',
        customerType: 'INDIVIDUAL',
        enquiryType: 'CONTACT_GENERAL',
        customerMessage: 'Inquiry for note permissions test.',
      });

      const inDb = await prisma.enquiry.findUnique({ where: { reference: res.body.data.reference } });
      testEnquiryId = inDb!.id;
    });

    it('rejects note creation when unauthenticated', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/enquiries/${testEnquiryId}/notes`)
        .send({ content: 'Unauthenticated note.' });

      expect(res.status).toBe(401);
    });

    it('allows staff or admin to add an internal note', async () => {
      const res = await staffAgent
        .post(`/api/v1/admin/enquiries/${testEnquiryId}/notes`)
        .set('X-CSRF-Token', staffCsrfToken)
        .send({ content: 'Spoke with client on phone. Requested sample kit.' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Spoke with client on phone. Requested sample kit.');
      expect(res.body.data.author).toBeDefined();
      expect(res.body.data.author.email).toBe(testStaffEmail);

      createdNoteId = res.body.data.id;
    });

    it('lists internal notes for authorized enquiry', async () => {
      const res = await adminAgent.get(`/api/v1/admin/enquiries/${testEnquiryId}/notes`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(createdNoteId);
    });

    it('allows the author or an admin to update a note', async () => {
      const res = await staffAgent
        .patch(`/api/v1/admin/enquiries/${testEnquiryId}/notes/${createdNoteId}`)
        .set('X-CSRF-Token', staffCsrfToken)
        .send({ content: 'Updated note: Sample kit dispatched via courier.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Updated note: Sample kit dispatched via courier.');
    });

    it('returns 404 when attempting to update note that belongs to a different enquiry', async () => {
      const fakeEnquiryId = '11111111-1111-1111-1111-111111111111';
      const res = await adminAgent
        .patch(`/api/v1/admin/enquiries/${fakeEnquiryId}/notes/${createdNoteId}`)
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ content: 'Tamper attempt' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOTE_NOT_FOUND');
    });

    it('allows admin to delete an internal note', async () => {
      const res = await adminAgent
        .delete(`/api/v1/admin/enquiries/${testEnquiryId}/notes/${createdNoteId}`)
        .set('X-CSRF-Token', adminCsrfToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion in DB
      const inDb = await prisma.enquiryNote.findUnique({ where: { id: createdNoteId } });
      expect(inDb).toBeNull();
    });
  });
});
