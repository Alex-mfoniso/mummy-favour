import { Router } from 'express';
import { enquiryController } from '../controllers/enquiry.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { publicEnquiryRateLimiter, trackingRateLimiter } from '../middleware/rateLimiter.js';
import { CreateEnquirySchema } from '../schemas/enquiry.schema.js';

export const enquiryRouter = Router();

/**
 * POST /api/v1/enquiries
 * Submit a customer quote request, custom packaging enquiry, or general contact message.
 * Rate limited to 20 submissions per 15-minute window per IP.
 */
enquiryRouter.post(
  '/',
  publicEnquiryRateLimiter,
  validateRequest({ body: CreateEnquirySchema }),
  enquiryController.submitEnquiry
);

/**
 * GET /api/v1/enquiries/track
 * Customer-facing secure status tracking using cryptographic token.
 * Rate limited to 30 lookups per 15-minute window per IP.
 */
enquiryRouter.get(
  '/track',
  trackingRateLimiter,
  enquiryController.trackEnquiry
);
