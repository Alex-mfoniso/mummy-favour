import { Request, Response, NextFunction } from 'express';
import { productService, FormattedProduct } from '../services/product.service.js';
import { ApiSuccessResponse } from '../types/api.js';

export class ProductController {
  async getProducts(
    req: Request,
    res: Response<ApiSuccessResponse<FormattedProduct[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const includeHidden = req.query.includeHidden === 'true' || req.query.includeHidden === '1';

      const result = await productService.getProducts(req.query as any, {
        includeHiddenCategories: includeHidden,
      });

      res.status(200).json({
        success: true,
        data: result.products,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductBySlug(
    req: Request,
    res: Response<ApiSuccessResponse<FormattedProduct>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const includeHidden = req.query.includeHidden === 'true' || req.query.includeHidden === '1';

      const product = await productService.getProductBySlug(slug, {
        includeHiddenCategories: includeHidden,
      });

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(
    req: Request,
    res: Response<ApiSuccessResponse<FormattedProduct>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const created = await productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(
    req: Request,
    res: Response<ApiSuccessResponse<FormattedProduct>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await productService.updateProduct(id, req.body);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(
    req: Request,
    res: Response<ApiSuccessResponse<{ id: string; message: string }>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
