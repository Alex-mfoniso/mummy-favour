import { Request, Response, NextFunction } from 'express';
import { enquiryService } from '../services/enquiry.service.js';
import { AdminRole } from '@prisma/client';

export const adminEnquiryController = {
  /**
   * GET /api/v1/admin/enquiries
   * List enquiries with search, filtering, and pagination.
   */
  async listEnquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await enquiryService.listAdminEnquiries(req.query as any);
      return res.status(200).json({
        success: true,
        data: result.enquiries,
        meta: result.meta,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * GET /api/v1/admin/enquiries/:id
   * Get complete enquiry details including items and internal staff notes.
   */
  async getEnquiryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const enquiry = await enquiryService.getAdminEnquiryById(id);
      return res.status(200).json({
        success: true,
        data: enquiry,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * PATCH /api/v1/admin/enquiries/:id/status
   * Update enquiry lifecycle status.
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await enquiryService.updateEnquiryStatus(id, req.body);
      return res.status(200).json({
        success: true,
        data: updated,
        message: `Enquiry status updated to ${updated.status}.`,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * GET /api/v1/admin/enquiries/:id/notes
   * List internal staff notes for an enquiry.
   */
  async listNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notes = await enquiryService.listEnquiryNotes(id);
      return res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * POST /api/v1/admin/enquiries/:id/notes
   * Create an internal staff note.
   */
  async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authorId = req.adminUser?.id || '';
      const note = await enquiryService.createEnquiryNote(id, authorId, req.body);
      return res.status(201).json({
        success: true,
        data: note,
        message: 'Internal note added.',
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * PATCH /api/v1/admin/enquiries/:id/notes/:noteId
   * Update an existing internal note.
   */
  async updateNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, noteId } = req.params;
      const userId = req.adminUser?.id || '';
      const userRole = (req.adminUser?.role as AdminRole) || AdminRole.STAFF;
      const updated = await enquiryService.updateEnquiryNote(id, noteId, userId, userRole, req.body);
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Internal note updated.',
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * DELETE /api/v1/admin/enquiries/:id/notes/:noteId
   * Delete an existing internal note.
   */
  async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, noteId } = req.params;
      const userId = req.adminUser?.id || '';
      const userRole = (req.adminUser?.role as AdminRole) || AdminRole.STAFF;
      const result = await enquiryService.deleteEnquiryNote(id, noteId, userId, userRole);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Internal note deleted.',
      });
    } catch (error) {
      return next(error);
    }
  },
};
