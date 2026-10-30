import { apiClient, ApiClientError } from './apiClient';
import { AdminEnquiry, EnquiryStatus, EnquiryType, AdminEnquiryNote } from '@/types/admin';
import { INITIAL_ADMIN_ENQUIRIES } from '@/data/mock/initialAdminData';

const ENQUIRIES_STORAGE_KEY = 'df_admin_enquiries_demo';

function getStoredEnquiries(): AdminEnquiry[] {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = window.sessionStorage.getItem(ENQUIRIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      window.sessionStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_ENQUIRIES));
    }
  } catch {
    // SessionStorage inaccessible
  }
  return [...INITIAL_ADMIN_ENQUIRIES];
}

function saveStoredEnquiries(enquiries: AdminEnquiry[]): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(enquiries));
    }
  } catch {
    // SessionStorage write error
  }
}

export interface SubmitPublicEnquiryItem {
  productId?: string;
  productSlug?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  size?: string;
  gauge?: string;
  color?: string;
  customPrinting?: string;
  specifications?: any;
}

export interface SubmitPublicEnquiryPayload {
  customerName: string;
  businessName?: string;
  customerPhone: string;
  customerEmail?: string;
  customerType: 'individual' | 'retailer' | 'wholesaler' | 'commercial';
  enquiryType: 'quote_standard' | 'quote_custom' | 'contact_general';
  subject?: string;
  customerMessage?: string;
  source?: string;
  items?: SubmitPublicEnquiryItem[];
}

export interface PublicEnquiryConfirmation {
  reference: string;
  trackingToken: string;
  trackingUrl: string;
  customerName: string;
  enquiryType: string;
  status: string;
  statusTitle?: string;
  statusDescription?: string;
  message: string;
  createdAt: string;
  items?: SubmitPublicEnquiryItem[];
}

export interface PublicEnquiryTracking {
  reference: string;
  createdAt: string;
  updatedAt: string;
  enquiryType: string;
  subject: string | null;
  status: 'received' | 'under_review' | 'follow_up_in_progress' | 'quotation_prepared' | 'closed';
  statusTitle: string;
  statusDescription: string;
  stepNumber: number;
  customerName: string;
  customerMessage: string | null;
  items: Array<{
    productName: string;
    productSlug?: string | null;
    quantity?: number | null;
    unit?: string | null;
    size?: string | null;
    gauge?: string | null;
    color?: string | null;
    customPrinting?: string | null;
  }>;
  order?: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    productionStatus: string;
    totalAmount: number | string;
    depositRequired: number | string;
    balanceRequired: number | string;
    depositPaid: number | string;
    balancePaid: number | string;
    dispatch?: {
      dispatchMethod: string;
      dispatchStatus: string;
      transportCompany?: string | null;
      parkDestination?: string | null;
      waybillNumber?: string | null;
    } | null;
  } | null;
}

export interface AdminEnquiryFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  sort?: 'newest' | 'oldest';
}

export interface PaginatedAdminEnquiriesResponse {
  enquiries: AdminEnquiry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Normalizes backend database representation to frontend AdminEnquiry interface
 */
export function mapBackendEnquiryToFrontend(record: any): AdminEnquiry {
  const statusMap: Record<string, EnquiryStatus> = {
    NEW: 'new',
    IN_REVIEW: 'in_review',
    CONTACTED: 'contacted',
    QUOTED: 'quoted',
    CLOSED: 'closed',
  };

  const typeMap: Record<string, EnquiryType> = {
    QUOTE_STANDARD: 'quote_standard',
    QUOTE_CUSTOM: 'quote_custom',
    CONTACT_GENERAL: 'contact_general',
  };

  const customerTypeMap: Record<string, any> = {
    INDIVIDUAL: 'individual',
    RETAILER: 'retailer',
    WHOLESALER: 'wholesaler',
    COMMERCIAL: 'commercial',
  };

  const primaryItem = (record.items && record.items[0]) || null;

  return {
    id: record.id,
    reference: record.reference,
    customerName: record.customerName,
    businessName: record.businessName || undefined,
    phone: record.customerPhone,
    email: record.customerEmail || undefined,
    customerType: customerTypeMap[record.customerType] || 'not_specified',
    type: typeMap[record.enquiryType] || 'contact_general',
    subject: record.subject || 'Packaging Enquiry',
    productSlug: primaryItem?.productSlug || record.requestedProductName,
    requestedProductName: primaryItem?.productName || record.requestedProductName,
    quantity: primaryItem?.quantity ? String(primaryItem.quantity) : record.requestedQuantity,
    unit: primaryItem?.unit || record.requestedUnit || 'pieces',
    specifications: primaryItem?.specifications || record.specifications || undefined,
    customerNotes: record.customerMessage || '',
    source: record.source || 'Website Form',
    status: statusMap[record.status] || 'new',
    internalNotes: record.internalNotes || '',
    items: record.items || [],
    notes: record.notes || [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export const enquiryService = {
  /**
   * Submit a public quotation request or general enquiry to the backend.
   */
  async submitPublicEnquiry(payload: SubmitPublicEnquiryPayload): Promise<PublicEnquiryConfirmation> {
    try {
      // Map frontend payload fields to backend schema expectations
      const backendPayload = {
        customerName: payload.customerName,
        businessName: payload.businessName || undefined,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail || undefined,
        customerType: payload.customerType.toUpperCase(),
        enquiryType: payload.enquiryType.toUpperCase(),
        subject: payload.subject,
        customerMessage: payload.customerMessage,
        source: payload.source || 'WEBSITE',
        items: payload.items || [],
      };

      const res = await apiClient.post<PublicEnquiryConfirmation>('/enquiries', backendPayload);
      return res.data;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw new Error(err.message);
      }
      throw err;
    }
  },

  /**
   * Track customer enquiry status using cryptographically secure tracking token.
   * Scoped strictly to the token without exposing sensitive customer data or internal notes.
   */
  async trackPublicEnquiry(token: string): Promise<PublicEnquiryTracking> {
    try {
      const trimmedToken = token.trim();
      const res = await apiClient.get<PublicEnquiryTracking>(
        `/enquiries/track?token=${encodeURIComponent(trimmedToken)}`
      );
      return res.data;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw new Error(err.message);
      }
      throw err;
    }
  },

  /**
   * Load paginated administrative enquiry list with filters.
   */
  async listAdminEnquiries(filters: AdminEnquiryFilters = {}): Promise<PaginatedAdminEnquiriesResponse> {
    try {
      const params: Record<string, any> = {
        page: filters.page || 1,
        limit: filters.limit || 20,
      };

      if (filters.search?.trim()) {
        params.search = filters.search.trim();
      }

      if (filters.status && filters.status !== 'all') {
        params.status = filters.status.toUpperCase();
      }

      if (filters.type && filters.type !== 'all') {
        params.type = filters.type.toUpperCase();
      }

      if (filters.sort) {
        params.sort = filters.sort;
      }

      const queryParts: string[] = [];
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
        }
      });
      const endpoint = queryParts.length > 0 ? `/admin/enquiries?${queryParts.join('&')}` : '/admin/enquiries';

      const res = await apiClient.get<any[]>(endpoint);
      const rawList = res.data || [];
      const enquiries = rawList.map(mapBackendEnquiryToFrontend);

      return {
        enquiries,
        meta: {
          page: res.meta?.page || 1,
          limit: res.meta?.limit || 20,
          total: res.meta?.total || enquiries.length,
          totalPages: res.meta?.totalPages || 1,
        },
      };
    } catch (err) {
      console.warn('[enquiryService] Backend API unavailable, using demonstration enquiry records:', err);
      let list = getStoredEnquiries();

      if (filters.status && filters.status !== 'all') {
        const normStatus = filters.status.toLowerCase();
        list = list.filter((e) => e.status.toLowerCase() === normStatus);
      }

      if (filters.type && filters.type !== 'all') {
        const normType = filters.type.toLowerCase();
        list = list.filter((e) => e.type.toLowerCase() === normType);
      }

      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (e) =>
            e.customerName.toLowerCase().includes(q) ||
            (e.businessName && e.businessName.toLowerCase().includes(q)) ||
            e.phone.toLowerCase().includes(q) ||
            (e.email && e.email.toLowerCase().includes(q)) ||
            (e.reference && e.reference.toLowerCase().includes(q)) ||
            e.subject.toLowerCase().includes(q)
        );
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const total = list.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = list.slice((page - 1) * limit, page * limit);

      return {
        enquiries: paginated,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }
  },

  /**
   * Get an enquiry by ID with items and notes.
   */
  async getAdminEnquiry(id: string): Promise<AdminEnquiry> {
    try {
      const res = await apiClient.get<any>(`/admin/enquiries/${id}`);
      return mapBackendEnquiryToFrontend(res.data);
    } catch (err) {
      console.warn(`[enquiryService] API failed for enquiry ${id}, using fallback record:`, err);
      const list = getStoredEnquiries();
      const found = list.find((e) => e.id === id || e.reference === id);
      if (found) return found;
      throw err;
    }
  },

  /**
   * Update enquiry lifecycle status.
   */
  async updateAdminEnquiryStatus(id: string, status: EnquiryStatus): Promise<AdminEnquiry> {
    try {
      const res = await apiClient.patch<any>(`/admin/enquiries/${id}/status`, {
        status: status.toUpperCase(),
      });
      return mapBackendEnquiryToFrontend(res.data);
    } catch (err) {
      console.warn(`[enquiryService] API failed updating status for enquiry ${id}, updating local record:`, err);
      const list = getStoredEnquiries();
      const index = list.findIndex((e) => e.id === id || e.reference === id);
      if (index !== -1) {
        const updated: AdminEnquiry = {
          ...list[index],
          status,
          updatedAt: new Date().toISOString(),
        };
        list[index] = updated;
        saveStoredEnquiries(list);
        return updated;
      }
      throw err;
    }
  },

  /**
   * List internal staff notes for an enquiry.
   */
  async listAdminEnquiryNotes(enquiryId: string): Promise<AdminEnquiryNote[]> {
    try {
      const res = await apiClient.get<AdminEnquiryNote[]>(`/admin/enquiries/${enquiryId}/notes`);
      return res.data || [];
    } catch (err) {
      const list = getStoredEnquiries();
      const enq = list.find((e) => e.id === enquiryId || e.reference === enquiryId);
      return (enq?.notes as AdminEnquiryNote[]) || [];
    }
  },

  /**
   * Add an internal staff note to an enquiry.
   */
  async createAdminEnquiryNote(enquiryId: string, content: string): Promise<AdminEnquiryNote> {
    try {
      const res = await apiClient.post<AdminEnquiryNote>(`/admin/enquiries/${enquiryId}/notes`, {
        content,
      });
      return res.data;
    } catch (err) {
      const newNote: AdminEnquiryNote = {
        id: `note-${Date.now()}`,
        enquiryId,
        content,
        authorName: 'Divine Admin',
        createdAt: new Date().toISOString(),
      };
      const list = getStoredEnquiries();
      const index = list.findIndex((e) => e.id === enquiryId || e.reference === enquiryId);
      if (index !== -1) {
        const enq = list[index];
        const notes = Array.isArray(enq.notes) ? [...enq.notes, newNote] : [newNote];
        list[index] = { ...enq, notes };
        saveStoredEnquiries(list);
      }
      return newNote;
    }
  },

  /**
   * Update an existing internal note.
   */
  async updateAdminEnquiryNote(enquiryId: string, noteId: string, content: string): Promise<AdminEnquiryNote> {
    try {
      const res = await apiClient.patch<AdminEnquiryNote>(
        `/admin/enquiries/${enquiryId}/notes/${noteId}`,
        { content }
      );
      return res.data;
    } catch (err) {
      const list = getStoredEnquiries();
      const index = list.findIndex((e) => e.id === enquiryId || e.reference === enquiryId);
      if (index !== -1) {
        const enq = list[index];
        const notes = Array.isArray(enq.notes)
          ? enq.notes.map((n: AdminEnquiryNote) => (n.id === noteId ? { ...n, content } : n))
          : [];
        list[index] = { ...enq, notes };
        saveStoredEnquiries(list);
        const updated = notes.find((n: AdminEnquiryNote) => n.id === noteId);
        if (updated) return updated;
      }
      return {
        id: noteId,
        enquiryId,
        content,
        authorName: 'Divine Admin',
        createdAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Delete an internal staff note.
   */
  async deleteAdminEnquiryNote(enquiryId: string, noteId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/enquiries/${enquiryId}/notes/${noteId}`);
    } catch (err) {
      const list = getStoredEnquiries();
      const index = list.findIndex((e) => e.id === enquiryId || e.reference === enquiryId);
      if (index !== -1) {
        const enq = list[index];
        const notes = Array.isArray(enq.notes)
          ? enq.notes.filter((n: AdminEnquiryNote) => n.id !== noteId)
          : [];
        list[index] = { ...enq, notes };
        saveStoredEnquiries(list);
      }
    }
  },
};
