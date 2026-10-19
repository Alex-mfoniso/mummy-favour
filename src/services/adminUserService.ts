import { apiClient } from './apiClient';
import { AdminRole, AdminUser } from './authService';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: AdminRole;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actorId?: string | null;
  targetId?: string | null;
  details?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string; role: string } | null;
  target?: { id: string; name: string; email: string; role: string } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const adminUserService = {
  async fetchUsers(params?: ListUsersParams): Promise<{ users: AdminUser[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));

    const queryString = query.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get<AdminUser[]>(url);
    return {
      users: res.data || [],
      pagination: (res as any).pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  async fetchUserById(id: string): Promise<AdminUser> {
    const res = await apiClient.get<AdminUser>(`/admin/users/${id}`);
    return res.data;
  },

  async createUser(data: CreateUserData): Promise<AdminUser> {
    const res = await apiClient.post<AdminUser>('/admin/users', data);
    return res.data;
  },

  async updateUser(id: string, data: UpdateUserData): Promise<AdminUser> {
    const res = await apiClient.patch<AdminUser>(`/admin/users/${id}`, data);
    return res.data;
  },

  async updateStatus(id: string, isActive: boolean): Promise<AdminUser> {
    const res = await apiClient.patch<AdminUser>(`/admin/users/${id}/status`, { isActive });
    return res.data;
  },

  async resetPassword(id: string, password: string): Promise<{ success: boolean }> {
    const res = await apiClient.post<{ success: boolean }>(`/admin/users/${id}/reset-password`, { password });
    return res.data;
  },

  async fetchAuditLogs(params?: { page?: number; limit?: number; action?: string; actorId?: string }): Promise<{
    logs: AuditLogItem[];
    pagination: PaginationMeta;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.action) query.set('action', params.action);
    if (params?.actorId) query.set('actorId', params.actorId);

    const queryString = query.toString();
    const url = `/admin/audit-logs${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get<AuditLogItem[]>(url);
    return {
      logs: res.data || [],
      pagination: (res as any).pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },
};
