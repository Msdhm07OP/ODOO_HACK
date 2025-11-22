import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { successResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

const productService = new ProductService();

export class ProductController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        category: req.query.category as string,
        search: req.query.search as string,
        stockLevel: req.query.stockLevel as 'low' | 'optimal' | 'high',
        warehouseId: req.query.warehouseId as string,
      };

      const result = await productService.getAll(filters);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(req.params.id);
      res.json(successResponse(product));
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.create({
        ...req.body,
        createdBy: req.user!.id,
      });

      res.status(201).json(successResponse(product, 'Product created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.json(successResponse(product, 'Product updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await productService.delete(req.params.id);
      res.json(successResponse(null, 'Product deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
