import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Offer } from '@/models';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { id } = await params;
  const b = await req.json();
  await connectDB();
  await Offer.findByIdAndUpdate(id, {
    code: String(b.code || '').trim().toUpperCase(),
    title: String(b.title || ''),
    titleBn: String(b.title_bn || ''),
    type: b.type === 'flat' ? 'flat' : 'percent',
    value: Number(b.value || 0),
    minOrder: Number(b.min_order || 0),
    maxDiscount: b.max_discount ? Number(b.max_discount) : null,
    expiresAt: b.expires_at ? new Date(b.expires_at) : null,
    usageLimit: b.usage_limit ? Number(b.usage_limit) : null,
    active: b.active !== false && b.active !== 0,
    showBanner: Boolean(b.show_banner),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { id } = await params;
  await connectDB();
  await Offer.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
