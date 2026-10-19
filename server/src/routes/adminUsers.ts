import { Router } from 'express';
import { adminUserController } from '../controllers/adminUser.controller.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  updateAdminUserStatusSchema,
  resetAdminUserPasswordSchema,
  listAdminUsersQuerySchema,
} from '../schemas/adminUser.schema.js';

export const adminUsersRouter = Router();

// All user management routes require active authentication and SUPER_ADMIN role (the business owner)
adminUsersRouter.use(requireAuth);
adminUsersRouter.use(requireSuperAdmin);

/**
 * GET /api/v1/admin/users
 * Paginated list of staff and managers with search and filters.
 */
adminUsersRouter.get(
  '/',
  validateRequest({ query: listAdminUsersQuerySchema }),
  adminUserController.listUsers
);

/**
 * POST /api/v1/admin/users
 * Create a new manager or staff member.
 */
adminUsersRouter.post(
  '/',
  verifyCsrf,
  validateRequest({ body: createAdminUserSchema }),
  adminUserController.createUser
);

/**
 * GET /api/v1/admin/users/:id
 * Retrieve specific administrator details.
 */
adminUsersRouter.get('/:id', adminUserController.getUserById);

/**
 * PATCH /api/v1/admin/users/:id
 * Update administrator details or role.
 */
adminUsersRouter.patch(
  '/:id',
  verifyCsrf,
  validateRequest({ body: updateAdminUserSchema }),
  adminUserController.updateUser
);

/**
 * PATCH /api/v1/admin/users/:id/status
 * Activate or deactivate an account.
 */
adminUsersRouter.patch(
  '/:id/status',
  verifyCsrf,
  validateRequest({ body: updateAdminUserStatusSchema }),
  adminUserController.updateStatus
);

/**
 * POST /api/v1/admin/users/:id/reset-password
 * Set a new password for an account.
 */
adminUsersRouter.post(
  '/:id/reset-password',
  verifyCsrf,
  validateRequest({ body: resetAdminUserPasswordSchema }),
  adminUserController.resetPassword
);
