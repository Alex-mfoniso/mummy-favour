import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../types/api.js';
import {
  CreateOrderInput,
  ListOrdersQuery,
  RecordPaymentInput,
  DispatchOrderInput,
} from '../schemas/order.schema.js';

export class OrderRepository {
  /**
   * Generate next sequential order number: DF-ORD-XXXXXX
   */
  async generateOrderNumber(): Promise<string> {
    const count = await prisma.order.count();
    const sequence = count + 1;
    const candidate = `DF-ORD-${String(sequence).padStart(6, '0')}`;

    // Verify uniqueness
    const exists = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });

    if (!exists) {
      return candidate;
    }

    // Fallback if sequence collides
    const timestampSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DF-ORD-${String(sequence).padStart(4, '0')}-${timestampSuffix}`;
  }

  /**
   * Find order by ID with all relations
   */
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'asc' },
          include: {
            verifiedBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        dispatch: {
          include: {
            releaseAuthorizedBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        enquiry: {
          select: { id: true, reference: true, status: true, customerName: true },
        },
      },
    });
  }

  /**
   * Find order by Order Number
   */
  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'asc' },
        },
        dispatch: true,
      },
    });
  }

  /**
   * List orders with filtering and pagination
   */
  async findAll(options: ListOrdersQuery) {
    const { page, limit, search, status, paymentStatus, productionStatus } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (productionStatus) {
      where.productionStatus = productionStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payments: {
            select: { id: true, paymentType: true, amountExpected: true, amountReceived: true, status: true },
          },
          dispatch: {
            select: { id: true, dispatchMethod: true, dispatchStatus: true, waybillNumber: true },
          },
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      orders,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create new Order with Snapshot items, 50/50 breakdown, initial Payment and Dispatch records
   */
  async createOrder(data: CreateOrderInput, createdById?: string) {
    const orderNumber = await this.generateOrderNumber();

    // Calculate subtotal from items
    const subtotal = data.items.reduce((sum, item) => {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      return sum + lineTotal;
    }, 0);

    const discount = Number(data.discount || 0);
    const totalAmount = Math.max(0, subtotal - discount);

    // Exact 50/50 division using minor currency units (cents / kobo)
    const totalCents = Math.round(totalAmount * 100);
    const depositCents = Math.floor(totalCents / 2);
    const balanceCents = totalCents - depositCents;
    const depositRequired = depositCents / 100;
    const balanceRequired = balanceCents / 100;

    return prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          enquiryId: data.enquiryId || null,
          customerName: data.customerName,
          customerEmail: data.customerEmail || null,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress || null,
          currency: data.currency || 'NGN',
          subtotal: new Prisma.Decimal(subtotal),
          discount: new Prisma.Decimal(discount),
          totalAmount: new Prisma.Decimal(totalAmount),
          depositRequired: new Prisma.Decimal(depositRequired),
          balanceRequired: new Prisma.Decimal(balanceRequired),
          depositPaid: new Prisma.Decimal(0),
          balancePaid: new Prisma.Decimal(0),
          paymentStatus: 'PENDING_DEPOSIT',
          productionStatus: 'AWAITING_DEPOSIT',
          status: 'AWAITING_DEPOSIT',
          notes: data.notes || null,
          createdById: createdById || null,
        },
      });

      // 2. Create Order Items
      for (const item of data.items) {
        const itemLineTotal = Number(item.quantity) * Number(item.unitPrice);
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId || null,
            productName: item.productName,
            specifications: item.specifications || null,
            quantity: item.quantity,
            unit: item.unit || 'bundles',
            unitPrice: new Prisma.Decimal(item.unitPrice),
            lineTotal: new Prisma.Decimal(itemLineTotal),
          },
        });
      }

      // 3. Create Dispatch record
      await tx.dispatch.create({
        data: {
          orderId: order.id,
          dispatchMethod: data.dispatchMethod || 'WAYBILL',
          dispatchStatus: 'NOT_DISPATCHED',
        },
      });

      // 4. Create initial pending Deposit payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentType: 'DEPOSIT',
          amountExpected: new Prisma.Decimal(depositRequired),
          status: 'PENDING',
        },
      });

      // 5. If linked to an enquiry, update enquiry status
      if (data.enquiryId) {
        await tx.enquiry.update({
          where: { id: data.enquiryId },
          data: {
            status: 'CLOSED',
            internalNotes: `Converted to confirmed order ${orderNumber}`,
          },
        });
      }

      return order;
    });
  }

  /**
   * Record a reported payment (Deposit or Balance)
   */
  async recordPayment(orderId: string, input: RecordPaymentInput) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payments: true },
      });

      if (!order) {
        throw new AppError('Order not found', 404, 'NOT_FOUND');
      }

      // Find existing pending payment for this type or create new
      const existingPayment = order.payments.find(
        (p) => p.paymentType === input.paymentType && (p.status === 'PENDING' || p.status === 'REJECTED')
      );

      const expectedAmount =
        input.paymentType === 'DEPOSIT' ? order.depositRequired : order.balanceRequired;

      let payment;
      if (existingPayment) {
        payment = await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            amountReceived: new Prisma.Decimal(input.amountReceived),
            paymentMethod: input.paymentMethod,
            paymentReference: input.paymentReference || null,
            customerClaimRef: input.customerClaimRef || null,
            internalNotes: input.internalNotes || null,
            status: 'SUBMITTED',
          },
        });
      } else {
        payment = await tx.payment.create({
          data: {
            orderId,
            paymentType: input.paymentType,
            amountExpected: expectedAmount,
            amountReceived: new Prisma.Decimal(input.amountReceived),
            paymentMethod: input.paymentMethod,
            paymentReference: input.paymentReference || null,
            customerClaimRef: input.customerClaimRef || null,
            internalNotes: input.internalNotes || null,
            status: 'SUBMITTED',
          },
        });
      }

      // Update Order payment status to indicate payment was submitted
      const newOrderPaymentStatus =
        input.paymentType === 'DEPOSIT' ? 'DEPOSIT_SUBMITTED' : 'BALANCE_SUBMITTED';

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: newOrderPaymentStatus,
        },
      });

      return payment;
    });
  }

  /**
   * Verify or reject a payment with strict invariants
   */
  async verifyPayment(
    orderId: string,
    paymentId: string,
    status: 'VERIFIED' | 'REJECTED',
    verifiedById: string,
    internalNotes?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment || payment.orderId !== orderId) {
        throw new AppError('Payment record not found for this order', 404, 'NOT_FOUND');
      }

      // Update payment record
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          verifiedById,
          verifiedAt: new Date(),
          internalNotes: internalNotes || payment.internalNotes,
        },
      });

      // Recalculate verified totals for the order
      const allPayments = await tx.payment.findMany({
        where: { orderId },
      });

      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
      });

      let verifiedDeposit = 0;
      let verifiedBalance = 0;

      for (const p of allPayments) {
        if (p.status === 'VERIFIED') {
          const amt = Number(p.amountReceived || p.amountExpected);
          if (p.paymentType === 'DEPOSIT') {
            verifiedDeposit += amt;
          } else if (p.paymentType === 'BALANCE') {
            verifiedBalance += amt;
          }
        }
      }

      const totalVerified = verifiedDeposit + verifiedBalance;
      const totalAmount = Number(order.totalAmount);
      const isPaidInFull = totalVerified >= totalAmount;

      // Determine updated order payment status
      let newPaymentStatus = order.paymentStatus;
      if (isPaidInFull) {
        newPaymentStatus = 'PAID_IN_FULL';
      } else if (verifiedDeposit >= Number(order.depositRequired)) {
        newPaymentStatus = 'DEPOSIT_VERIFIED';
      } else if (status === 'REJECTED') {
        newPaymentStatus = 'PENDING_DEPOSIT';
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          depositPaid: new Prisma.Decimal(verifiedDeposit),
          balancePaid: new Prisma.Decimal(verifiedBalance),
          paymentStatus: newPaymentStatus,
        },
      });

      return updatedPayment;
    });
  }

  /**
   * Update Production Status with strict deposit enforcement
   */
  async updateProductionStatus(
    orderId: string,
    productionStatus: 'AWAITING_DEPOSIT' | 'IN_PRODUCTION' | 'PRODUCTION_COMPLETED' | 'READY_FOR_DISPATCH',
    notes?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    // BUSINESS INVARIANT: Deposit MUST be verified before production begins
    if (
      productionStatus === 'IN_PRODUCTION' &&
      Number(order.depositPaid) < Number(order.depositRequired)
    ) {
      throw new AppError(
        'Production cannot begin before the 50% deposit has been verified by Divine Favour.',
        400,
        'DEPOSIT_NOT_VERIFIED'
      );
    }

    let newOrderStatus = order.status;
    if (productionStatus === 'IN_PRODUCTION') {
      newOrderStatus = 'IN_PRODUCTION';
    } else if (productionStatus === 'PRODUCTION_COMPLETED') {
      newOrderStatus = 'PRODUCTION_COMPLETED';
    } else if (productionStatus === 'READY_FOR_DISPATCH') {
      newOrderStatus = 'READY_FOR_DISPATCH';
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        productionStatus,
        status: newOrderStatus,
        notes: notes ? `${order.notes ? order.notes + '\n' : ''}${notes}` : order.notes,
      },
      include: {
        items: true,
        payments: true,
        dispatch: true,
      },
    });
  }

  /**
   * Dispatch order to transport park / waybill
   */
  async dispatchOrder(orderId: string, input: DispatchOrderInput) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { dispatch: true },
      });

      if (!order) {
        throw new AppError('Order not found', 404, 'NOT_FOUND');
      }

      if (
        order.productionStatus !== 'READY_FOR_DISPATCH' &&
        order.productionStatus !== 'PRODUCTION_COMPLETED'
      ) {
        throw new AppError(
          'Order is not ready for dispatch. Production must be completed first.',
          400,
          'PRODUCTION_NOT_COMPLETED'
        );
      }

      const updatedDispatch = await tx.dispatch.upsert({
        where: { orderId },
        create: {
          orderId,
          dispatchMethod: input.dispatchMethod,
          transportCompany: input.transportCompany || null,
          parkDestination: input.parkDestination || null,
          waybillNumber: input.waybillNumber || null,
          driverName: input.driverName || null,
          driverPhone: input.driverPhone || null,
          vehiclePlate: input.vehiclePlate || null,
          dispatchStatus: 'IN_TRANSIT_TO_PARK',
          dispatchedAt: new Date(),
        },
        update: {
          dispatchMethod: input.dispatchMethod,
          transportCompany: input.transportCompany || null,
          parkDestination: input.parkDestination || null,
          waybillNumber: input.waybillNumber || null,
          driverName: input.driverName || null,
          driverPhone: input.driverPhone || null,
          vehiclePlate: input.vehiclePlate || null,
          dispatchStatus: 'IN_TRANSIT_TO_PARK',
          dispatchedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'DISPATCHED_TO_PARK',
        },
      });

      return updatedDispatch;
    });
  }

  /**
   * Record driver / transporter arrival confirmation at destination park.
   * Prompts customer that balance payment is due, goods held in AWAITING_BALANCE.
   */
  async recordParkArrival(orderId: string, arrivalConfirmerName: string, arrivalNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { dispatch: true },
      });

      if (!order || !order.dispatch) {
        throw new AppError('Dispatch record not found for this order', 404, 'NOT_FOUND');
      }

      if (order.dispatch.dispatchStatus !== 'IN_TRANSIT_TO_PARK') {
        throw new AppError('Cannot record arrival. Order has not been dispatched yet.', 400, 'NOT_DISPATCHED');
      }

      const updatedDispatch = await tx.dispatch.update({
        where: { orderId },
        data: {
          dispatchStatus: 'ARRIVED_AT_PARK',
          parkArrivalConfirmedAt: new Date(),
          arrivalConfirmerName,
          arrivalNotes: arrivalNotes || null,
          balanceRequestedAt: new Date(),
        },
      });

      // Update order status to AWAITING_BALANCE
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'AWAITING_BALANCE',
        },
      });

      // Ensure a pending BALANCE payment record exists if not already present
      const existingBalancePayment = await tx.payment.findFirst({
        where: { orderId, paymentType: 'BALANCE' },
      });

      if (!existingBalancePayment) {
        await tx.payment.create({
          data: {
            orderId,
            paymentType: 'BALANCE',
            amountExpected: order.balanceRequired,
            status: 'PENDING',
          },
        });
      }

      return updatedDispatch;
    });
  }

  /**
   * Authorize release of goods at park.
   * STRICT BUSINESS INVARIANT: Order MUST be verified PAID_IN_FULL!
   */
  async authorizeRelease(orderId: string, authorizedById: string, releaseNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { dispatch: true },
      });

      if (!order || !order.dispatch) {
        throw new AppError('Dispatch record not found for this order', 404, 'NOT_FOUND');
      }

      // STRICT BUSINESS INVARIANT: Outstanding balance MUST NOT EXIST!
      if (order.paymentStatus !== 'PAID_IN_FULL') {
        throw new AppError(
          'RELEASE NOT AUTHORIZED: The order is not paid in full. Divine Favour must verify the remaining 50% balance before goods can be cleared for release.',
          400,
          'BALANCE_NOT_VERIFIED'
        );
      }

      const updatedDispatch = await tx.dispatch.update({
        where: { orderId },
        data: {
          dispatchStatus: 'CLEARED_FOR_RELEASE',
          releaseAuthorizedById: authorizedById,
          releaseAuthorizedAt: new Date(),
          releaseNotes: releaseNotes || null,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CLEARED_FOR_RELEASE',
        },
      });

      return updatedDispatch;
    });
  }

  /**
   * Mark goods confirmed as handed over / released to customer, completing order.
   */
  async confirmReleaseHandover(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { dispatch: true },
      });

      if (!order || !order.dispatch) {
        throw new AppError('Order not found', 404, 'NOT_FOUND');
      }

      if (order.dispatch.dispatchStatus !== 'CLEARED_FOR_RELEASE') {
        throw new AppError('Goods must be cleared for release before completing release handover.', 400, 'RELEASE_NOT_CLEARED');
      }

      const updatedDispatch = await tx.dispatch.update({
        where: { orderId },
        data: {
          dispatchStatus: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
        },
        include: {
          items: true,
          payments: true,
          dispatch: true,
        },
      });

      return { order: updatedOrder, dispatch: updatedDispatch };
    });
  }
}

export const orderRepository = new OrderRepository();
