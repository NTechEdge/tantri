import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_PAYMENTS, getPayments } from '@/lib/store-helpers';
import { Setting } from '@/models';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const [rows, payments] = await Promise.all([Setting.find().lean(), getPayments()]);
  const obj = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({ ...obj, payments });
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const b = await req.json();

  if (Array.isArray(b.payments)) {
    const clean = b.payments
      .filter((p: { id?: string }) => DEFAULT_PAYMENTS.some((d) => d.id === p.id))
      .map((p: { id: string; enabled?: boolean; number?: string; qr?: string }) => ({
        id: p.id,
        enabled: p.enabled ? 1 : 0,
        number: String(p.number || '').slice(0, 40),
        qr: String(p.qr || '').slice(0, 200),
      }));
    await Setting.updateOne({ key: 'payments' }, { $set: { key: 'payments', value: clean } }, { upsert: true });
  }

  for (const k of ['shipping_dhaka', 'shipping_outside', 'free_over', 'phone']) {
    if (k in b) {
      await Setting.updateOne({ key: k }, { $set: { key: k, value: String(b[k]) } }, { upsert: true });
    }
  }

  return NextResponse.json({ ok: true });
}
