import { Router } from 'express';
import { adminEnquiryController } from '../controllers/adminEnquiry.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  AdminListEnquiriesQuerySchema,
  AdminUpdateEnquiryStatusSchema,
  AdminCreateEnquiryNoteSchema,
  AdminUpdateEnquiryNoteSchema,
} from '../schemas/enquiry.schema.js';

export const adminEnquiryRouter = Router();

// All administrative enquiry routes require authentication and staff/admin role
adminEnquiryRouter.use(requireAuth);
adminEnquiryRouter.use(requireRole(['ADMIN', 'SUPERADMIN', 'STAFF']));

/**
 * GET /api/v1/admin/enquiries
 * Paginated listing with search, filtering by status and type.
 */
adminEnquiryRouter.get(
  '/',
  validateRequest({ query: AdminListEnquiriesQuerySchema }),
  adminEnquiryController.listEnquiries
);

/**
 * GET /api/v1/admin/enquiries/:id
 * Retrieve full details of an enquiry including items and staff notes.
 */
adminEnquiryRouter.get('/:id', adminEnquiryController.getEnquiryById);

/**
 * PATCH /api/v1/admin/enquiries/:id/status
 * Update the status of an enquiry. Requires CSRF verification.
 */
adminEnquiryRouter.patch(
  '/:id/status',
  verifyCsrf,
  validateRequest({ body: AdminUpdateEnquiryStatusSchema }),
  adminEnquiryController.updateStatus
);

/**
 * GET /api/v1/admin/enquiries/:id/notes
 * List internal staff notes for an enquiry.
 */
adminEnquiryRouter.get('/:id/notes', adminEnquiryController.listNotes);

/**
 * POST /api/v1/admin/enquiries/:id/notes
 * Add an internal staff note to an enquiry. Requires CSRF verification.
 */
adminEnquiryRouter.post(
  '/:id/notes',
  verifyCsrf,
  validateRequest({ body: AdminCreateEnquiryNoteSchema }),
  adminEnquiryController.createNote
);

/**
 * PATCH /api/v1/admin/enquiries/:id/notes/:noteId
 * Edit an internal staff note. Requires CSRF verification.
 */
adminEnquiryRouter.patch(
  '/:id/notes/:noteId',
  verifyCsrf,
  validateRequest({ body: AdminUpdateEnquiryNoteSchema }),
  adminEnquiryController.updateNote
);

/**
 * DELETE /api/v1/admin/enquiries/:id/notes/:noteId
 * Delete an internal staff note. Requires CSRF verification.
 */
adminEnquiryRouter.delete(
  '/:id/notes/:noteId',
  verifyCsrf,
  adminEnquiryController.deleteNote
);
