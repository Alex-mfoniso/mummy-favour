import { apiClient } from './apiClient';
import {
  OrderRecord,
  OrderStatus,
  OrderPaymentStatus,
  OrderProductionStatus,
  PaymentRecord,
  DispatchRecord,
} from '../types/order';

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
  },

  async fetchOrderById(id: string): Promise<OrderRecord> {
    const res = await apiClient.get<OrderRecord>(`/admin/orders/${id}`);
    return res.data;
  },

  async createOrder(data: CreateOrderData): Promise<OrderRecord> {
    const res = await apiClient.post<OrderRecord>('/admin/orders', data);
    return res.data;
  },

  async recordPayment(orderId: string, data: RecordPaymentData): Promise<PaymentRecord> {
    const res = await apiClient.post<PaymentRecord>(`/admin/orders/${orderId}/payments`, data);
    return res.data;
  },

  async verifyPayment(
    orderId: string,
    paymentId: string,
    status: 'VERIFIED' | 'REJECTED',
    internalNotes?: string
  ): Promise<PaymentRecord> {
    const res = await apiClient.patch<PaymentRecord>(
      `/admin/orders/${orderId}/payments/${paymentId}/verify`,
      { status, internalNotes }
    );
    return res.data;
  },

  async updateProductionStatus(
    orderId: string,
    productionStatus: OrderProductionStatus,
    notes?: string
  ): Promise<OrderRecord> {
    const res = await apiClient.patch<OrderRecord>(`/admin/orders/${orderId}/production-status`, {
      productionStatus,
      notes,
    });
    return res.data;
  },

  async dispatchOrder(orderId: string, data: DispatchData): Promise<DispatchRecord> {
    const res = await apiClient.post<DispatchRecord>(`/admin/orders/${orderId}/dispatch`, data);
    return res.data;
  },

  async recordParkArrival(
    orderId: string,
    arrivalConfirmerName: string,
    arrivalNotes?: string
  ): Promise<DispatchRecord> {
    const res = await apiClient.patch<DispatchRecord>(`/admin/orders/${orderId}/park-arrival`, {
      arrivalConfirmerName,
      arrivalNotes,
    });
    return res.data;
  },

  async authorizeRelease(orderId: string, releaseNotes?: string): Promise<DispatchRecord> {
    const res = await apiClient.patch<DispatchRecord>(`/admin/orders/${orderId}/authorize-release`, {
      releaseNotes,
    });
    return res.data;
  },

  async confirmHandover(orderId: string): Promise<{ order: OrderRecord; dispatch: DispatchRecord }> {
    const res = await apiClient.patch<{ order: OrderRecord; dispatch: DispatchRecord }>(
      `/admin/orders/${orderId}/confirm-handover`,
      {}
    );
    return res.data;
  },
};
