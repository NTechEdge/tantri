import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Offer } from '@/models';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const offers = await Offer.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(
    offers.map((o) => ({
      id: String(o._id),
      code: o.code,
      title: o.title,
      title_bn: o.titleBn,
      type: o.type,
      value: o.value,
      min_order: o.minOrder,
      max_discount: o.maxDiscount,
      expires_at: o.expiresAt,
      usage_limit: o.usageLimit,
      used: o.used,
      active: o.active,
      show_banner: o.showBanner,
    }))
  );
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const b = await req.json();
  const code = String(b.code || '').trim().toUpperCase();
  const value = Number(b.value || 0);
  if (!code || value <= 0) return NextResponse.json({ error: 'Code and value required' }, { status: 400 });

  try {
    await Offer.create({
      code,
      title: String(b.title || ''),
      titleBn: String(b.title_bn || ''),
      type: b.type === 'flat' ? 'flat' : 'percent',
      value,
      minOrder: Number(b.min_order || 0),
      maxDiscount: b.max_discount ? Number(b.max_discount) : null,
      expiresAt: b.expires_at ? new Date(b.expires_at) : null,
      usageLimit: b.usage_limit ? Number(b.usage_limit) : null,
      active: b.active !== false && b.active !== 0,
      showBanner: Boolean(b.show_banner),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
  }
}
