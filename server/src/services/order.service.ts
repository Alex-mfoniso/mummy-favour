import { orderRepository } from '../repositories/order.repository.js';
import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { AppError } from '../types/api.js';
import {
  CreateOrderInput,
  ListOrdersQuery,
  RecordPaymentInput,
  DispatchOrderInput,
} from '../schemas/order.schema.js';

export class OrderService {
  async listOrders(query: ListOrdersQuery) {
    return orderRepository.findAll(query);
  }

  async getOrderById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }
    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }
    return order;
  }

  async createOrder(
    data: CreateOrderInput,
    actor: { id: string; name: string; role: string; ipAddress?: string; userAgent?: string }
  ) {
    const order = await orderRepository.createOrder(data, actor.id);

    await auditLogRepository.create({
      action: 'ORDER_CREATED',
      actorId: actor.id,
      details: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        depositRequired: order.depositRequired,
        balanceRequired: order.balanceRequired,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return order;
  }

  async recordPayment(
    orderId: string,
    input: RecordPaymentInput,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const payment = await orderRepository.recordPayment(orderId, input);

    await auditLogRepository.create({
      action: 'PAYMENT_RECORDED',
      actorId: actor.id,
      details: {
        orderId,
        paymentId: payment.id,
        paymentType: payment.paymentType,
        amountReceived: payment.amountReceived,
        paymentMethod: payment.paymentMethod,
        paymentReference: payment.paymentReference,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return payment;
  }

  async verifyPayment(
    orderId: string,
    paymentId: string,
    status: 'VERIFIED' | 'REJECTED',
    actor: { id: string; ipAddress?: string; userAgent?: string },
    internalNotes?: string
  ) {
    const payment = await orderRepository.verifyPayment(
      orderId,
      paymentId,
      status,
      actor.id,
      internalNotes
    );

    await auditLogRepository.create({
      action: status === 'VERIFIED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
      actorId: actor.id,
      details: {
        orderId,
        paymentId,
        paymentType: payment.paymentType,
        status,
        internalNotes,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return payment;
  }

  async updateProductionStatus(
    orderId: string,
    productionStatus: 'AWAITING_DEPOSIT' | 'IN_PRODUCTION' | 'PRODUCTION_COMPLETED' | 'READY_FOR_DISPATCH',
    actor: { id: string; ipAddress?: string; userAgent?: string },
    notes?: string
  ) {
    const order = await orderRepository.updateProductionStatus(orderId, productionStatus, notes);

    await auditLogRepository.create({
      action: 'PRODUCTION_STATUS_CHANGED',
      actorId: actor.id,
      details: {
        orderId,
        productionStatus,
        notes,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return order;
  }

  async dispatchOrder(
    orderId: string,
    input: DispatchOrderInput,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const dispatch = await orderRepository.dispatchOrder(orderId, input);

    await auditLogRepository.create({
      action: 'ORDER_DISPATCHED',
      actorId: actor.id,
      details: {
        orderId,
        transportCompany: input.transportCompany,
        parkDestination: input.parkDestination,
        waybillNumber: input.waybillNumber,
        driverName: input.driverName,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return dispatch;
  }

  async recordParkArrival(
    orderId: string,
    arrivalConfirmerName: string,
    actor: { id: string; ipAddress?: string; userAgent?: string },
    arrivalNotes?: string
  ) {
    const dispatch = await orderRepository.recordParkArrival(
      orderId,
      arrivalConfirmerName,
      arrivalNotes
    );

    await auditLogRepository.create({
      action: 'PARK_ARRIVAL_CONFIRMED',
      actorId: actor.id,
      details: {
        orderId,
        arrivalConfirmerName,
        arrivalNotes,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return dispatch;
  }

  async authorizeRelease(
    orderId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string },
    releaseNotes?: string
  ) {
    const dispatch = await orderRepository.authorizeRelease(orderId, actor.id, releaseNotes);

    await auditLogRepository.create({
      action: 'RELEASE_AUTHORIZED',
      actorId: actor.id,
      details: {
        orderId,
        releaseNotes,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return dispatch;
  }

  async confirmReleaseHandover(
    orderId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const result = await orderRepository.confirmReleaseHandover(orderId);

    await auditLogRepository.create({
      action: 'ORDER_COMPLETED',
      actorId: actor.id,
      details: {
        orderId,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return result;
  }
}

export const orderService = new OrderService();
