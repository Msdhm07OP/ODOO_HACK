import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/error.util';
import { getPagination } from '../utils/pagination.util';

export class ProductService {
  async getAll(filters: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    stockLevel?: 'low' | 'optimal' | 'high';
    warehouseId?: string;
  }) {
    const { skip, take, page, limit } = getPagination(filters);

    const where: any = {
      is_active: true,
    };

    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take,
        include: {
          product_stock: {
            include: {
              warehouse: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.products.count({ where }),
    ]);

    // Transform data
    const transformedProducts = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      unitOfMeasure: product.unit_of_measure,
      unitPrice: parseFloat(product.unit_price.toString()),
      reorderPoint: product.reorder_point,
      maxStockLevel: product.max_stock_level,
      supplier: product.supplier,
      isActive: product.is_active,
      stock: product.product_stock.map((stock) => ({
        warehouseId: stock.warehouse_id,
        warehouseName: stock.warehouse.name,
        warehouseCode: stock.warehouse.code,
        quantityOnHand: stock.quantity_on_hand,
        quantityReserved: stock.quantity_reserved,
        quantityAvailable: stock.quantity_on_hand - stock.quantity_reserved,
      })),
      totalStock: product.product_stock.reduce(
        (sum, s) => sum + s.quantity_on_hand,
        0
      ),
      createdAt: product.created_at,
    }));

    return {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        product_stock: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    return product;
  }

  async create(data: {
    sku: string;
    name: string;
    description?: string;
    category: string;
    unitOfMeasure: string;
    unitPrice?: number;
    reorderPoint?: number;
    maxStockLevel?: number;
    supplier?: string;
    createdBy: string;
  }) {
    // Check if SKU exists
    const existing = await prisma.products.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new ConflictError('SKU already exists');
    }

    const product = await prisma.products.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        category: data.category,
        unit_of_measure: data.unitOfMeasure,
        unit_price: data.unitPrice || 0,
        reorder_point: data.reorderPoint || 0,
        max_stock_level: data.maxStockLevel,
        supplier: data.supplier,
        created_by: data.createdBy,
      },
    });

    return product;
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    category: string;
    unitOfMeasure: string;
    unitPrice: number;
    reorderPoint: number;
    maxStockLevel: number;
    supplier: string;
  }>) {
    const product = await prisma.products.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.unitOfMeasure && { unit_of_measure: data.unitOfMeasure }),
        ...(data.unitPrice !== undefined && { unit_price: data.unitPrice }),
        ...(data.reorderPoint !== undefined && { reorder_point: data.reorderPoint }),
        ...(data.maxStockLevel !== undefined && { max_stock_level: data.maxStockLevel }),
        ...(data.supplier !== undefined && { supplier: data.supplier }),
      },
    });

    return product;
  }

  async delete(id: string) {
    await prisma.products.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async getLowStock() {
    const products = await prisma.products.findMany({
      where: { is_active: true },
      include: {
        product_stock: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const lowStockProducts = products
      .map((product) => {
        const totalStock = product.product_stock.reduce(
          (sum, s) => sum + (s.quantity_on_hand - s.quantity_reserved),
          0
        );

        return {
          ...product,
          totalStock,
        };
      })
      .filter((product) => product.totalStock <= product.reorder_point);

    return lowStockProducts;
  }
}
