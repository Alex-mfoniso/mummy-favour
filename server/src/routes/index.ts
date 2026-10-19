import { Router } from 'express';
import { healthRouter } from './health.js';
import { categoryRouter } from './categories.js';
import { productRouter } from './products.js';
import { authRouter } from './auth.js';
import { enquiryRouter } from './enquiries.js';
import { adminEnquiryRouter } from './adminEnquiries.js';
import { businessSettingsRouter } from './businessSettings.js';
import { adminBusinessSettingsRouter } from './adminBusinessSettings.js';
import { adminUsersRouter } from './adminUsers.js';
import { adminAuditLogsRouter } from './adminAuditLogs.js';
import adminOrdersRouter from './adminOrders.js';

export const apiRouter = Router();

// Liveness & readiness probes: /api/v1/health and /api/v1/health/ready
apiRouter.use('/health', healthRouter);

// Authentication & Session API: /api/v1/auth
apiRouter.use('/auth', authRouter);

// Categories API: /api/v1/categories
apiRouter.use('/categories', categoryRouter);

// Products API: /api/v1/products
apiRouter.use('/products', productRouter);

// Public Enquiries API: /api/v1/enquiries
apiRouter.use('/enquiries', enquiryRouter);

// Administrative Enquiries API: /api/v1/admin/enquiries
apiRouter.use('/admin/enquiries', adminEnquiryRouter);

// Public Business Settings API: /api/v1/business-settings
apiRouter.use('/business-settings', businessSettingsRouter);

// Administrative Business Settings API: /api/v1/admin/business-settings
apiRouter.use('/admin/business-settings', adminBusinessSettingsRouter);

// Administrative Staff & User Management: /api/v1/admin/users
apiRouter.use('/admin/users', adminUsersRouter);

// Administrative Audit Logs: /api/v1/admin/audit-logs
apiRouter.use('/admin/audit-logs', adminAuditLogsRouter);

// Administrative Orders Management (Phase 14): /api/v1/admin/orders
apiRouter.use('/admin/orders', adminOrdersRouter);

