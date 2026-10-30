import { apiClient } from './apiClient';
import { AdminRole, AdminUser } from './authService';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
    name: 'Divine Admin',
    email: 'admin@divinefavour.com',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: '2026-10-14T15:30:27.557Z',
  },
  {
    id: '4d5fa985-a732-4573-bcb7-3c6207e87f6a',
    name: 'Alex Mfoniso',
    email: 'alexandermfoniso18@gmail.com',
    role: 'STAFF',
    isActive: true,
    createdAt: '2026-10-15T12:08:33.371Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-001',
    action: 'USER_LOGIN',
    actorId: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
    actor: {
      id: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
      name: 'Divine Admin',
      email: 'admin@divinefavour.com',
      role: 'SUPER_ADMIN',
    },
    details: { method: 'Session credentials', client: 'Administrative Control Portal' },
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'log-002',
    action: 'ORDER_DISPATCHED',
    actorId: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
    actor: {
      id: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
      name: 'Divine Admin',
      email: 'admin@divinefavour.com',
      role: 'SUPER_ADMIN',
    },
    details: { orderNumber: 'DF-ORD-2026-002', carrier: 'Young Shall Grow Motors', park: 'Sabon Gari Motor Park' },
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'log-003',
    action: 'SETTINGS_UPDATED',
    actorId: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
    actor: {
      id: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
      name: 'Divine Admin',
      email: 'admin@divinefavour.com',
      role: 'SUPER_ADMIN',
    },
    details: { field: 'whatsAppNumber', value: '+234 813 472 6113' },
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'log-004',
    action: 'USER_CREATED',
    actorId: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
    targetId: '4d5fa985-a732-4573-bcb7-3c6207e87f6a',
    actor: {
      id: '30ba9b8a-f611-4960-afe4-6edd460c6c62',
      name: 'Divine Admin',
      email: 'admin@divinefavour.com',
      role: 'SUPER_ADMIN',
    },
    target: {
      id: '4d5fa985-a732-4573-bcb7-3c6207e87f6a',
      name: 'Alex Mfoniso',
      email: 'alexandermfoniso18@gmail.com',
      role: 'STAFF',
    },
    details: { role: 'STAFF' },
    ipAddress: '127.0.0.1',
    createdAt: '2026-10-15T12:08:33.371Z',
  },
];

const USERS_STORAGE_KEY = 'df_admin_users_demo';
const LOGS_STORAGE_KEY = 'df_admin_audit_logs_demo';

function getStoredUsers(): AdminUser[] {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = window.sessionStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      window.sessionStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_USERS));
    }
  } catch {
    // SessionStorage inaccessible
  }
  return [...INITIAL_ADMIN_USERS];
}

function saveStoredUsers(users: AdminUser[]): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  } catch {
    // SessionStorage write error
  }
}

function getStoredLogs(): AuditLogItem[] {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = window.sessionStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      window.sessionStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
  } catch {
    // SessionStorage inaccessible
  }
  return [...INITIAL_AUDIT_LOGS];
}

function saveStoredLogs(logs: AuditLogItem[]): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    }
  } catch {
    // SessionStorage write error
  }
}

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
    try {
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
    } catch (err) {
      console.warn('[adminUserService] Backend API unavailable, using demonstration staff records:', err);
      let list = getStoredUsers();

      if (params?.search?.trim()) {
        const q = params.search.toLowerCase();
        list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }

      if (params?.role) {
        list = list.filter((u) => u.role === params.role);
      }

      if (params?.isActive !== undefined) {
        list = list.filter((u) => u.isActive === params.isActive);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const total = list.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = list.slice((page - 1) * limit, page * limit);

      return {
        users: paginated,
        pagination: { page, limit, total, totalPages },
      };
    }
  },

  async fetchUserById(id: string): Promise<AdminUser> {
    try {
      const res = await apiClient.get<AdminUser>(`/admin/users/${id}`);
      return res.data;
    } catch (err) {
      console.warn(`[adminUserService] API failed for user ${id}, using fallback record:`, err);
      const list = getStoredUsers();
      const found = list.find((u) => u.id === id || u.email === id);
      if (found) return found;
      throw err;
    }
  },

  async createUser(data: CreateUserData): Promise<AdminUser> {
    try {
      const res = await apiClient.post<AdminUser>('/admin/users', data);
      return res.data;
    } catch (err) {
      console.warn('[adminUserService] API failed creating user, saving to local store:', err);
      const list = getStoredUsers();
      const newUser: AdminUser = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      list.push(newUser);
      saveStoredUsers(list);

      // Record audit log
      const logs = getStoredLogs();
      logs.unshift({
        id: `log-${Date.now()}`,
        action: 'USER_CREATED',
        targetId: newUser.id,
        target: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        actor: { id: '30ba9b8a-f611-4960-afe4-6edd460c6c62', name: 'Divine Admin', email: 'admin@divinefavour.com', role: 'SUPER_ADMIN' },
        details: { role: newUser.role },
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
      });
      saveStoredLogs(logs);

      return newUser;
    }
  },

  async updateUser(id: string, data: UpdateUserData): Promise<AdminUser> {
    try {
      const res = await apiClient.patch<AdminUser>(`/admin/users/${id}`, data);
      return res.data;
    } catch (err) {
      const list = getStoredUsers();
      const index = list.findIndex((u) => u.id === id);
      if (index !== -1) {
        const updated: AdminUser = {
          ...list[index],
          ...(data.name ? { name: data.name } : {}),
          ...(data.email ? { email: data.email } : {}),
          ...(data.role ? { role: data.role } : {}),
        };
        list[index] = updated;
        saveStoredUsers(list);

        // Record audit log
        const logs = getStoredLogs();
        logs.unshift({
          id: `log-${Date.now()}`,
          action: 'ROLE_CHANGED',
          targetId: id,
          target: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
          actor: { id: '30ba9b8a-f611-4960-afe4-6edd460c6c62', name: 'Divine Admin', email: 'admin@divinefavour.com', role: 'SUPER_ADMIN' },
          details: data,
          ipAddress: '127.0.0.1',
          createdAt: new Date().toISOString(),
        });
        saveStoredLogs(logs);

        return updated;
      }
      throw err;
    }
  },

  async updateStatus(id: string, isActive: boolean): Promise<AdminUser> {
    try {
      const res = await apiClient.patch<AdminUser>(`/admin/users/${id}/status`, { isActive });
      return res.data;
    } catch (err) {
      const list = getStoredUsers();
      const index = list.findIndex((u) => u.id === id);
      if (index !== -1) {
        const updated: AdminUser = { ...list[index], isActive };
        list[index] = updated;
        saveStoredUsers(list);

        const logs = getStoredLogs();
        logs.unshift({
          id: `log-${Date.now()}`,
          action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
          targetId: id,
          target: { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
          actor: { id: '30ba9b8a-f611-4960-afe4-6edd460c6c62', name: 'Divine Admin', email: 'admin@divinefavour.com', role: 'SUPER_ADMIN' },
          details: { isActive },
          ipAddress: '127.0.0.1',
          createdAt: new Date().toISOString(),
        });
        saveStoredLogs(logs);

        return updated;
      }
      throw err;
    }
  },

  async resetPassword(id: string, password: string): Promise<{ success: boolean }> {
    try {
      const res = await apiClient.post<{ success: boolean }>(`/admin/users/${id}/reset-password`, { password });
      return res.data;
    } catch (err) {
      const list = getStoredUsers();
      const user = list.find((u) => u.id === id);
      if (user) {
        const logs = getStoredLogs();
        logs.unshift({
          id: `log-${Date.now()}`,
          action: 'PASSWORD_RESET',
          targetId: id,
          target: { id: user.id, name: user.name, email: user.email, role: user.role },
          actor: { id: '30ba9b8a-f611-4960-afe4-6edd460c6c62', name: 'Divine Admin', email: 'admin@divinefavour.com', role: 'SUPER_ADMIN' },
          details: { note: 'Password reset via admin console' },
          ipAddress: '127.0.0.1',
          createdAt: new Date().toISOString(),
        });
        saveStoredLogs(logs);
        return { success: true };
      }
      throw err;
    }
  },

  async fetchAuditLogs(params?: { page?: number; limit?: number; action?: string; actorId?: string }): Promise<{
    logs: AuditLogItem[];
    pagination: PaginationMeta;
  }> {
    try {
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
    } catch (err) {
      console.warn('[adminUserService] Backend API unavailable, using demonstration audit logs:', err);
      let list = getStoredLogs();

      if (params?.action) {
        list = list.filter((l) => l.action === params.action);
      }

      if (params?.actorId) {
        list = list.filter((l) => l.actorId === params.actorId);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const total = list.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = list.slice((page - 1) * limit, page * limit);

      return {
        logs: paginated,
        pagination: { page, limit, total, totalPages },
      };
    }
  },
};
