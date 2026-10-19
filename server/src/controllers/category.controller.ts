import { Request, Response, NextFunction } from 'express';
import { categoryService, FormattedCategory } from '../services/category.service.js';
import { ApiSuccessResponse } from '../types/api.js';

export class CategoryController {
  async getCategories(
    req: Request,
    res: Response<ApiSuccessResponse<FormattedCategory[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const includeProductCounts = req.query.includeProductCounts === 'true' || req.query.includeProductCounts === '1';
      const includeHidden = req.query.includeHidden === 'true' || req.query.includeHidden === '1';

      const categories = await categoryService.getCategories({
        includeProductCounts,
        includeHidden,
      });

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(
    req: Request,
    res: Response<ApiSuccessResponse<FormattedCategory>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const includeHidden = req.query.includeHidden === 'true' || req.query.includeHidden === '1';

      const category = await categoryService.getCategoryBySlug(slug, { includeHidden });

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(
    req: Request,
    res: Response<ApiSuccessResponse<FormattedCategory>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const created = await categoryService.createCategory(req.body);

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(
    req: Request,
    res: Response<ApiSuccessResponse<FormattedCategory>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await categoryService.updateCategory(id, req.body);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(
    req: Request,
    res: Response<ApiSuccessResponse<{ id: string; message: string }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await categoryService.deleteCategory(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
