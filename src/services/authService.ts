import { apiClient } from './apiClient';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'SUPERADMIN';

export const isSuperAdmin = (role?: AdminRole | string): boolean => {
  return role === 'SUPER_ADMIN' || role === 'SUPERADMIN';
};

export const isAdminOrSuperAdmin = (role?: AdminRole | string): boolean => {
  return isSuperAdmin(role) || role === 'ADMIN';
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthSessionData {
  user: AdminUser;
  csrfToken: string;
}

export const authService = {
  /**
   * Log into the administrative dashboard.
   * On success, sets backend session cookie and receives initial CSRF token.
   */
  async login(credentials: { email: string; password: string }): Promise<AuthSessionData> {
    const res = await apiClient.post<AuthSessionData>('/auth/login', credentials);
    if (res.data?.csrfToken) {
      apiClient.setCsrfToken(res.data.csrfToken);
    }
    return res.data;
  },

  /**
   * Terminate current administrator session and clear local tokens.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<{ message: string }>('/auth/logout');
    } finally {
      apiClient.setCsrfToken(null);
    }
  },

  /**
   * Check if active session cookie is valid and fetch current user profile.
   */
  async getCurrentUser(): Promise<AuthSessionData | null> {
    try {
      const res = await apiClient.get<AuthSessionData>('/auth/me');
      if (res.data?.csrfToken) {
        apiClient.setCsrfToken(res.data.csrfToken);
      }
      return res.data;
    } catch (err: any) {
      if (err.status === 401) {
        apiClient.setCsrfToken(null);
        return null;
      }
      throw err;
    }
  },

  /**
   * Fetch a fresh CSRF token if needed.
   */
  async fetchCsrfToken(): Promise<string | null> {
    try {
      const res = await apiClient.get<{ csrfToken: string }>('/auth/csrf');
      const token = res.data?.csrfToken || null;
      if (token) {
        apiClient.setCsrfToken(token);
      }
      return token;
    } catch {
      return null;
    }
  },
};
