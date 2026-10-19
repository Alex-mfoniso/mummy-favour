import { Router } from 'express';
import { businessSettingsController } from '../controllers/businessSettings.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { UpdateBusinessSettingsSchema } from '../schemas/businessSettings.schema.js';

export const adminBusinessSettingsRouter = Router();

// All administrative business settings routes require authentication
adminBusinessSettingsRouter.use(requireAuth);

/**
 * GET /api/v1/admin/business-settings
 * View full business configuration (accessible by STAFF, ADMIN, and SUPERADMIN).
 */
adminBusinessSettingsRouter.get(
  '/',
  requireRole(['ADMIN', 'SUPERADMIN', 'STAFF']),
  businessSettingsController.getAdminSettings
);

/**
 * PATCH /api/v1/admin/business-settings
 * Update business settings (restricted to ADMIN and SUPERADMIN).
 * Protected by CSRF token and strict schema validation.
 */
adminBusinessSettingsRouter.patch(
  '/',
  requireRole(['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN']),
  verifyCsrf,
  validateRequest({ body: UpdateBusinessSettingsSchema }),
  businessSettingsController.updateAdminSettings
);
