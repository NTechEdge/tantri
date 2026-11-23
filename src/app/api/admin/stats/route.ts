import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Order, Product, User } from '@/models';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 6 * 86_400_000);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [allOrders, todayOrders, pending, customers, lowStock, recent, top] = await Promise.all([
    Order.find({ status: { $ne: 'cancelled' } }).select('total createdAt').lean(),
    Order.find({ status: { $ne: 'cancelled' }, createdAt: { $gte: startOfToday } }).select('total').lean(),
    Order.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'customer' }),
    Product.find({ active: true, stock: { $lte: 5 } }).sort({ stock: 1 }).limit(10).select('name stock').lean(),
    Order.find().sort({ createdAt: -1 }).limit(8).select('orderNo name total status createdAt').lean(),
    Product.find({ active: true }).sort({ sold: -1 }).limit(5).select('name sold').lean(),
  ]);

  const revenue = allOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);

  const dayMap = new Map<string, { v: number; n: number }>();
  for (let i = 6; i >= 0; i--) {
    const key = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    dayMap.set(key, { v: 0, n: 0 });
  }
  for (const o of allOrders) {
    if (o.createdAt && new Date(o.createdAt) >= sevenDaysAgo) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const entry = dayMap.get(key);
      if (entry) {
        entry.v += Number(o.total || 0);
        entry.n += 1;
      }
    }
  }

  return NextResponse.json({
    revenue,
    orders: allOrders.length,
    today_revenue: todayRevenue,
    today_orders: todayOrders.length,
    pending,
    customers,
    days: Array.from(dayMap.entries()).map(([d, data]) => ({ d, ...data })),
    low_stock: lowStock.map((p) => ({ name: p.name, stock: p.stock })),
    recent: recent.map((o) => ({
      order_no: o.orderNo,
      name: o.name,
      total: o.total,
      status: o.status,
      created_at: o.createdAt,
    })),
    top: top.map((p) => ({ name: p.name, sold: p.sold })),
  });
}
