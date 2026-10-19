import { z } from 'zod';

export const orderItemInputSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  productName: z.string().trim().min(2, 'Product name is required'),
  specifications: z.string().trim().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unit: z.string().trim().default('bundles'),
  unitPrice: z.number().min(0.01, 'Unit price must be greater than 0'),
});

export const createOrderSchema = z.object({
  enquiryId: z.string().uuid().optional().nullable(),
  customerName: z.string().trim().min(2, 'Customer name is required'),
  customerEmail: z.string().trim().email('Invalid email address').optional().nullable(),
  customerPhone: z.string().trim().min(5, 'Valid phone number is required'),
  deliveryAddress: z.string().trim().optional().nullable(),
  currency: z.string().trim().default('NGN'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  dispatchMethod: z.enum(['WAYBILL', 'DIRECT_PICKUP']).default('WAYBILL'),
  notes: z.string().trim().optional().nullable(),
  items: z.array(orderItemInputSchema).min(1, 'At least one order item is required'),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum([
    'DRAFT',
    'AWAITING_DEPOSIT',
    'IN_PRODUCTION',
    'PRODUCTION_COMPLETED',
    'READY_FOR_DISPATCH',
    'DISPATCHED_TO_PARK',
    'ARRIVED_AT_PARK',
    'AWAITING_BALANCE',
    'CLEARED_FOR_RELEASE',
    'RELEASED',
    'COMPLETED',
    'CANCELLED',
  ]).optional(),
  paymentStatus: z.enum([
    'PENDING_DEPOSIT',
    'DEPOSIT_SUBMITTED',
    'DEPOSIT_VERIFIED',
    'AWAITING_BALANCE',
    'BALANCE_SUBMITTED',
    'PAID_IN_FULL',
  ]).optional(),
  productionStatus: z.enum([
    'AWAITING_DEPOSIT',
    'IN_PRODUCTION',
    'PRODUCTION_COMPLETED',
    'READY_FOR_DISPATCH',
  ]).optional(),
});

export const recordPaymentSchema = z.object({
  paymentType: z.enum(['DEPOSIT', 'BALANCE']),
  amountReceived: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.string().trim().min(2, 'Payment method is required (e.g. Bank Transfer)'),
  paymentReference: z.string().trim().optional().nullable(),
  customerClaimRef: z.string().trim().optional().nullable(),
  internalNotes: z.string().trim().optional().nullable(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  internalNotes: z.string().trim().optional().nullable(),
});

export const updateProductionStatusSchema = z.object({
  productionStatus: z.enum([
    'AWAITING_DEPOSIT',
    'IN_PRODUCTION',
    'PRODUCTION_COMPLETED',
    'READY_FOR_DISPATCH',
  ]),
  notes: z.string().trim().optional().nullable(),
});

export const dispatchOrderSchema = z.object({
  dispatchMethod: z.enum(['WAYBILL', 'DIRECT_PICKUP']).default('WAYBILL'),
  transportCompany: z.string().trim().min(2, 'Transport company is required for waybill dispatch').optional().nullable(),
  parkDestination: z.string().trim().min(2, 'Destination park location is required').optional().nullable(),
  waybillNumber: z.string().trim().optional().nullable(),
  driverName: z.string().trim().optional().nullable(),
  driverPhone: z.string().trim().optional().nullable(),
  vehiclePlate: z.string().trim().optional().nullable(),
});

export const recordParkArrivalSchema = z.object({
  arrivalConfirmerName: z.string().trim().min(2, 'Name of driver or park agent confirming arrival is required'),
  arrivalNotes: z.string().trim().optional().nullable(),
});

export const authorizeReleaseSchema = z.object({
  releaseNotes: z.string().trim().optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type UpdateProductionStatusInput = z.infer<typeof updateProductionStatusSchema>;
export type DispatchOrderInput = z.infer<typeof dispatchOrderSchema>;
export type RecordParkArrivalInput = z.infer<typeof recordParkArrivalSchema>;
export type AuthorizeReleaseInput = z.infer<typeof authorizeReleaseSchema>;
