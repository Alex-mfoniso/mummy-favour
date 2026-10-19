import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';

const router = Router();

// Protect all admin order endpoints
router.use(requireAuth);

/**
 * List orders with search, filters, pagination
 */
router.get('/', orderController.listOrders);

/**
 * Get single order details with items, payments, dispatch
 */
router.get('/:id', orderController.getOrderById);

/**
 * Create confirmed order (from accepted enquiry or custom request)
 */
router.post('/', verifyCsrf, orderController.createOrder);

/**
 * Record payment (Deposit or Balance reported)
 */
router.post('/:id/payments', verifyCsrf, orderController.recordPayment);

/**
 * Verify or reject recorded payment
 */
router.patch('/:id/payments/:paymentId/verify', verifyCsrf, orderController.verifyPayment);

/**
 * Update production status (strict deposit check enforced in service)
 */
router.patch('/:id/production-status', verifyCsrf, orderController.updateProductionStatus);

/**
 * Dispatch order to transport park / waybill
 */
router.post('/:id/dispatch', verifyCsrf, orderController.dispatchOrder);

/**
 * Record transport / driver arrival confirmation at destination park
 */
router.patch('/:id/park-arrival', verifyCsrf, orderController.recordParkArrival);

/**
 * Authorize release of goods (strict 100% balance check enforced in service)
 */
router.patch('/:id/authorize-release', verifyCsrf, orderController.authorizeRelease);

/**
 * Confirm release handover to customer, completing order
 */
router.patch('/:id/confirm-handover', verifyCsrf, orderController.confirmReleaseHandover);

export default router;
