import { Router } from 'express';
import { adminUserController } from '../controllers/adminUser.controller.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { listAuditLogsQuerySchema } from '../schemas/adminUser.schema.js';

export const adminAuditLogsRouter = Router();

// Viewing audit logs requires active authentication and SUPER_ADMIN role (the business owner)
adminAuditLogsRouter.use(requireAuth);
adminAuditLogsRouter.use(requireSuperAdmin);

/**
 * GET /api/v1/admin/audit-logs
 * Paginated list of audit events.
 */
adminAuditLogsRouter.get(
  '/',
  validateRequest({ query: listAuditLogsQuerySchema }),
  adminUserController.listAuditLogs
);
