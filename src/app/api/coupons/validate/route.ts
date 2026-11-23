import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { calcCoupon } from '@/lib/store-helpers';

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const result = await calcCoupon(body.code, Number(body.subtotal || 0));
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ discount: result.discount, title: result.offer?.title || '' });
}
