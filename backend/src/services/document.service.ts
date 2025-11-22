import prisma from '../config/database';
import { NotFoundError, AppError } from '../utils/error.util';
import { getPagination } from '../utils/pagination.util';
import { StockService } from './stock.service';

const stockService = new StockService();

export class DocumentService {
  async getAll(filters: {
    page?: number;
    limit?: number;
    documentType?: string;
    status?: string;
    search?: string;
  }) {
    const { skip, take, page, limit } = getPagination(filters);

    const where: any = {};

    if (filters.documentType) {
      where.document_type = filters.documentType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { document_number: { contains: filters.search, mode: 'insensitive' } },
        { reference_number: { contains: filters.search, mode: 'insensitive' } },
        { partner_name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.documents.findMany({
        where,
        skip,
        take,
        include: {
          lines: {
            include: {
              product: true,
            },
          },
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          validator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.documents.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const document = await prisma.documents.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
        creator: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        validator: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    return document;
  }

  async create(data: {
    documentType: string;
    referenceNumber?: string;
    partnerName?: string;
    scheduledDate?: Date;
    warehouseId?: string;
    lines: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
    }>;
    createdBy: string;
  }) {
    // Generate document number
    const prefix = this.getDocumentPrefix(data.documentType);
    const year = new Date().getFullYear();
    const count = await prisma.documents.count({
      where: {
        document_type: data.documentType,
        created_at: {
          gte: new Date(`${year}-01-01`),
        },
      },
    });
    const documentNumber = `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;

    // Create document with lines
    const document = await prisma.documents.create({
      data: {
        document_number: documentNumber,
        document_type: data.documentType,
        status: 'draft',
        reference_number: data.referenceNumber,
        partner_name: data.partnerName,
        scheduled_date: data.scheduledDate,
        created_by: data.createdBy,
        lines: {
          create: data.lines.map((line) => ({
            product_id: line.productId,
            quantity: line.quantity,
            unit_price: line.unitPrice,
            notes: line.notes,
          })),
        },
      },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return document;
  }

  async updateStatus(
    id: string,
    newStatus: string,
    userId: string,
    warehouseId?: string
  ) {
    const document = await this.getById(id);

    // Validate status transition
    this.validateStatusTransition(document.status, newStatus);

    // Handle validated status (process stock)
    if (newStatus === 'done' && warehouseId) {
      await this.processStockMovements(document, warehouseId, userId);

      await prisma.documents.update({
        where: { id },
        data: {
          status: newStatus,
          validated_at: new Date(),
          validated_by: userId,
        },
      });
    } else {
      await prisma.documents.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    return this.getById(id);
  }

  async delete(id: string) {
    const document = await this.getById(id);

    if (document.status !== 'draft') {
      throw new AppError('Can only delete draft documents', 400);
    }

    await prisma.documents.delete({
      where: { id },
    });
  }

  private getDocumentPrefix(documentType: string): string {
    const prefixes: Record<string, string> = {
      receipt: 'RCP',
      delivery: 'DEL',
      transfer: 'TRF',
      adjustment: 'ADJ',
    };
    return prefixes[documentType] || 'DOC';
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: Record<string, string[]> = {
      draft: ['waiting', 'cancelled'],
      waiting: ['ready', 'cancelled'],
      ready: ['done', 'cancelled'],
      done: [],
      cancelled: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
  }

  private async processStockMovements(
    document: any,
    warehouseId: string,
    userId: string
  ) {
    for (const line of document.lines) {
      // RECEIPT: add stock to specified warehouse
      if (document.document_type === 'receipt') {
        await stockService.updateStock('receipt', line.product_id, warehouseId, line.quantity);

        await stockService.recordMovement({
          movementType: 'IN',
          documentId: document.id,
          productId: line.product_id,
          toWarehouseId: warehouseId,
          quantity: line.quantity,
          unitPrice: parseFloat(line.unit_price.toString()),
          referenceNumber: document.document_number,
          createdBy: userId,
        });
      }

      // DELIVERY: remove stock from specified warehouse
      else if (document.document_type === 'delivery') {
        // warehouseId should be the source (from) warehouse
        await stockService.updateStock('delivery', line.product_id, warehouseId, line.quantity);

        await stockService.recordMovement({
          movementType: 'OUT',
          documentId: document.id,
          productId: line.product_id,
          fromWarehouseId: warehouseId,
          quantity: line.quantity,
          unitPrice: parseFloat(line.unit_price.toString()),
          referenceNumber: document.document_number,
          createdBy: userId,
        });
      }

      // TRANSFER: move stock from source to destination
      else if (document.document_type === 'transfer') {
        // For transfers, warehouseId may be an object { from: string, to: string }
        let fromId = warehouseId as any;
        let toId: string | undefined = undefined;
        if (warehouseId && typeof warehouseId === 'object') {
          fromId = (warehouseId as any).from;
          toId = (warehouseId as any).to;
        }

        if (!fromId || !toId) {
          throw new Error('Transfer requires both from and to warehouse IDs');
        }

        // Decrease from source
        await stockService.updateStock('delivery', line.product_id, fromId, line.quantity);
        // Increase at destination
        await stockService.updateStock('receipt', line.product_id, toId, line.quantity);

        await stockService.recordMovement({
          movementType: 'TRANSFER',
          documentId: document.id,
          productId: line.product_id,
          fromWarehouseId: fromId,
          toWarehouseId: toId,
          quantity: line.quantity,
          unitPrice: parseFloat(line.unit_price.toString()),
          referenceNumber: document.document_number,
          createdBy: userId,
        });
      }

      // ADJUSTMENT: increase or decrease based on signed quantity
      else if (document.document_type === 'adjustment') {
        // Positive quantity -> increase, negative -> decrease
        await stockService.updateStock('adjustment', line.product_id, warehouseId, line.quantity);

        const movementType = line.quantity >= 0 ? 'IN' : 'OUT';
        await stockService.recordMovement({
          movementType: 'ADJUSTMENT',
          documentId: document.id,
          productId: line.product_id,
          toWarehouseId: line.quantity >= 0 ? warehouseId : undefined,
          fromWarehouseId: line.quantity < 0 ? warehouseId : undefined,
          quantity: Math.abs(line.quantity),
          unitPrice: parseFloat(line.unit_price.toString()),
          referenceNumber: document.document_number,
          createdBy: userId,
        });
      }
    }
  }
}
