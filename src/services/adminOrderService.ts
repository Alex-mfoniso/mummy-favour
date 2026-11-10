import { apiClient } from './apiClient';
import {
  OrderRecord,
  OrderStatus,
  OrderPaymentStatus,
  OrderProductionStatus,
  PaymentRecord,
  DispatchRecord,
} from '../types/order';

export const INITIAL_ADMIN_ORDERS: OrderRecord[] = [
  {
    id: 'ord-001',
    orderNumber: 'DF-ORD-2026-001',
    enquiryId: 'enq-001',
    enquiry: {
      id: 'enq-001',
      referenceNumber: 'DF-ENQ-849201',
      status: 'QUOTED',
      contactName: 'Emmanuel Okafor',
    },
    customerName: 'Emmanuel Okafor',
    customerPhone: '+234 802 111 2233',
    customerEmail: 'e.okafor@apexmarkets.ng',
    deliveryAddress: '14 Broad Street, Marina, Lagos Island, Lagos',
    status: 'IN_PRODUCTION',
    paymentStatus: 'DEPOSIT_PAID',
    productionStatus: 'IN_PRODUCTION',
    subtotal: 250000,
    totalAmount: 250000,
    depositRequired: 125000,
    balanceRequired: 125000,
    depositPaid: 125000,
    balancePaid: 0,
    currency: 'NGN',
    discount: 0,
    notes: 'Recurring order for 3 supermarket branches. 2-colour flexo logo branding.',
    items: [
      {
        id: 'item-001',
        orderId: 'ord-001',
        productName: 'Retail Shopping Carrier Bags (Punch-Hole)',
        specifications: '40cm x 50cm, 45 microns, Milky White, 2-colour print',
        quantity: 10000,
        unit: 'pieces',
        unitPrice: 25,
        lineTotal: 250000,
        createdAt: '2026-10-14T10:00:00Z',
      },
    ],
    payments: [
      {
        id: 'pay-001',
        orderId: 'ord-001',
        paymentType: 'DEPOSIT',
        amountExpected: 125000,
        amountReceived: 125000,
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: 'TRF-GTB-948201',
        status: 'VERIFIED',
        verifiedAt: '2026-10-14T11:00:00Z',
        createdAt: '2026-10-14T10:30:00Z',
        updatedAt: '2026-10-14T11:00:00Z',
      },
    ],
    dispatch: {
      id: 'disp-001',
      orderId: 'ord-001',
      dispatchMethod: 'WAYBILL',
      transportCompany: 'Ekenedilichukwu Motors',
      parkDestination: 'Jibowu Central Bus Terminal, Lagos',
      waybillNumber: 'EKD-2026-7849',
      dispatchStatus: 'NOT_DISPATCHED',
      createdAt: '2026-10-14T10:00:00Z',
      updatedAt: '2026-10-14T10:00:00Z',
    },
    createdAt: '2026-10-14T10:00:00Z',
    updatedAt: '2026-10-14T11:30:00Z',
  },
  {
    id: 'ord-002',
    orderNumber: 'DF-ORD-2026-002',
    enquiryId: 'enq-002',
    enquiry: {
      id: 'enq-002',
      referenceNumber: 'DF-ENQ-739102',
      status: 'QUOTED',
      contactName: 'Folake Adeleke',
    },
    customerName: 'Folake Adeleke',
    customerPhone: '+234 803 444 5566',
    customerEmail: 'procurement@adelekegrains.com',
    deliveryAddress: 'Industrial Layout, Kano State',
    status: 'READY_FOR_DISPATCH',
    paymentStatus: 'DEPOSIT_PAID',
    productionStatus: 'PRODUCTION_COMPLETED',
    subtotal: 450000,
    totalAmount: 450000,
    depositRequired: 225000,
    balanceRequired: 225000,
    depositPaid: 225000,
    balancePaid: 0,
    currency: 'NGN',
    discount: 0,
    notes: 'Heavy-Duty 80-micron virgin LDPE sacks with reinforced heat seal.',
    items: [
      {
        id: 'item-002',
        orderId: 'ord-002',
        productName: 'Heavy-Duty Industrial Sacks',
        specifications: '60cm x 100cm, 80 microns, Natural Translucent',
        quantity: 2500,
        unit: 'pieces',
        unitPrice: 180,
        lineTotal: 450000,
        createdAt: '2026-10-13T15:30:00Z',
      },
    ],
    payments: [
      {
        id: 'pay-002',
        orderId: 'ord-002',
        paymentType: 'DEPOSIT',
        amountExpected: 225000,
        amountReceived: 225000,
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: 'ZEN-839210-FLK',
        status: 'VERIFIED',
        verifiedAt: '2026-10-13T16:00:00Z',
        createdAt: '2026-10-13T15:45:00Z',
        updatedAt: '2026-10-13T16:00:00Z',
      },
    ],
    dispatch: {
      id: 'disp-002',
      orderId: 'ord-002',
      dispatchMethod: 'WAYBILL',
      transportCompany: 'Young Shall Grow Motors',
      parkDestination: 'Sabon Gari Motor Park, Kano',
      waybillNumber: 'YSG-KAN-4820',
      dispatchStatus: 'ARRIVED_AT_PARK',
      driverName: 'Mallam Ibrahim',
      driverPhone: '+234 803 222 1199',
      vehiclePlate: 'KAN-482-XA',
      dispatchedAt: '2026-10-14T08:00:00Z',
      parkArrivalConfirmedAt: '2026-10-15T12:00:00Z',
      arrivalConfirmerName: 'Park Union Secretary',
      createdAt: '2026-10-13T15:30:00Z',
      updatedAt: '2026-10-15T12:00:00Z',
    },
    createdAt: '2026-10-13T15:30:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'ord-003',
    orderNumber: 'DF-ORD-2026-003',
    customerName: 'Babatunde Alabi',
    customerPhone: '+234 806 888 9900',
    customerEmail: 'ops@expresslogistics.ng',
    deliveryAddress: 'Express Logistics Hub, Ikeja, Lagos',
    status: 'COMPLETED',
    paymentStatus: 'PAID_IN_FULL',
    productionStatus: 'PRODUCTION_COMPLETED',
    subtotal: 320000,
    totalAmount: 320000,
    depositRequired: 160000,
    balanceRequired: 160000,
    depositPaid: 160000,
    balancePaid: 160000,
    currency: 'NGN',
    discount: 0,
    notes: 'Pallet stretch film rolls. Picked up from Onitsha factory gate.',
    items: [
      {
        id: 'item-003',
        orderId: 'ord-003',
        productName: 'Industrial Pallet Stretch Film Rolls',
        specifications: '500mm x 300m, 23 microns, High Clarity',
        quantity: 80,
        unit: 'rolls',
        unitPrice: 4000,
        lineTotal: 320000,
        createdAt: '2026-10-08T10:00:00Z',
      },
    ],
    payments: [
      {
        id: 'pay-003a',
        orderId: 'ord-003',
        paymentType: 'DEPOSIT',
        amountExpected: 160000,
        amountReceived: 160000,
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: 'UBA-938102-DEP',
        status: 'VERIFIED',
        verifiedAt: '2026-10-08T11:00:00Z',
        createdAt: '2026-10-08T10:30:00Z',
        updatedAt: '2026-10-08T11:00:00Z',
      },
      {
        id: 'pay-003b',
        orderId: 'ord-003',
        paymentType: 'BALANCE',
        amountExpected: 160000,
        amountReceived: 160000,
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: 'UBA-941829-BAL',
        status: 'VERIFIED',
        verifiedAt: '2026-10-10T16:00:00Z',
        createdAt: '2026-10-10T15:30:00Z',
        updatedAt: '2026-10-10T16:00:00Z',
      },
    ],
    dispatch: {
      id: 'disp-003',
      orderId: 'ord-003',
      dispatchMethod: 'DIRECT_PICKUP',
      dispatchStatus: 'RELEASED',
      releasedAt: '2026-10-10T17:00:00Z',
      createdAt: '2026-10-08T10:00:00Z',
      updatedAt: '2026-10-10T17:00:00Z',
    },
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-10T17:00:00Z',
  },
];

const ORDERS_STORAGE_KEY = 'df_admin_orders_demo';

function getStoredOrders(): OrderRecord[] {
  try {
    if (typeof window !== 'undefined') {
      const savedLocal = window.localStorage?.getItem(ORDERS_STORAGE_KEY);
      if (savedLocal) return JSON.parse(savedLocal);
      const savedSession = window.sessionStorage?.getItem(ORDERS_STORAGE_KEY);
      if (savedSession) {
        window.localStorage?.setItem(ORDERS_STORAGE_KEY, savedSession);
        return JSON.parse(savedSession);
      }
      window.localStorage?.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_ORDERS));
      window.sessionStorage?.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_ORDERS));
    }
  } catch {
    // Storage inaccessible
  }
  return [...INITIAL_ADMIN_ORDERS];
}

function saveStoredOrders(orders: OrderRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      const serialized = JSON.stringify(orders);
      window.localStorage?.setItem(ORDERS_STORAGE_KEY, serialized);
      window.sessionStorage?.setItem(ORDERS_STORAGE_KEY, serialized);
    }
  } catch {
    // Storage write error
  }
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  productionStatus?: OrderProductionStatus;
}

export interface CreateOrderItemInput {
  productId?: string;
  productName: string;
  specifications?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface CreateOrderData {
  enquiryId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress?: string;
  currency?: string;
  discount?: number;
  dispatchMethod?: 'WAYBILL' | 'DIRECT_PICKUP';
  notes?: string;
  items: CreateOrderItemInput[];
}

export interface RecordPaymentData {
  paymentType: 'DEPOSIT' | 'BALANCE';
  amountReceived: number;
  paymentMethod: string;
  paymentReference?: string;
  customerClaimRef?: string;
  internalNotes?: string;
}

export interface DispatchData {
  dispatchMethod: 'WAYBILL' | 'DIRECT_PICKUP';
  transportCompany?: string;
  parkDestination?: string;
  waybillNumber?: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
}

export interface OrdersListResponse {
  orders: OrderRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminOrderService = {
  async fetchOrders(params?: ListOrdersParams): Promise<OrdersListResponse> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.search) query.set('search', params.search);
      if (params?.status) query.set('status', params.status);
      if (params?.paymentStatus) query.set('paymentStatus', params.paymentStatus);
      if (params?.productionStatus) query.set('productionStatus', params.productionStatus);

      const queryString = query.toString();
      const url = `/admin/orders${queryString ? `?${queryString}` : ''}`;
      const res = await apiClient.get<OrderRecord[]>(url);
      return {
        orders: res.data || [],
        pagination: (res as any).pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    } catch (err) {
      console.warn('[adminOrderService] Backend API unavailable, using demonstration order records:', err);
      let list = getStoredOrders();

      if (params?.search?.trim()) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.customerPhone.toLowerCase().includes(q) ||
            (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
        );
      }

      if (params?.status) {
        list = list.filter((o) => o.status === params.status);
      }

      if (params?.paymentStatus) {
        list = list.filter((o) => o.paymentStatus === params.paymentStatus);
      }

      if (params?.productionStatus) {
        list = list.filter((o) => o.productionStatus === params.productionStatus);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const total = list.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = list.slice((page - 1) * limit, page * limit);

      return {
        orders: paginated,
        pagination: { page, limit, total, totalPages },
      };
    }
  },

  async fetchOrderById(id: string): Promise<OrderRecord> {
    try {
      const res = await apiClient.get<OrderRecord>(`/admin/orders/${id}`);
      return res.data;
    } catch (err) {
      console.warn(`[adminOrderService] API failed for order ${id}, using fallback record:`, err);
      const list = getStoredOrders();
      const found = list.find((o) => o.id === id || o.orderNumber === id);
      if (found) return found;
      throw err;
    }
  },

  async createOrder(data: CreateOrderData): Promise<OrderRecord> {
    try {
      const res = await apiClient.post<OrderRecord>('/admin/orders', data);
      return res.data;
    } catch (err) {
      console.warn('[adminOrderService] API failed creating order, saving to local store:', err);
      const list = getStoredOrders();
      const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const depositRequired = Math.round(totalAmount / 2);
      const balanceRequired = totalAmount - depositRequired;

      const newOrder: OrderRecord = {
        id: `ord-${Date.now()}`,
        orderNumber: `DF-ORD-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`,
        enquiryId: data.enquiryId || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        deliveryAddress: data.deliveryAddress || null,
        currency: data.currency || 'NGN',
        discount: data.discount || 0,
        status: 'AWAITING_DEPOSIT',
        paymentStatus: 'PENDING_DEPOSIT',
        productionStatus: 'AWAITING_DEPOSIT',
        subtotal: totalAmount,
        totalAmount,
        depositRequired,
        balanceRequired,
        depositPaid: 0,
        balancePaid: 0,
        notes: data.notes || '',
        items: data.items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          orderId: `ord-${Date.now()}`,
          productName: it.productName,
          specifications: it.specifications || null,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          lineTotal: it.quantity * it.unitPrice,
          createdAt: new Date().toISOString(),
        })),
        payments: [],
        dispatch: {
          id: `disp-${Date.now()}`,
          orderId: `ord-${Date.now()}`,
          dispatchMethod: data.dispatchMethod || 'WAYBILL',
          dispatchStatus: 'NOT_DISPATCHED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      list.unshift(newOrder);
      saveStoredOrders(list);
      return newOrder;
    }
  },

  async recordPayment(orderId: string, data: RecordPaymentData): Promise<PaymentRecord> {
    try {
      const res = await apiClient.post<PaymentRecord>(`/admin/orders/${orderId}/payments`, data);
      return res.data;
    } catch (err) {
      console.warn(`[adminOrderService] API failed recording payment for order ${orderId}, updating local record:`, err);
      const list = getStoredOrders();
      const order = list.find((o) => o.id === orderId);
      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        orderId,
        paymentType: data.paymentType,
        amountExpected: data.amountReceived,
        amountReceived: data.amountReceived,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference || null,
        customerClaimRef: data.customerClaimRef || null,
        internalNotes: data.internalNotes || null,
        status: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (order) {
        order.payments = Array.isArray(order.payments) ? [...order.payments, newPayment] : [newPayment];
        if (data.paymentType === 'DEPOSIT') {
          order.depositPaid = Number(order.depositPaid || 0) + data.amountReceived;
          order.paymentStatus = 'DEPOSIT_PAID';
          order.status = 'IN_PRODUCTION';
          order.productionStatus = 'IN_PRODUCTION';
        } else {
          order.balancePaid = Number(order.balancePaid || 0) + data.amountReceived;
          order.paymentStatus = 'PAID_IN_FULL';
          if (order.status === 'AWAITING_BALANCE') {
            order.status = 'CLEARED_FOR_RELEASE';
          }
        }
        order.updatedAt = new Date().toISOString();
        saveStoredOrders(list);
      }
      return newPayment;
    }
  },

  async verifyPayment(
    orderId: string,
    paymentId: string,
    status: 'VERIFIED' | 'REJECTED',
    internalNotes?: string
  ): Promise<PaymentRecord> {
    try {
      const res = await apiClient.patch<PaymentRecord>(
        `/admin/orders/${orderId}/payments/${paymentId}/verify`,
        { status, internalNotes }
      );
      return res.data;
    } catch (err) {
      const list = getStoredOrders();
      const order = list.find((o) => o.id === orderId);
      let foundPayment: PaymentRecord | undefined;
      if (order && Array.isArray(order.payments)) {
        order.payments = order.payments.map((p) => {
          if (p.id === paymentId) {
            foundPayment = {
              ...p,
              status,
              internalNotes: internalNotes || p.internalNotes,
              verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            };
            return foundPayment;
          }
          return p;
        });
        saveStoredOrders(list);
      }
      if (foundPayment) return foundPayment;
      throw err;
    }
  },

  async updateProductionStatus(
    orderId: string,
    productionStatus: OrderProductionStatus,
    notes?: string
  ): Promise<OrderRecord> {
    try {
      const res = await apiClient.patch<OrderRecord>(`/admin/orders/${orderId}/production-status`, {
        productionStatus,
        notes,
      });
      return res.data;
    } catch (err) {
      const list = getStoredOrders();
      const order = list.find((o) => o.id === orderId);
      if (order) {
        order.productionStatus = productionStatus;
        if (productionStatus === 'PRODUCTION_COMPLETED') {
          order.status = 'READY_FOR_DISPATCH';
        } else if (productionStatus === 'IN_PRODUCTION') {
          order.status = 'IN_PRODUCTION';
        }
        if (notes) order.notes = (order.notes ? order.notes + '\n' : '') + notes;
        order.updatedAt = new Date().toISOString();
        saveStoredOrders(list);
        return order;
      }
      throw err;
    }
  },

  async dispatchOrder(orderId: string, data: DispatchData): Promise<DispatchRecord> {
    try {
      const res = await apiClient.post<DispatchRecord>(`/admin/orders/${orderId}/dispatch`, data);
      return res.data;
    } catch (err) {
      const list = getStoredOrders();
      const order = list.find((o) => o.id === orderId);
      const newDispatch: DispatchRecord = {
        id: `disp-${Date.now()}`,
        orderId,
        dispatchMethod: data.dispatchMethod,
        transportCompany: data.transportCompany || null,
        parkDestination: data.parkDestination || null,
        waybillNumber: data.waybillNumber || null,
        driverName: data.driverName || null,
        driverPhone: data.driverPhone || null,
        vehiclePlate: data.vehiclePlate || null,
        dispatchStatus: 'DISPATCHED',
        dispatchedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (order) {
        order.dispatch = newDispatch;
        order.status = 'DISPATCHED_TO_PARK';
        order.updatedAt = new Date().toISOString();
        saveStoredOrders(list);
      }
      return newDispatch;
    }
  },

  async recordParkArrival(
    orderId: string,
    arrivalConfirmerName: string,
    arrivalNotes?: string
  ): Promise<DispatchRecord> {
    try {
      const res = await apiClient.patch<DispatchRecord>(`/admin/orders/${orderId}/park-arrival`, {
        arrivalConfirmerName,
        arrivalNotes,
      });
      return res.data;
    } catch (err) {
      const list = getStoredOrders();
      const order = list.find((o) => o.id === orderId);
      if (order && order.dispatch) {
        order.dispatch.dispatchStatus = 'ARRIVED_AT_PARK';
        order.dispatch.arrivalConfirmerName = arrivalConfirmerName;
        order.dispatch.arrivalNotes = arrivalNotes || null;
        order.dispatch.parkArrivalConfirmedAt = new Date().toISOString();
        order.status = 'AWAITING_BALANCE';
        order.updatedAt = new Date().toISOString();
        saveStoredOrders(list);
        return order.dispatch;
      }
      throw err;
    }
  },

  async authorizeRelease(orderId: string, releaseNotes?: string): Promise<DispatchRecord> {
    try {
      const res = await apiClient.patch<DispatchRecord>(`/admin/orders/${orderId}/authorize-release`, {
        releaseNotes,
      });
      return res.data;
    } catch (err) {
      const list = getStoredOrders();
      const order = list.find((o) => o.id === orderId);
      if (order && order.dispatch) {
        order.dispatch.dispatchStatus = 'CLEARED_FOR_RELEASE';
        order.dispatch.releaseNotes = releaseNotes || null;
        order.dispatch.releaseAuthorizedAt = new Date().toISOString();
        order.status = 'CLEARED_FOR_RELEASE';
        order.updatedAt = new Date().toISOString();
        saveStoredOrders(list);
        return order.dispatch;
      }
      throw err;
    }
  },

  async confirmHandover(orderId: string): Promise<{ order: OrderRecord; dispatch: DispatchRecord }> {
    try {
      const res = await apiClient.patch<{ order: OrderRecord; dispatch: DispatchRecord }>(
        `/admin/orders/${orderId}/confirm-handover`,
        {}
      );
      return res.data;
    } catch (err) {
      const list = getStoredOrders();
      const order = list.find((o) => o.id === orderId);
      if (order && order.dispatch) {
        order.dispatch.dispatchStatus = 'RELEASED';
        order.dispatch.releasedAt = new Date().toISOString();
        order.status = 'COMPLETED';
        order.updatedAt = new Date().toISOString();
        saveStoredOrders(list);
        return { order, dispatch: order.dispatch };
      }
      throw err;
    }
  },
};
