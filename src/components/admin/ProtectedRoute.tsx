import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminRole, isSuperAdmin } from '../../services/authService';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: (AdminRole | string)[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F4EF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#246B45]/20 border-t-[#246B45] animate-spin mb-4" />
        <p className="text-[#252A27] font-medium text-sm tracking-wide">
          Verifying administrative credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    const isAuthorized = allowedRoles.some((role) => {
      if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') {
        return isSuperAdmin(userRole);
      }
      return role === userRole;
    });

    if (!isAuthorized) {
      // User is authenticated but lacks required role for this page
      return <Navigate to="/admin" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
