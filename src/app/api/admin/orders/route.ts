import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Order } from '@/models';

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const status = new URL(req.url).searchParams.get('status') || '';
  const filter = status ? { status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(300).lean();

  return NextResponse.json(
    orders.map((o) => ({
      id: String(o._id),
      order_no: o.orderNo,
      name: o.name,
      email: o.email,
      phone: o.phone,
      address: o.address,
      district: o.district,
      note: o.note,
      payment_method: o.paymentMethod,
      payment_ref: o.paymentRef,
      payment_sender: o.paymentSender,
      payment_status: o.paymentStatus,
      status: o.status,
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      total: o.total,
      coupon: o.coupon,
      created_at: o.createdAt,
      items: o.items,
    }))
  );
}
