const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 12);

  await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'owner',
      display_name: 'Owner',
      description: 'Pemilik gudang dengan akses penuh',
    },
  });

  await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'admin',
      display_name: 'Admin',
      description: 'Administrator gudang',
    },
  });

  await prisma.user.upsert({
    where: { email: 'owner@gudang.com' },
    update: {},
    create: { id: 1, name: 'Owner', email: 'owner@gudang.com', password, role_id: 1 },
  });

  await prisma.user.upsert({
    where: { email: 'admin@gudang.com' },
    update: {},
    create: { id: 2, name: 'Admin', email: 'admin@gudang.com', password, role_id: 2 },
  });

  const categories = [
    [1, 'Elektronik', 'Barang elektronik dan gadget'],
    [2, 'Furniture', 'Mebel dan perabotan'],
    [3, 'Alat Tulis', 'Perlengkapan kantor dan alat tulis'],
    [4, 'Makanan', 'Produk makanan dan minuman'],
    [5, 'Pakaian', 'Pakaian dan aksesoris'],
  ];

  for (const [id, name, description] of categories) {
    await prisma.category.upsert({
      where: { id },
      update: {},
      create: { id, name, description },
    });
  }

  const products = [
    [1, 'ELK001', 'Laptop Dell', 'Laptop Dell Inspiron 15', 1, 15, 5, 8500000.0, 'pcs'],
    [2, 'ELK002', 'Mouse Wireless', 'Mouse wireless Logitech', 1, 50, 20, 150000.0, 'pcs'],
    [3, 'FUR001', 'Kursi Kantor', 'Kursi kantor ergonomis', 2, 8, 3, 1200000.0, 'pcs'],
    [4, 'ATK001', 'Kertas A4', 'Kertas A4 80 gram', 3, 100, 30, 45000.0, 'rim'],
    [5, 'ATK002', 'Pulpen', 'Pulpen hitam', 3, 200, 50, 3000.0, 'pcs'],
  ];

  for (const [id, code, name, description, category_id, stock, min_stock, price, unit] of products) {
    await prisma.product.upsert({
      where: { id },
      update: {},
      create: { id, code, name, description, category_id, stock, min_stock, price, unit },
    });
  }

  const now = new Date();
  const transactions = [
    [1, 'TRX-IN001', 1, 1, 'in', 10, 'Pembelian awal'],
    [2, 'TRX-OUT001', 2, 2, 'out', 5, 'Pengiriman ke cabang'],
    [3, 'TRX-IN002', 4, 1, 'in', 50, 'Restock bulanan'],
  ];

  for (const [id, transaction_code, product_id, user_id, type, quantity, notes] of transactions) {
    await prisma.transaction.upsert({
      where: { id },
      update: {},
      create: { id, transaction_code, product_id, user_id, type, quantity, notes, transaction_date: now },
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
