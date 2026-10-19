export type OrderStatus =
  | 'AWAITING_DEPOSIT'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'PRODUCTION_COMPLETED'
  | 'READY_FOR_DISPATCH'
  | 'DISPATCHED_TO_PARK'
  | 'AWAITING_BALANCE'
  | 'CLEARED_FOR_RELEASE'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderPaymentStatus =
  | 'PENDING_DEPOSIT'
  | 'DEPOSIT_SUBMITTED'
  | 'DEPOSIT_PAID'
  | 'BALANCE_SUBMITTED'
  | 'PAID_IN_FULL'
  | 'REFUNDED';

export type OrderProductionStatus =
  | 'AWAITING_DEPOSIT'
  | 'IN_PRODUCTION'
  | 'PRODUCTION_COMPLETED'
  | 'READY_FOR_DISPATCH';

export type PaymentType = 'DEPOSIT' | 'BALANCE';
export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
export type DispatchMethod = 'WAYBILL' | 'DIRECT_PICKUP';
export type DispatchStatus =
  | 'NOT_DISPATCHED'
  | 'DISPATCHED'
  | 'ARRIVED_AT_PARK'
  | 'HOLD_CONFIRMED'
  | 'CLEARED_FOR_RELEASE'
  | 'RELEASED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  specifications?: string | null;
  quantity: number;
  unit: string;
  unitPrice: number | string;
  lineTotal: number | string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  paymentType: PaymentType;
  amountExpected: number | string;
  amountReceived?: number | string | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  customerClaimRef?: string | null;
  status: PaymentStatus;
  verifiedById?: string | null;
  verifiedBy?: { id: string; name: string; email: string; role: string } | null;
  verifiedAt?: string | null;
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DispatchRecord {
  id: string;
  orderId: string;
  dispatchMethod: DispatchMethod;
  transportCompany?: string | null;
  parkDestination?: string | null;
  waybillNumber?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  vehiclePlate?: string | null;
  dispatchStatus: DispatchStatus;
  dispatchedAt?: string | null;
  parkArrivalConfirmedAt?: string | null;
  arrivalConfirmerName?: string | null;
  arrivalNotes?: string | null;
  balanceRequestedAt?: string | null;
  releaseAuthorizedById?: string | null;
  releaseAuthorizedBy?: { id: string; name: string; email: string; role: string } | null;
  releaseAuthorizedAt?: string | null;
  releaseNotes?: string | null;
  releasedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  enquiryId?: string | null;
  enquiry?: { id: string; referenceNumber: string; status: string; contactName: string } | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  deliveryAddress?: string | null;
  currency: string;
  subtotal: number | string;
  discount: number | string;
  totalAmount: number | string;
  depositRequired: number | string;
  balanceRequired: number | string;
  depositPaid: number | string;
  balancePaid: number | string;
  paymentStatus: OrderPaymentStatus;
  productionStatus: OrderProductionStatus;
  status: OrderStatus;
  notes?: string | null;
  createdById?: string | null;
  createdBy?: { id: string; name: string; email: string; role: string } | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: PaymentRecord[];
  dispatch?: DispatchRecord | null;
}
