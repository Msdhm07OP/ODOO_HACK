import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { successResponse } from '../utils/response.util';
import { AuthRequest } from '../middleware/auth.middleware';

export class WarehouseController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const warehouses = await prisma.warehouses.findMany({
        where: { is_active: true },
        orderBy: { name: 'asc' },
      });

      res.json(successResponse({ warehouses }));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const warehouse = await prisma.warehouses.findUnique({
        where: { id: req.params.id },
      });

      res.json(successResponse(warehouse));
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const warehouse = await prisma.warehouses.create({
        data: req.body,
      });

      res.status(201).json(successResponse(warehouse, 'Warehouse created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const warehouse = await prisma.warehouses.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(successResponse(warehouse, 'Warehouse updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
