import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Order, Product } from '@/models';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json();
  if (!STATUSES.includes(status)) return NextResponse.json({ error: 'Bad status' }, { status: 400 });

  await connectDB();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (status === 'cancelled' && order.status !== 'cancelled') {
    for (const i of order.items) {
      await Product.findByIdAndUpdate(i.productId, { $inc: { stock: i.qty, sold: -i.qty } });
    }
  } else if (order.status === 'cancelled' && status !== 'cancelled') {
    for (const i of order.items) {
      await Product.findByIdAndUpdate(i.productId, { $inc: { stock: -i.qty, sold: i.qty } });
    }
  }

  order.status = status;
  await order.save();
  return NextResponse.json({ ok: true });
}
