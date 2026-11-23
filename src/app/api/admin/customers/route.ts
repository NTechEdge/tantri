import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Order, User } from '@/models';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const [users, orderStats] = await Promise.all([
    User.find({ role: 'customer' }).sort({ createdAt: -1 }).lean(),
    Order.aggregate([
      {
        $group: {
          _id: '$userId',
          orders: { $sum: 1 },
          spent: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', 0] } },
        },
      },
    ]),
  ]);

  const statMap = new Map(orderStats.map((s) => [String(s._id), s]));
  return NextResponse.json(
    users.map((u) => {
      const st = statMap.get(String(u._id));
      return {
        id: String(u._id),
        email: u.email,
        name: u.name || '',
        phone: u.phone || '',
        orders: st ? st.orders : 0,
        spent: st ? st.spent : 0,
        created_at: u.createdAt,
      };
    })
  );
}
