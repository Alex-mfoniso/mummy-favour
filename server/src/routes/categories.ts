import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { validateRequest, requireAuth, requireRole, verifyCsrf } from '../middleware/index.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema.js';

export const categoryRouter = Router();

// ----------------------------------------------------------------------------
// PUBLIC ENDPOINTS
// ----------------------------------------------------------------------------

/**
 * List all visible categories ordered by display order.
 * GET /api/v1/categories
 */
categoryRouter.get('/', categoryController.getCategories);

/**
 * Get a single category by slug.
 * GET /api/v1/categories/:slug
 */
categoryRouter.get('/:slug', categoryController.getCategoryBySlug);

// ----------------------------------------------------------------------------
// ADMINISTRATIVE ENDPOINTS (Protected by Session Auth, RBAC & CSRF)
// ----------------------------------------------------------------------------

/**
 * Create a new category.
 * POST /api/v1/categories
 */
categoryRouter.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'SUPERADMIN']),
  verifyCsrf,
  validateRequest({ body: createCategorySchema }),
  categoryController.createCategory
);

/**
 * Update an existing category by ID.
 * PATCH /api/v1/categories/:id
 */
categoryRouter.patch(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'SUPERADMIN']),
  verifyCsrf,
  validateRequest({ body: updateCategorySchema }),
  categoryController.updateCategory
);

/**
 * Delete a category by ID (safe deletion constraint).
 * DELETE /api/v1/categories/:id
 */
categoryRouter.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'SUPERADMIN']),
  verifyCsrf,
  categoryController.deleteCategory
);
