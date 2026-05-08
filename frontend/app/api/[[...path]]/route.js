import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';

const includeProduct = { category: true };
const includeTransaction = { product: true, user: { include: { role: true } } };
const includeUser = { role: true };
const includeOpname = { product: { include: { category: true } }, user: { include: { role: true } } };

function json(data, status = 200) {
  return NextResponse.json(serialize(data), { status });
}

function serialize(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (_key === 'password' || _key === 'remember_token') return undefined;
      if (typeof item === 'bigint') return Number(item);
      if (item && typeof item === 'object' && typeof item.toNumber === 'function') {
        return item.toNumber();
      }
      return item;
    })
  );
}

async function body(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function pathOf(params) {
  const resolvedParams = await params;
  return resolvedParams?.path || [];
}

function tokenUserId(request) {
  const header = request.headers.get('authorization') || '';
  const token = header.replace('Bearer ', '').replace('dummy-token-', '');
  const id = Number(token);
  return Number.isFinite(id) ? id : null;
}

async function currentUser(request) {
  const id = tokenUserId(request);
  if (!id) return null;
  return prisma.user.findUnique({ where: { id }, include: includeUser });
}

async function requireRole(request, roles) {
  const user = await currentUser(request);
  if (!user || !roles.includes(user.role?.name)) {
    return { error: json({ message: 'Akses ditolak untuk role ini' }, 403) };
  }
  return { user };
}

async function audit(request, action, module, description, old_values = null, new_values = null, user = null) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: user?.id || null,
        action,
        module,
        description,
        old_values: old_values ? serialize(old_values) : null,
        new_values: new_values ? serialize(new_values) : null,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
        user_agent: request.headers.get('user-agent') || null,
      },
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}

function randomCode(prefix) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

function productData(payload) {
  return {
    code: String(payload.code || '').trim(),
    name: String(payload.name || '').trim(),
    description: payload.description || null,
    category_id: Number(payload.category_id),
    stock: Number(payload.stock),
    min_stock: Number(payload.min_stock),
    price: Number(payload.price),
    unit: String(payload.unit || 'pcs').trim(),
  };
}

function categoryData(payload) {
  return {
    name: String(payload.name || '').trim(),
    description: payload.description || null,
  };
}

function userData(payload, includePassword = false) {
  const data = {
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim(),
    role_id: Number(payload.role_id),
  };
  if (includePassword || payload.password) {
    data.password = String(payload.password || '');
  }
  return data;
}

async function handleLogin(request, payload) {
  try {
    const email = String(payload.email || '').trim();
    const password = String(payload.password || '');
    const user = await prisma.user.findUnique({ where: { email }, include: includeUser });

    if (!user) {
      await audit(request, 'failed_login', 'auth', `Percobaan login gagal untuk email ${email}`);
      return json({ message: 'User tidak ditemukan. Pastikan database sudah di-seed.' }, 401);
    }

    const normalizedHash = user.password.replace(/^\$2y\$/, '$2a$');
    const plainMatch = user.password === password;
    const hashMatch = await bcrypt.compare(password, normalizedHash);

    if (!plainMatch && !hashMatch) {
      await audit(request, 'failed_login', 'auth', `Percobaan login gagal untuk user ${user.name}`, null, { email }, user);
      return json({ message: 'Password salah' }, 401);
    }

    if (plainMatch) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(password, 12) },
      });
    }

    await audit(request, 'login', 'auth', `Login berhasil untuk user ${user.name}`, null, { email }, user);
    return json({ user, token: `dummy-token-${user.id}` });
  } catch (error) {
    console.error('Login failed:', error);
    return json(
      {
        message: 'Login gagal karena koneksi database bermasalah. Cek environment variable DATABASE_URL di Vercel.',
      },
      500
    );
  }
}

async function health() {
  try {
    const users = await prisma.user.count();
    return json({
      ok: true,
      database: 'connected',
      users,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return json(
      {
        ok: false,
        database: 'error',
        message: 'Database belum terkoneksi. Cek DATABASE_URL di Vercel dan redeploy.',
      },
      500
    );
  }
}

async function dashboard() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const products = await prisma.product.findMany({ include: includeProduct });
  const transactions = await prisma.transaction.findMany({ include: includeTransaction, orderBy: { transaction_date: 'desc' } });
  const todayTransactions = transactions.filter((item) => item.transaction_date >= start && item.transaction_date < end);

  const categoryMap = new Map();
  for (const product of products) {
    const current = categoryMap.get(product.category_id) || {
      id: product.category.id,
      name: product.category.name,
      products_count: 0,
      total_stock: 0,
      low_stock_count: 0,
    };
    current.products_count += 1;
    current.total_stock += product.stock;
    if (product.stock <= product.min_stock) current.low_stock_count += 1;
    categoryMap.set(product.category_id, current);
  }

  const outgoingMap = new Map();
  for (const transaction of transactions.filter((item) => item.type === 'out')) {
    const current = outgoingMap.get(transaction.product_id) || {
      id: transaction.product.id,
      code: transaction.product.code,
      name: transaction.product.name,
      unit: transaction.product.unit,
      total_out: 0,
    };
    current.total_out += transaction.quantity;
    outgoingMap.set(transaction.product_id, current);
  }

  return json({
    stats: {
      total_products: products.length,
      total_stock: products.reduce((sum, item) => sum + item.stock, 0),
      low_stock: products.filter((item) => item.stock <= item.min_stock).length,
      today_transactions: todayTransactions.length,
      today_stock_in: todayTransactions.filter((item) => item.type === 'in').reduce((sum, item) => sum + item.quantity, 0),
      today_stock_out: todayTransactions.filter((item) => item.type === 'out').reduce((sum, item) => sum + item.quantity, 0),
      out_of_stock: products.filter((item) => item.stock <= 0).length,
    },
    recent_transactions: transactions.slice(0, 8),
    stock_by_category: [...categoryMap.values()].sort((a, b) => b.total_stock - a.total_stock),
    low_stock_products: products
      .filter((item) => item.stock <= item.min_stock)
      .sort((a, b) => b.min_stock - b.stock - (a.min_stock - a.stock) || a.stock - b.stock)
      .slice(0, 5),
    top_outgoing_products: [...outgoingMap.values()].sort((a, b) => b.total_out - a.total_out).slice(0, 5),
  });
}

async function dashboardChart(request) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'daily';
  const date = url.searchParams.get('date');
  const now = new Date();
  let from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  let to = now;

  if (date && period === 'daily') {
    from = new Date(`${date}T00:00:00`);
    to = new Date(`${date}T23:59:59`);
  } else if (date && period === 'monthly') {
    const [year, month] = date.split('-').map(Number);
    from = new Date(year, month - 1, 1);
    to = new Date(year, month, 1);
  } else if (date && period === 'yearly') {
    from = new Date(Number(date), 0, 1);
    to = new Date(Number(date) + 1, 0, 1);
  } else if (period === 'weekly') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  } else if (period === 'monthly') {
    from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  } else if (period === 'yearly') {
    from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }

  const rows = await prisma.transaction.findMany({
    where: { transaction_date: { gte: from, lt: to } },
    orderBy: { transaction_date: 'asc' },
  });

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const groups = new Map();
  for (const row of rows) {
    const d = row.transaction_date;
    const key = period === 'yearly' ? monthNames[d.getMonth() + 1] : d.toISOString().slice(0, 10);
    const current = groups.get(key) || { date: key, stock_in: 0, stock_out: 0 };
    if (row.type === 'in') current.stock_in += row.quantity;
    if (row.type === 'out') current.stock_out += row.quantity;
    groups.set(key, current);
  }
  return json([...groups.values()]);
}

export async function GET(request, context) {
  const path = await pathOf(context.params);
  const [resource, id] = path;

  if (resource === 'health') return health();
  if (resource === 'me') return json(await currentUser(request));
  if (resource === 'roles') return json(await prisma.role.findMany({ orderBy: { id: 'asc' } }));
  if (resource === 'dashboard' && !id) return dashboard();
  if (resource === 'dashboard' && id === 'chart') return dashboardChart(request);

  if (resource === 'products') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    if (id) return json(await prisma.product.findUnique({ where: { id: Number(id) }, include: includeProduct }));
    return json(await prisma.product.findMany({ include: includeProduct, orderBy: { created_at: 'desc' } }));
  }

  if (resource === 'categories') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    if (id) return json(await prisma.category.findUnique({ where: { id: Number(id) }, include: { products: true } }));
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { created_at: 'desc' },
    });
    return json(categories.map((item) => ({ ...item, products_count: item._count.products })));
  }

  if (resource === 'transactions') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    if (id) return json(await prisma.transaction.findUnique({ where: { id: Number(id) }, include: includeTransaction }));
    return json(await prisma.transaction.findMany({ include: includeTransaction, orderBy: { transaction_date: 'desc' } }));
  }

  if (resource === 'users') {
    const access = await requireRole(request, ['owner']);
    if (access.error) return access.error;
    if (id) return json(await prisma.user.findUnique({ where: { id: Number(id) }, include: includeUser }));
    return json(await prisma.user.findMany({ include: includeUser, orderBy: { created_at: 'desc' } }));
  }

  if (resource === 'stock-opnames') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    return json(await prisma.stockOpname.findMany({ include: includeOpname, orderBy: [{ opname_date: 'desc' }, { created_at: 'desc' }] }));
  }

  if (resource === 'audit-logs') {
    const access = await requireRole(request, ['owner']);
    if (access.error) return access.error;
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;
    return json(
      await prisma.auditLog.findMany({
        where: {
          module: url.searchParams.get('module') || undefined,
          action: url.searchParams.get('action') || undefined,
          OR: search
            ? [
                { description: { contains: search, mode: 'insensitive' } },
                { module: { contains: search, mode: 'insensitive' } },
                { action: { contains: search, mode: 'insensitive' } },
              ]
            : undefined,
        },
        include: { user: true },
        orderBy: { created_at: 'desc' },
        take: 200,
      })
    );
  }

  return json({ message: `Endpoint /api/${path.join('/')} tidak ditemukan` }, 404);
}

export async function POST(request, context) {
  const path = await pathOf(context.params);
  const [resource] = path;
  const payload = await body(request);

  if (resource === 'login') return handleLogin(request, payload);

  if (resource === 'products') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    const product = await prisma.product.create({ data: productData(payload), include: includeProduct });
    await audit(request, 'create', 'products', `Menambahkan produk ${product.name}`, null, product, access.user);
    return json(product, 201);
  }

  if (resource === 'categories') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    const category = await prisma.category.create({ data: categoryData(payload) });
    await audit(request, 'create', 'categories', `Menambahkan kategori ${category.name}`, null, category, access.user);
    return json(category, 201);
  }

  if (resource === 'users') {
    const access = await requireRole(request, ['owner']);
    if (access.error) return access.error;
    const data = userData(payload, true);
    data.password = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({ data, include: includeUser });
    await audit(request, 'create', 'users', `Menambahkan user ${user.name}`, null, user, access.user);
    return json(user, 201);
  }

  if (resource === 'transactions') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    const quantity = Number(payload.quantity);
    const type = payload.type;
    const productId = Number(payload.product_id);
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      const previousStock = product.stock;
      const nextStock = type === 'in' ? previousStock + quantity : previousStock - quantity;
      if (nextStock < 0) return { insufficient: true };
      await tx.product.update({ where: { id: productId }, data: { stock: nextStock } });
      const transaction = await tx.transaction.create({
        data: {
          transaction_code: randomCode('TRX'),
          product_id: productId,
          user_id: access.user.id,
          type,
          quantity,
          notes: payload.notes || null,
          transaction_date: new Date(payload.transaction_date),
        },
        include: includeTransaction,
      });
      await tx.auditLog.create({
        data: {
          user_id: access.user.id,
          action: 'create',
          module: 'transactions',
          description: `Mencatat barang ${type === 'in' ? 'masuk' : 'keluar'} untuk produk ${product.name}`,
          old_values: { stock: previousStock },
          new_values: { transaction_code: transaction.transaction_code, product_id: productId, type, quantity, stock: nextStock },
        },
      });
      return transaction;
    });
    if (result.insufficient) return json({ message: 'Insufficient stock' }, 400);
    return json(result, 201);
  }

  if (resource === 'stock-opnames') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    const productId = Number(payload.product_id);
    const physicalStock = Number(payload.physical_stock);
    const opname = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      const systemStock = product.stock;
      const created = await tx.stockOpname.create({
        data: {
          opname_code: randomCode('OPN'),
          product_id: productId,
          user_id: access.user.id,
          system_stock: systemStock,
          physical_stock: physicalStock,
          difference: physicalStock - systemStock,
          reason: payload.reason,
          opname_date: new Date(payload.opname_date),
        },
        include: includeOpname,
      });
      await tx.product.update({ where: { id: productId }, data: { stock: physicalStock } });
      await tx.auditLog.create({
        data: {
          user_id: access.user.id,
          action: 'create',
          module: 'stock_opname',
          description: `Melakukan stock opname untuk produk ${product.name}`,
          old_values: { stock: systemStock },
          new_values: { opname_code: created.opname_code, product_id: productId, physical_stock: physicalStock, difference: created.difference, reason: created.reason },
        },
      });
      return created;
    });
    return json(opname, 201);
  }

  return json({ message: `Endpoint /api/${path.join('/')} tidak ditemukan` }, 404);
}

export async function PUT(request, context) {
  const path = await pathOf(context.params);
  const [resource, id] = path;
  const payload = await body(request);

  if (resource === 'products') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    const oldProduct = await prisma.product.findUnique({ where: { id: Number(id) } });
    const product = await prisma.product.update({ where: { id: Number(id) }, data: productData(payload), include: includeProduct });
    await audit(request, 'update', 'products', `Mengubah produk ${product.name}`, oldProduct, product, access.user);
    return json(product);
  }

  if (resource === 'categories') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    const oldCategory = await prisma.category.findUnique({ where: { id: Number(id) } });
    const category = await prisma.category.update({ where: { id: Number(id) }, data: categoryData(payload) });
    await audit(request, 'update', 'categories', `Mengubah kategori ${category.name}`, oldCategory, category, access.user);
    return json(category);
  }

  if (resource === 'users') {
    const access = await requireRole(request, ['owner']);
    if (access.error) return access.error;
    const data = userData(payload);
    if (data.password) data.password = await bcrypt.hash(data.password, 12);
    const oldUser = await prisma.user.findUnique({ where: { id: Number(id) }, include: includeUser });
    const user = await prisma.user.update({ where: { id: Number(id) }, data, include: includeUser });
    await audit(request, 'update', 'users', `Mengubah user ${user.name}`, oldUser, user, access.user);
    return json(user);
  }

  if (resource === 'transactions') {
    const access = await requireRole(request, ['owner', 'admin']);
    if (access.error) return access.error;
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({ where: { id: Number(id) } });
      const oldProduct = await tx.product.findUnique({ where: { id: transaction.product_id } });
      const newProduct = await tx.product.findUnique({ where: { id: Number(payload.product_id) } });
      const oldImpact = transaction.type === 'in' ? transaction.quantity : -transaction.quantity;
      const newImpact = payload.type === 'in' ? Number(payload.quantity) : -Number(payload.quantity);

      if (oldProduct.id === newProduct.id) {
        const nextStock = oldProduct.stock - oldImpact + newImpact;
        if (nextStock < 0) return { insufficient: true };
        await tx.product.update({ where: { id: oldProduct.id }, data: { stock: nextStock } });
      } else {
        const restoredOldStock = oldProduct.stock - oldImpact;
        const nextNewStock = newProduct.stock + newImpact;
        if (restoredOldStock < 0 || nextNewStock < 0) return { insufficient: true };
        await tx.product.update({ where: { id: oldProduct.id }, data: { stock: restoredOldStock } });
        await tx.product.update({ where: { id: newProduct.id }, data: { stock: nextNewStock } });
      }

      return tx.transaction.update({
        where: { id: Number(id) },
        data: {
          product_id: Number(payload.product_id),
          type: payload.type,
          quantity: Number(payload.quantity),
          notes: payload.notes || null,
          transaction_date: new Date(payload.transaction_date),
        },
        include: includeTransaction,
      });
    });
    if (result.insufficient) return json({ message: 'Stok tidak cukup untuk perubahan transaksi ini' }, 400);
    await audit(request, 'update', 'transactions', `Mengubah transaksi ${result.transaction_code}`, null, result, access.user);
    return json(result);
  }

  return json({ message: `Endpoint /api/${path.join('/')} tidak ditemukan` }, 404);
}

export async function DELETE(request, context) {
  const path = await pathOf(context.params);
  const [resource, id] = path;

  if (resource === 'products') {
    const access = await requireRole(request, ['owner']);
    if (access.error) return access.error;
    const product = await prisma.product.delete({ where: { id: Number(id) } });
    await audit(request, 'delete', 'products', `Menghapus produk ${product.name}`, product, null, access.user);
    return json({ message: 'Product deleted' });
  }

  if (resource === 'categories') {
    const access = await requireRole(request, ['owner']);
    if (access.error) return access.error;
    const category = await prisma.category.delete({ where: { id: Number(id) } });
    await audit(request, 'delete', 'categories', `Menghapus kategori ${category.name}`, category, null, access.user);
    return json({ message: 'Category deleted' });
  }

  if (resource === 'users') {
    const access = await requireRole(request, ['owner']);
    if (access.error) return access.error;
    if (access.user.id === Number(id)) {
      return json({ message: 'User yang sedang login tidak dapat menghapus akunnya sendiri' }, 400);
    }
    const user = await prisma.user.delete({ where: { id: Number(id) }, include: includeUser });
    await audit(request, 'delete', 'users', `Menghapus user ${user.name}`, user, null, access.user);
    return json({ message: 'User deleted' });
  }

  if (resource === 'transactions') {
    const access = await requireRole(request, ['owner']);
    if (access.error) return access.error;
    const transaction = await prisma.transaction.delete({ where: { id: Number(id) }, include: includeTransaction });
    await audit(request, 'delete', 'transactions', `Menghapus transaksi ${transaction.transaction_code}`, transaction, null, access.user);
    return json({ message: 'Transaction deleted' });
  }

  return json({ message: `Endpoint /api/${path.join('/')} tidak ditemukan` }, 404);
}
