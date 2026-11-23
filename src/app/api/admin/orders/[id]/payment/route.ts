import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Order } from '@/models';

const PAY_STATUSES = ['unpaid', 'pending', 'paid', 'failed'] as const;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { id } = await params;
  const { payment_status } = await req.json();
  if (!PAY_STATUSES.includes(payment_status)) {
    return NextResponse.json({ error: 'Bad status' }, { status: 400 });
  }

  await connectDB();
  await Order.findByIdAndUpdate(id, { paymentStatus: payment_status });
  return NextResponse.json({ ok: true });
}
