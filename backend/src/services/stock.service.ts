import prisma from '../config/database';
import { AppError } from '../utils/error.util';

export class StockService {
  async checkAvailability(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<boolean> {
    const stock = await prisma.product_stock.findUnique({
      where: {
        product_id_warehouse_id: {
          product_id: productId,
          warehouse_id: warehouseId,
        },
      },
    });

    if (!stock) return false;

    const available = stock.quantity_on_hand - stock.quantity_reserved;
    return available >= quantity;
  }

  async reserveStock(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    const stock = await prisma.product_stock.findUnique({
      where: {
        product_id_warehouse_id: {
          product_id: productId,
          warehouse_id: warehouseId,
        },
      },
    });

    if (!stock) {
      throw new AppError('Product stock not found in warehouse', 404);
    }

    const available = stock.quantity_on_hand - stock.quantity_reserved;
    if (available < quantity) {
      throw new AppError('Insufficient stock available', 400);
    }

    await prisma.product_stock.update({
      where: { id: stock.id },
      data: {
        quantity_reserved: {
          increment: quantity,
        },
      },
    });
  }

  async releaseReservedStock(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    await prisma.product_stock.updateMany({
      where: {
        product_id: productId,
        warehouse_id: warehouseId,
      },
      data: {
        quantity_reserved: {
          decrement: quantity,
        },
      },
    });
  }

  async updateStock(
    documentType: string,
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    switch (documentType) {
      case 'receipt':
        await this.increaseStock(productId, warehouseId, quantity);
        break;
      case 'delivery':
        await this.decreaseStock(productId, warehouseId, quantity);
        break;
      case 'adjustment':
        if (quantity > 0) {
          await this.increaseStock(productId, warehouseId, quantity);
        } else {
          await this.decreaseStock(productId, warehouseId, Math.abs(quantity));
        }
        break;
    }
  }

  private async increaseStock(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    await prisma.product_stock.upsert({
      where: {
        product_id_warehouse_id: {
          product_id: productId,
          warehouse_id: warehouseId,
        },
      },
      update: {
        quantity_on_hand: {
          increment: quantity,
        },
      },
      create: {
        product_id: productId,
        warehouse_id: warehouseId,
        quantity_on_hand: quantity,
        quantity_reserved: 0,
      },
    });
  }

  private async decreaseStock(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    const stock = await prisma.product_stock.findUnique({
      where: {
        product_id_warehouse_id: {
          product_id: productId,
          warehouse_id: warehouseId,
        },
      },
    });

    if (!stock) {
      throw new AppError('Product stock not found', 404);
    }

    await prisma.product_stock.update({
      where: { id: stock.id },
      data: {
        quantity_on_hand: {
          decrement: quantity,
        },
        quantity_reserved: {
          decrement: quantity,
        },
      },
    });
  }

  async recordMovement(data: {
    movementType: string;
    documentId: string;
    productId: string;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    quantity: number;
    unitPrice: number;
    referenceNumber: string;
    createdBy: string;
  }): Promise<void> {
    await prisma.stock_movements.create({
      data: {
        movement_type: data.movementType,
        document_id: data.documentId,
        product_id: data.productId,
        from_warehouse_id: data.fromWarehouseId,
        to_warehouse_id: data.toWarehouseId,
        quantity: data.quantity,
        unit_price: data.unitPrice,
        reference_number: data.referenceNumber,
        created_by: data.createdBy,
      },
    });
  }
}
