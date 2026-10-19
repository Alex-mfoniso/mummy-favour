import { Router } from 'express';
import { businessSettingsController } from '../controllers/businessSettings.controller.js';

export const businessSettingsRouter = Router();

/**
 * GET /api/v1/business-settings
 * Public endpoint to retrieve verified company details, contact channels, and hours.
 */
businessSettingsRouter.get('/', businessSettingsController.getPublicSettings);
