import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import {
  createOrderSchema,
  listOrdersQuerySchema,
  recordPaymentSchema,
  verifyPaymentSchema,
  updateProductionStatusSchema,
  dispatchOrderSchema,
  recordParkArrivalSchema,
  authorizeReleaseSchema,
} from '../schemas/order.schema.js';

function getActor(req: Request) {
  const user = (req as any).adminUser || (req as any).user;
  return {
    id: user?.id,
    name: user?.name,
    role: user?.role,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  };
}

export class OrderController {
  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listOrdersQuerySchema.parse(req.query);
      const result = await orderService.listOrders(query);
      res.json({
        success: true,
        data: result.orders,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createOrderSchema.parse(req.body);
      const actor = getActor(req);

      const order = await orderService.createOrder(input, actor);
      res.status(201).json({
        success: true,
        message: `Order ${order.orderNumber} created successfully.`,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = recordPaymentSchema.parse(req.body);
      const actor = getActor(req);

      const payment = await orderService.recordPayment(id, input, actor);
      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully.',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, paymentId } = req.params;
      const input = verifyPaymentSchema.parse(req.body);
      const actor = getActor(req);

      const payment = await orderService.verifyPayment(
        id,
        paymentId,
        input.status,
        actor,
        input.internalNotes || undefined
      );

      res.json({
        success: true,
        message: `Payment successfully marked as ${input.status}.`,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProductionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = updateProductionStatusSchema.parse(req.body);
      const actor = getActor(req);

      const order = await orderService.updateProductionStatus(
        id,
        input.productionStatus,
        actor,
        input.notes || undefined
      );

      res.json({
        success: true,
        message: `Production status updated to ${input.productionStatus}.`,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async dispatchOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = dispatchOrderSchema.parse(req.body);
      const actor = getActor(req);

      const dispatch = await orderService.dispatchOrder(id, input, actor);
      res.json({
        success: true,
        message: 'Order dispatched successfully.',
        data: dispatch,
      });
    } catch (error) {
      next(error);
    }
  }

  async recordParkArrival(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = recordParkArrivalSchema.parse(req.body);
      const actor = getActor(req);

      const dispatch = await orderService.recordParkArrival(
        id,
        input.arrivalConfirmerName,
        actor,
        input.arrivalNotes || undefined
      );

      res.json({
        success: true,
        message: 'Park arrival confirmed. Goods held awaiting final 50% balance.',
        data: dispatch,
      });
    } catch (error) {
      next(error);
    }
  }

  async authorizeRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = authorizeReleaseSchema.parse(req.body);
      const actor = getActor(req);

      const dispatch = await orderService.authorizeRelease(id, actor, input.releaseNotes || undefined);
      res.json({
        success: true,
        message: 'Goods cleared for release to customer.',
        data: dispatch,
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmReleaseHandover(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const actor = getActor(req);

      const result = await orderService.confirmReleaseHandover(id, actor);
      res.json({
        success: true,
        message: 'Release handover completed. Order marked as completed.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
