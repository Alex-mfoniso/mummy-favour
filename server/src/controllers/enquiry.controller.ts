import { Request, Response, NextFunction } from 'express';
import { enquiryService } from '../services/enquiry.service.js';

export const enquiryController = {
  /**
   * POST /api/v1/enquiries
   * Public enquiry submission (quotation request, custom packaging, or general enquiry).
   */
  async submitEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await enquiryService.submitPublicEnquiry(req.body);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * GET /api/v1/enquiries/track?token=<token>
   * Also accepts header X-Tracking-Token
   * Returns limited customer tracking status for the associated enquiry.
   */
  async trackEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const token = ((req.query.token as string) || (req.headers['x-tracking-token'] as string) || '').trim();
      const trackingData = await enquiryService.trackEnquiry(token);
      return res.status(200).json({
        success: true,
        data: trackingData,
      });
    } catch (error) {
      return next(error);
    }
  },
};
