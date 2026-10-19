import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { validateRequest, requireAuth, requireRole, verifyCsrf } from '../middleware/index.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../schemas/product.schema.js';

export const productRouter = Router();

// ----------------------------------------------------------------------------
// PUBLIC ENDPOINTS
// ----------------------------------------------------------------------------

/**
 * List paginated products with search, category, featured, and sort allowlist.
 * GET /api/v1/products
 */
productRouter.get(
  '/',
  validateRequest({ query: productQuerySchema }),
  productController.getProducts
);

/**
 * Get a single publicly visible product by slug.
 * GET /api/v1/products/:slug
 */
productRouter.get('/:slug', productController.getProductBySlug);

// ----------------------------------------------------------------------------
// ADMINISTRATIVE ENDPOINTS (Protected by Session Auth, RBAC & CSRF)
// ----------------------------------------------------------------------------

/**
 * Create a new product.
 * POST /api/v1/products
 */
productRouter.post(
  '/',
  requireAuth,
  requireRole(['ADMIN', 'SUPERADMIN']),
  verifyCsrf,
  validateRequest({ body: createProductSchema }),
  productController.createProduct
);

/**
 * Update an existing product by ID.
 * PATCH /api/v1/products/:id
 */
productRouter.patch(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'SUPERADMIN']),
  verifyCsrf,
  validateRequest({ body: updateProductSchema }),
  productController.updateProduct
);

/**
 * Delete a product by ID.
 * DELETE /api/v1/products/:id
 */
productRouter.delete(
  '/:id',
  requireAuth,
  requireRole(['ADMIN', 'SUPERADMIN']),
  verifyCsrf,
  productController.deleteProduct
);
