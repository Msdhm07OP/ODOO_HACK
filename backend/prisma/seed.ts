import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const hashedPassword = await hashPassword('Admin123!');

  const admin = await prisma.users.upsert({
    where: { email: 'admin@stockmaster.com' },
    update: {},
    create: {
      email: 'admin@stockmaster.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true,
    },
  });

  const manager = await prisma.users.upsert({
    where: { email: 'manager@stockmaster.com' },
    update: {},
    create: {
      email: 'manager@stockmaster.com',
      password_hash: hashedPassword,
      first_name: 'Manager',
      last_name: 'User',
      role: 'manager',
      is_active: true,
    },
  });

  const staff = await prisma.users.upsert({
    where: { email: 'staff@stockmaster.com' },
    update: {},
    create: {
      email: 'staff@stockmaster.com',
      password_hash: hashedPassword,
      first_name: 'Staff',
      last_name: 'User',
      role: 'staff',
      is_active: true,
    },
  });

  console.log('✅ Users created');

  // Create warehouses
  const warehouse1 = await prisma.warehouses.upsert({
    where: { code: 'WH-001' },
    update: {},
    create: {
      code: 'WH-001',
      name: 'Main Warehouse',
      address: '123 Industrial Ave, Mumbai, Maharashtra 400001',
      capacity: 10000,
      manager: 'Rajesh Kumar',
      phone: '+91-9876543210',
      is_active: true,
    },
  });

  const warehouse2 = await prisma.warehouses.upsert({
    where: { code: 'WH-002' },
    update: {},
    create: {
      code: 'WH-002',
      name: 'Production Floor',
      address: '456 Manufacturing St, Mumbai, Maharashtra 400002',
      capacity: 5000,
      manager: 'Priya Sharma',
      phone: '+91-9876543211',
      is_active: true,
    },
  });

  const warehouse3 = await prisma.warehouses.upsert({
    where: { code: 'WH-003' },
    update: {},
    create: {
      code: 'WH-003',
      name: 'Warehouse 2',
      address: '789 Storage Rd, Navi Mumbai, Maharashtra 400703',
      capacity: 8000,
      manager: 'Amit Patel',
      phone: '+91-9876543212',
      is_active: true,
    },
  });

  console.log('✅ Warehouses created');

  // Create products
  const products = [
    {
      sku: 'ELC-001',
      name: 'LED Monitor 27" 4K',
      description: 'High-resolution 4K monitor with HDR support',
      category: 'Electronics',
      unit_of_measure: 'pcs',
      unit_price: 299.99,
      reorder_point: 20,
      max_stock_level: 100,
      supplier: 'TechSupply Co',
      created_by: admin.id,
    },
    {
      sku: 'FRN-023',
      name: 'Office Chair Executive',
      description: 'Ergonomic executive chair with lumbar support',
      category: 'Furniture',
      unit_of_measure: 'pcs',
      unit_price: 249.00,
      reorder_point: 10,
      max_stock_level: 30,
      supplier: 'Office Furnishings Ltd',
      created_by: admin.id,
    },
    {
      sku: 'MAT-156',
      name: 'Steel Rods 6mm',
      description: 'High-grade steel construction rods',
      category: 'Materials',
      unit_of_measure: 'kg',
      unit_price: 3.50,
      reorder_point: 200,
      max_stock_level: 1000,
      supplier: 'Metal Works Inc',
      created_by: admin.id,
    },
    {
      sku: 'TLS-087',
      name: 'Power Drill Set',
      description: 'Professional cordless drill kit with accessories',
      category: 'Tools',
      unit_of_measure: 'pcs',
      unit_price: 89.99,
      reorder_point: 15,
      max_stock_level: 40,
      supplier: 'ToolMaster Pro',
      created_by: admin.id,
    },
    {
      sku: 'ELC-045',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with USB receiver',
      category: 'Electronics',
      unit_of_measure: 'pcs',
      unit_price: 29.99,
      reorder_point: 50,
      max_stock_level: 200,
      supplier: 'TechSupply Co',
      created_by: admin.id,
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const p = await prisma.products.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
    createdProducts.push(p);
  }

  console.log('✅ Products created');

  // Create product stock
  const warehouses = [warehouse1, warehouse2, warehouse3];
  for (const product of createdProducts) {
    for (const warehouse of warehouses) {
      await prisma.product_stock.upsert({
        where: {
          product_id_warehouse_id: {
            product_id: product.id,
            warehouse_id: warehouse.id,
          },
        },
        update: {},
        create: {
          product_id: product.id,
          warehouse_id: warehouse.id,
          quantity_on_hand: Math.floor(Math.random() * 50) + 10,
          quantity_reserved: 0,
        },
      });
    }
  }

  console.log('✅ Product stock initialized');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
