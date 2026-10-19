import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { RequestQuotePage } from '@/pages/RequestQuotePage';
import { EnquiryConfirmationPage } from '@/pages/EnquiryConfirmationPage';
import { EnquiryTrackingPage } from '@/pages/EnquiryTrackingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Admin Authentication & Guard (Phase 9)
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

// Admin Dashboard Pages (Phase 6)
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminEnquiriesPage } from '@/pages/admin/AdminEnquiriesPage';
import { AdminBusinessSettingsPage } from '@/pages/admin/AdminBusinessSettingsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:slug',
        element: <ProductDetailPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'request-quote',
        element: <RequestQuotePage />,
      },
      {
        path: 'enquiry-confirmation',
        element: <EnquiryConfirmationPage />,
      },
      {
        path: 'track-enquiry',
        element: <EnquiryTrackingPage />,
      },
      {
        path: 'track-order',
        element: <EnquiryTrackingPage />,
      },
      {
        path: 'track',
        element: <EnquiryTrackingPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'categories',
        element: <AdminCategoriesPage />,
      },
      {
        path: 'enquiries',
        element: <AdminEnquiriesPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'orders/:id',
        element: <AdminOrderDetailPage />,
      },
      {
        path: 'business-settings',
        element: <AdminBusinessSettingsPage />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AdminAuditLogsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/admin" replace />,
      },
    ],
  },
]);
