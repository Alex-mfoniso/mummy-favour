import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import { PasswordService } from '../src/services/password.service.js';
import { AdminRole, CategoryVisibility, CustomerType, EnquiryType } from '@prisma/client';

describe('Phase 14: Order Management, 50/50 Payments, and Waybill Dispatch Workflow', () => {
  const app = createApp();

  let adminAgent: ReturnType<typeof request.agent>;
  let adminCsrfToken: string = '';
  let adminUserId: string = '';

  const testAdminEmail = `order-admin-${Date.now()}@divinefavour.com`;
  const testPassword = 'Password123!';

  let testCategory: any;
  let testProduct: any;
  let testEnquiry: any;

  beforeAll(async () => {
    // 1. Create test admin user
    const hash = await PasswordService.hashPassword(testPassword);
    const adminUser = await prisma.adminUser.create({
      data: {
        name: 'Order SuperAdmin',
        email: testAdminEmail,
        passwordHash: hash,
        role: AdminRole.SUPERADMIN,
        isActive: true,
      },
    });
    adminUserId = adminUser.id;

    // 2. Create test category and product
    testCategory = await prisma.category.create({
      data: {
        name: `Order Cat ${Date.now()}`,
        slug: `order-cat-${Date.now()}`,
        description: 'Order test category',
        visibility: CategoryVisibility.VISIBLE,
      },
    });

    testProduct = await prisma.product.create({
      data: {
        name: `Order Bag ${Date.now()}`,
        slug: `order-bag-${Date.now()}`,
        shortDescription: 'Order bag item',
        description: 'Complete specification test bag for order management',
        categoryId: testCategory.id,
      },
    });

    // 3. Create test enquiry
    testEnquiry = await prisma.enquiry.create({
      data: {
        reference: `DF-TEST-${Date.now().toString().slice(-6)}`,
        trackingTokenHash: 'mocked-hash-for-orders-test',
        customerName: 'Chinedu Packaging Ltd',
        customerPhone: '+2348011223344',
        customerEmail: 'chinedu@example.com',
        customerType: CustomerType.COMMERCIAL,
        enquiryType: EnquiryType.QUOTE_STANDARD,
        status: 'QUOTED',
      },
    });

    // 4. Authenticate admin user session
    adminAgent = request.agent(app);
    const loginRes = await adminAgent
      .post('/api/v1/auth/login')
      .send({
        email: testAdminEmail,
        password: testPassword,
      });

    expect(loginRes.status).toBe(200);
    adminCsrfToken = loginRes.body.data.csrfToken;
  });

  afterAll(async () => {
    // Cleanup
    if (adminUserId) {
      await prisma.adminUser.deleteMany({ where: { email: testAdminEmail } });
    }
    if (testEnquiry?.id) {
      await prisma.order.deleteMany({ where: { enquiryId: testEnquiry.id } });
      await prisma.enquiry.deleteMany({ where: { id: testEnquiry.id } });
    }
    if (testProduct?.id) {
      await prisma.product.deleteMany({ where: { id: testProduct.id } });
    }
    if (testCategory?.id) {
      await prisma.category.deleteMany({ where: { id: testCategory.id } });
    }
    await prisma.$disconnect();
  });

  let createdOrderId: string = '';
  let depositPaymentId: string = '';
  let balancePaymentId: string = '';

  it('1. Creates an order with strict 50/50 payment split calculation', async () => {
    const payload = {
      enquiryId: testEnquiry.id,
      customerName: 'Chinedu Packaging Ltd',
      customerPhone: '+2348011223344',
      customerEmail: 'chinedu@example.com',
      deliveryAddress: 'Upper Iweka Transport Park, Onitsha',
      dispatchMethod: 'WAYBILL',
      discount: 0,
      notes: 'Urgent production for seasonal packaging',
      items: [
        {
          productName: 'Shopping Carrier Bags',
          specifications: '30 micron thickness, 2-color flexographic print',
          quantity: 20,
          unit: 'bundles',
          unitPrice: 25000, // 20 * 25,000 = 500,000 NGN
        },
      ],
    };

    const res = await adminAgent
      .post('/api/v1/admin/orders')
      .set('X-CSRF-Token', adminCsrfToken)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const order = res.body.data;
    createdOrderId = order.id;

    expect(order.orderNumber).toMatch(/^DF-ORD-\d{6}$/);
    expect(Number(order.totalAmount)).toBe(500000);
    expect(Number(order.depositRequired)).toBe(250000); // Exactly 50%
    expect(Number(order.balanceRequired)).toBe(250000); // Exactly 50%
    expect(Number(order.depositPaid)).toBe(0);
    expect(Number(order.balancePaid)).toBe(0);
    expect(order.status).toBe('AWAITING_DEPOSIT');
    expect(order.paymentStatus).toBe('PENDING_DEPOSIT');
    expect(order.productionStatus).toBe('AWAITING_DEPOSIT');
  });

  it('2. Invariant: Rejects starting production before deposit is verified', async () => {
    const res = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/production-status`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        productionStatus: 'IN_PRODUCTION',
        notes: 'Trying to start factory machines early',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.message || res.body.message).toMatch(/deposit has been verified/i);
  });

  it('3. Records and verifies 50% initial deposit payment', async () => {
    // Record payment
    const recordRes = await adminAgent
      .post(`/api/v1/admin/orders/${createdOrderId}/payments`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        paymentType: 'DEPOSIT',
        paymentMethod: 'Bank Transfer',
        amountReceived: 250000,
        paymentReference: 'ZENITH-TRF-998822',
        internalNotes: 'Deposit paid via Zenith Bank transfer',
      });

    expect(recordRes.status).toBe(201);
    expect(recordRes.body.success).toBe(true);
    depositPaymentId = recordRes.body.data.id;
    expect(recordRes.body.data.status).toBe('SUBMITTED');

    // Verify payment
    const verifyRes = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/payments/${depositPaymentId}/verify`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        status: 'VERIFIED',
        internalNotes: 'Bank alert confirmed in Divine Favour operations account',
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    // Fetch order to verify payment status
    const orderRes = await adminAgent.get(`/api/v1/admin/orders/${createdOrderId}`);
    expect(orderRes.status).toBe(200);
    const order = orderRes.body.data;
    expect(Number(order.depositPaid)).toBe(250000);
    expect(order.paymentStatus).toBe('DEPOSIT_VERIFIED');
  });

  it('4. Authorizes production and marks production completed', async () => {
    // Start production
    const startRes = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/production-status`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        productionStatus: 'IN_PRODUCTION',
        notes: 'Extrusion and bag printing started on machine 2',
      });

    expect(startRes.status).toBe(200);
    expect(startRes.body.data.productionStatus).toBe('IN_PRODUCTION');
    expect(startRes.body.data.status).toBe('IN_PRODUCTION');

    // Complete production
    const completeRes = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/production-status`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        productionStatus: 'PRODUCTION_COMPLETED',
        notes: 'Quality control passed. 20 bundles sealed and labelled.',
      });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.productionStatus).toBe('PRODUCTION_COMPLETED');

    // Ready for dispatch
    const readyRes = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/production-status`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        productionStatus: 'READY_FOR_DISPATCH',
      });

    expect(readyRes.status).toBe(200);
    expect(readyRes.body.data.status).toBe('READY_FOR_DISPATCH');
  });

  it('5. Dispatches order with transport park and driver waybill info', async () => {
    const dispatchPayload = {
      dispatchMethod: 'WAYBILL',
      transportCompany: 'Peace Mass Transit Logistcs',
      parkDestination: 'Upper Iweka Park, Onitsha',
      waybillNumber: 'PMT-WYB-2026-9812',
      driverName: 'Sunday Okafor',
      driverPhone: '+2348039876543',
      vehiclePlate: 'EN-882-ENU',
    };

    const res = await adminAgent
      .post(`/api/v1/admin/orders/${createdOrderId}/dispatch`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send(dispatchPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dispatch = res.body.data;
    expect(dispatch.dispatchStatus).toBe('IN_TRANSIT_TO_PARK');
    expect(dispatch.transportCompany).toBe('Peace Mass Transit Logistcs');
    expect(dispatch.waybillNumber).toBe('PMT-WYB-2026-9812');
    expect(dispatch.driverName).toBe('Sunday Okafor');

    // Verify order status updated to DISPATCHED_TO_PARK
    const orderRes = await adminAgent.get(`/api/v1/admin/orders/${createdOrderId}`);
    expect(orderRes.body.data.status).toBe('DISPATCHED_TO_PARK');
  });

  it('6. Driver confirms arrival at transport park (Awaiting Balance)', async () => {
    const res = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/park-arrival`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        arrivalConfirmerName: 'Sunday Okafor (Driver)',
        arrivalNotes: 'Driver phoned to confirm vehicle has safely berthed at Upper Iweka park.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dispatch = res.body.data;
    expect(dispatch.dispatchStatus).toBe('ARRIVED_AT_PARK');
    expect(dispatch.arrivalConfirmerName).toBe('Sunday Okafor (Driver)');

    // Verify order status updated to AWAITING_BALANCE
    const orderRes = await adminAgent.get(`/api/v1/admin/orders/${createdOrderId}`);
    expect(orderRes.body.data.status).toBe('AWAITING_BALANCE');
  });

  it('7. Invariant: Rejects clearing goods for release before final balance is verified', async () => {
    const res = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/authorize-release`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        releaseNotes: 'Attempting to release without balance verification',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.message || res.body.message).toMatch(/balance/i);
  });

  it('8. Records and verifies remaining 50% balance payment', async () => {
    // Record balance payment
    const recordRes = await adminAgent
      .post(`/api/v1/admin/orders/${createdOrderId}/payments`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        paymentType: 'BALANCE',
        paymentMethod: 'Bank Transfer',
        amountReceived: 250000,
        paymentReference: 'ZENITH-BAL-773311',
        internalNotes: 'Customer transferred final 50% balance after park arrival notice',
      });

    expect(recordRes.status).toBe(201);
    balancePaymentId = recordRes.body.data.id;

    // Verify balance payment
    const verifyRes = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/payments/${balancePaymentId}/verify`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        status: 'VERIFIED',
        internalNotes: 'Final balance verified in operations account',
      });

    expect(verifyRes.status).toBe(200);

    // Verify order is now fully paid
    const orderRes = await adminAgent.get(`/api/v1/admin/orders/${createdOrderId}`);
    const order = orderRes.body.data;
    expect(Number(order.balancePaid)).toBe(250000);
    expect(order.paymentStatus).toBe('PAID_IN_FULL');
  });

  it('9. Authorizes release after 100% full payment is verified', async () => {
    const res = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/authorize-release`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send({
        releaseNotes: 'Payment verified 100%. Park representative instructed to release packages.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dispatch = res.body.data;
    expect(dispatch.dispatchStatus).toBe('CLEARED_FOR_RELEASE');
    expect(dispatch.releaseAuthorizedAt).not.toBeNull();

    // Verify order status
    const orderRes = await adminAgent.get(`/api/v1/admin/orders/${createdOrderId}`);
    expect(orderRes.body.data.status).toBe('CLEARED_FOR_RELEASE');
  });

  it('10. Confirms customer handover and completes order', async () => {
    const res = await adminAgent
      .patch(`/api/v1/admin/orders/${createdOrderId}/confirm-handover`)
      .set('X-CSRF-Token', adminCsrfToken)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const result = res.body.data;
    expect(result.order.status).toBe('COMPLETED');
    expect(result.dispatch.dispatchStatus).toBe('RELEASED');
  });
});
