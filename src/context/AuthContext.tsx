import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AdminUser } from '../services/authService';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await authService.getCurrentUser();
      setUser(session ? session.user : null);
    } catch (error) {
      console.warn('[AuthContext] Session verification failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for unauthorized 401 events from apiClient
    const unsubscribe = apiClient.onUnauthorized(() => {
      setUser(null);
    });

    return () => {
      unsubscribe();
    };
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<void> => {
    const session = await authService.login({ email, password });
    setUser(session.user);
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
