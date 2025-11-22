import { Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { successResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

const documentService = new DocumentService();

export class DocumentController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        documentType: req.query.documentType as string,
        status: req.query.status as string,
        search: req.query.search as string,
      };

      const result = await documentService.getAll(filters);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const document = await documentService.getById(req.params.id);
      res.json(successResponse(document));
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const document = await documentService.create({
        ...req.body,
        createdBy: req.user!.id,
      });
      res.status(201).json(successResponse(document, 'Document created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, warehouseId } = req.body;
      const document = await documentService.updateStatus(
        req.params.id,
        status,
        req.user!.id,
        warehouseId
      );
      res.json(successResponse(document, 'Document status updated'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await documentService.delete(req.params.id);
      res.json(successResponse(null, 'Document deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
