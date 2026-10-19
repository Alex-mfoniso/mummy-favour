import { Request, Response, NextFunction } from 'express';
import { 
  businessSettingsService, 
  PublicBusinessSettingsResponse, 
  AdminBusinessSettingsResponse 
} from '../services/businessSettings.service.js';
import { ApiSuccessResponse } from '../types/api.js';

export class BusinessSettingsController {
  /**
   * GET /api/v1/business-settings
   * Public endpoint returning business identity, contact, and hours.
   */
  async getPublicSettings(
    _req: Request,
    res: Response<ApiSuccessResponse<PublicBusinessSettingsResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await businessSettingsService.getPublicSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/business-settings
   * Authenticated administrator endpoint returning full settings.
   */
  async getAdminSettings(
    _req: Request,
    res: Response<ApiSuccessResponse<AdminBusinessSettingsResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await businessSettingsService.getAdminSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/business-settings
   * Authenticated administrator endpoint to update partial settings.
   */
  async updateAdminSettings(
    req: Request,
    res: Response<ApiSuccessResponse<AdminBusinessSettingsResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await businessSettingsService.updateAdminSettings(req.body);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const businessSettingsController = new BusinessSettingsController();
