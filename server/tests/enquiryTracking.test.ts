import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { PasswordService } from '../src/services/password.service.js';
import { AdminRole, CategoryVisibility } from '@prisma/client';

describe('Phase 12.5: Customer Enquiry Tracking and Confirmation APIs', () => {
  const app = createApp();

  let adminAgent: ReturnType<typeof request.agent>;
  let adminCsrfToken: string = '';
  let adminUserId: string = '';

  const testAdminEmail = `tracking-admin-${Date.now()}@divinefavour.com`;
  const testPassword = 'Password123!';

  let testCategory: any;
  let testProduct: any;

  beforeAll(async () => {
    // 1. Create test admin user
    const hash = await PasswordService.hashPassword(testPassword);
    const adminUser = await prisma.adminUser.create({
      data: {
        name: 'Tracking Admin',
        email: testAdminEmail,
        passwordHash: hash,
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });
    adminUserId = adminUser.id;

    // 2. Create test category and product
    testCategory = await prisma.category.create({
      data: {
        name: `Track Cat ${Date.now()}`,
        slug: `track-cat-${Date.now()}`,
        description: 'Tracking test category',
        visibility: CategoryVisibility.VISIBLE,
      },
    });

    testProduct = await prisma.product.create({
      data: {
        name: `Track Bag ${Date.now()}`,
        slug: `track-bag-${Date.now()}`,
        shortDescription: 'Tracking bag item',
        description: 'Detailed description for tracking bag',
        categoryId: testCategory.id,
      },
    });

    // 3. Authenticate admin
    adminAgent = request.agent(app);
    const adminLoginRes = await adminAgent.post('/api/v1/auth/login').send({
      email: testAdminEmail,
      password: testPassword,
    });
    expect(adminLoginRes.status).toBe(200);
    adminCsrfToken = adminLoginRes.body.data.csrfToken;
  });

  afterAll(async () => {
    // Clean up created records
    try {
      await prisma.enquiry.deleteMany({
        where: { customerEmail: { contains: 'test-tracker' } },
      });
      if (testProduct?.id) {
        await prisma.product.delete({ where: { id: testProduct.id } }).catch(() => {});
      }
      if (testCategory?.id) {
        await prisma.category.delete({ where: { id: testCategory.id } }).catch(() => {});
      }
      if (adminUserId) {
        await prisma.adminUser.delete({ where: { id: adminUserId } }).catch(() => {});
      }
    } catch (e) {
      console.error('Cleanup error:', e);
    }
  });

  describe('1. Enquiry Submission & Credential Generation', () => {
    it('creates an enquiry, generates unique reference and raw tracking token, and hashes token in DB', async () => {
      const submissionPayload = {
        customerName: 'Chinedu Okeke',
        businessName: 'Okeke Retail Ventures',
        customerPhone: '+234 803 111 2233',
        customerEmail: 'chinedu.test-tracker@example.com',
        customerType: 'WHOLESALER',
        enquiryType: 'QUOTE_STANDARD',
        subject: 'Quotation for Retail Packaging',
        productId: testProduct.id,
        items: [
          {
            requestedProductName: 'Printed Shopping Carrier',
            quantity: 5000,
            unit: 'pieces',
            size: '12 x 18 inches',
            gauge: '35 microns',
            color: 'White',
            customPrinting: '2-color branded logo',
          },
        ],
      };

      const res = await request(app)
        .post('/api/v1/enquiries')
        .send(submissionPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { reference, trackingToken, trackingUrl, message } = res.body.data;

      // 1. Reference format
      expect(reference).toMatch(/^DF-\d{6}-[A-Z0-9]{6}$/);
      expect(message).toBeDefined();

      // 2. Raw tracking token returned on initial creation
      expect(trackingToken).toBeDefined();
      expect(typeof trackingToken).toBe('string');
      expect(trackingToken.length).toBe(64); // 32 bytes hex

      // 3. Tracking URL
      expect(trackingUrl).toBe(`/track-enquiry?token=${trackingToken}`);

      // 4. Verify Database Persistence: Only SHA-256 hash is stored, never raw token
      const dbRecord = await prisma.enquiry.findUnique({
        where: { reference },
      });

      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.trackingTokenHash).toBeDefined();
      expect(dbRecord?.trackingTokenHash).not.toBe(trackingToken);

      const expectedHash = crypto.createHash('sha256').update(trackingToken).digest('hex');
      expect(dbRecord?.trackingTokenHash).toBe(expectedHash);
    });

    it('generates unique collision-resistant references across successive submissions', async () => {
      const references = new Set<string>();

      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post('/api/v1/enquiries')
          .send({
            customerName: `Customer ${i}`,
            customerPhone: `+234 809 000 000${i}`,
            customerEmail: `user${i}.test-tracker@example.com`,
            customerType: 'individual',
            enquiryType: 'contact_general',
            subject: `General Question ${i}`,
            customerMessage: 'Inquiring about catalog prices.',
          });

        expect(res.status).toBe(201);
        const ref = res.body.data.reference;
        expect(references.has(ref)).toBe(false);
        references.add(ref);
      }

      expect(references.size).toBe(3);
    });
  });

  describe('2. Secure Customer Enquiry Tracking (/api/v1/enquiries/track)', () => {
    let savedReference: string;
    let savedTrackingToken: string;
    let internalEnquiryId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/enquiries')
        .send({
          customerName: 'Amina Bello',
          businessName: 'Bello Logistics Ltd',
          customerPhone: '+234 802 444 5566',
          customerEmail: 'amina.test-tracker@example.com',
          customerType: 'COMMERCIAL',
          enquiryType: 'QUOTE_CUSTOM',
          subject: 'Custom Heavy Duty Sacks',
          customerMessage: 'Need high-density polyethylene bags for agricultural produce.',
          items: [
            {
              requestedProductName: 'Heavy Duty HDPE Sack',
              quantity: 10000,
              unit: 'pieces',
              size: '50kg capacity',
              gauge: '80 microns',
              color: 'Green',
              customPrinting: 'Front logo only',
            },
          ],
        });

      savedReference = res.body.data.reference;
      savedTrackingToken = res.body.data.trackingToken;

      const record = await prisma.enquiry.findUnique({
        where: { reference: savedReference },
      });
      internalEnquiryId = record!.id;
    });

    it('retrieves enquiry tracking details via valid query parameter ?token=', async () => {
      const res = await request(app)
        .get(`/api/v1/enquiries/track?token=${savedTrackingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const tracking = res.body.data;
      expect(tracking.reference).toBe(savedReference);
      expect(tracking.status).toBe('received');
      expect(tracking.statusTitle).toBe('Enquiry Received');
      expect(tracking.stepNumber).toBe(1);
      expect(tracking.totalSteps).toBe(4);
      expect(tracking.enquiryType).toBe('quote_custom');
      expect(tracking.subject).toBe('Custom Heavy Duty Sacks');

      // Masked customer name (privacy protection)
      expect(tracking.customerName).toBe('A. Bello');
      expect(tracking.businessName).toBe('Bello Logistics Ltd');

      // Safe item specification
      expect(tracking.items).toHaveLength(1);
      expect(tracking.items[0].requestedProductName).toBe('Heavy Duty HDPE Sack');
      expect(tracking.items[0].quantity).toBe(10000);
      expect(tracking.items[0].unit).toBe('pieces');
    });

    it('retrieves tracking details via X-Tracking-Token header', async () => {
      const res = await request(app)
        .get('/api/v1/enquiries/track')
        .set('X-Tracking-Token', savedTrackingToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference).toBe(savedReference);
    });

    it('STRICT PRIVACY: never leaks internal notes, internal UUIDs, phone, or email to customer tracking', async () => {
      // Add internal staff note to this enquiry
      await adminAgent
        .post(`/api/v1/admin/enquiries/${internalEnquiryId}/notes`)
        .set('X-CSRF-Token', adminCsrfToken)
        .send({
          content: 'Confidential internal note: Client requested 5% bulk discount. Waiting for CEO approval.',
        });

      const res = await request(app)
        .get(`/api/v1/enquiries/track?token=${savedTrackingToken}`);

      expect(res.status).toBe(200);
      const tracking = res.body.data;

      // 1. No internal notes or notes array
      expect(tracking.notes).toBeUndefined();
      expect(tracking.internalNotes).toBeUndefined();
      expect(JSON.stringify(tracking)).not.toContain('Confidential internal note');

      // 2. No internal database primary keys
      expect(tracking.id).toBeUndefined();

      // 3. No raw tracking token hash exposed
      expect(tracking.trackingTokenHash).toBeUndefined();

      // 4. No sensitive contact info in public tracking response
      expect(tracking.customerPhone).toBeUndefined();
      expect(tracking.customerEmail).toBeUndefined();
      expect(tracking.phone).toBeUndefined();
      expect(tracking.email).toBeUndefined();
    });

    it('rejects an invalid, tampered, or non-existent tracking token with generic 404', async () => {
      const fakeToken = crypto.randomBytes(32).toString('hex');
      const res = await request(app)
        .get(`/api/v1/enquiries/track?token=${fakeToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ENQUIRY_NOT_FOUND');
    });

    it('rejects short or malformed tokens with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/v1/enquiries/track?token=too-short');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_TRACKING_CREDENTIAL');
    });

    it('rejects tracking requests with no token provided with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/v1/enquiries/track');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_TRACKING_CREDENTIAL');
    });
  });

  describe('3. Status Mapping & Admin Workflow Integration', () => {
    let testRef: string;
    let testToken: string;
    let enquiryId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/enquiries')
        .send({
          customerName: 'Fatima Garba',
          customerPhone: '+234 812 777 8899',
          customerEmail: 'fatima.test-tracker@example.com',
          customerType: 'RETAILER',
          enquiryType: 'QUOTE_STANDARD',
          subject: 'Standard Bag Order',
          productId: testProduct.id,
        });

      testRef = res.body.data.reference;
      testToken = res.body.data.trackingToken;

      const record = await prisma.enquiry.findUnique({
        where: { reference: testRef },
      });
      enquiryId = record!.id;
    });

    it('reflects admin status changes accurately in customer tracking view', async () => {
      // 1. Initial status: received (Step 1)
      let trackRes = await request(app).get(`/api/v1/enquiries/track?token=${testToken}`);
      expect(trackRes.body.data.status).toBe('received');
      expect(trackRes.body.data.stepNumber).toBe(1);

      // 2. Admin transitions to IN_REVIEW -> customer sees under_review (Step 2)
      await adminAgent
        .patch(`/api/v1/admin/enquiries/${enquiryId}/status`)
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ status: 'in_review' });

      trackRes = await request(app).get(`/api/v1/enquiries/track?token=${testToken}`);
      expect(trackRes.body.data.status).toBe('under_review');
      expect(trackRes.body.data.stepNumber).toBe(2);
      expect(trackRes.body.data.statusTitle).toBe('Under Technical Review');

      // 3. Admin transitions to CONTACTED -> customer sees follow_up_in_progress (Step 3)
      await adminAgent
        .patch(`/api/v1/admin/enquiries/${enquiryId}/status`)
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ status: 'contacted' });

      trackRes = await request(app).get(`/api/v1/enquiries/track?token=${testToken}`);
      expect(trackRes.body.data.status).toBe('follow_up_in_progress');
      expect(trackRes.body.data.stepNumber).toBe(3);

      // 4. Admin transitions to QUOTED -> customer sees quotation_prepared (Step 4)
      await adminAgent
        .patch(`/api/v1/admin/enquiries/${enquiryId}/status`)
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ status: 'quoted' });

      trackRes = await request(app).get(`/api/v1/enquiries/track?token=${testToken}`);
      expect(trackRes.body.data.status).toBe('quotation_prepared');
      expect(trackRes.body.data.stepNumber).toBe(4);

      // 5. Admin transitions to CLOSED -> customer sees closed
      await adminAgent
        .patch(`/api/v1/admin/enquiries/${enquiryId}/status`)
        .set('X-CSRF-Token', adminCsrfToken)
        .send({ status: 'closed' });

      trackRes = await request(app).get(`/api/v1/enquiries/track?token=${testToken}`);
      expect(trackRes.body.data.status).toBe('closed');
      expect(trackRes.body.data.stepNumber).toBe(5);
    });

    it('allows admin to search and find enquiry by exact reference code', async () => {
      const res = await adminAgent
        .get(`/api/v1/admin/enquiries?search=${testRef}`)
        .set('X-CSRF-Token', adminCsrfToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const match = res.body.data.find((e: any) => e.reference === testRef);
      expect(match).toBeDefined();
      expect(match.reference).toBe(testRef);
    });
  });
});
