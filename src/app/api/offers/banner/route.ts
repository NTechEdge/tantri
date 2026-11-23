import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Offer } from '@/models';

export async function GET() {
  await connectDB();
  const now = new Date();
  const offers = await Offer.find({
    active: true,
    showBanner: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }],
  }).lean();

  return NextResponse.json(
    offers.map((o) => ({
      code: o.code,
      title: o.title || '',
      title_bn: o.titleBn || '',
      type: o.type,
      value: o.value,
      min_order: o.minOrder,
    }))
  );
}
