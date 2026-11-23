import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { shapeProduct } from '@/lib/store-helpers';
import { Product } from '@/models';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const prod = await Product.findOne({ slug, active: true }).populate('categoryId', 'name slug').lean();
  if (!prod) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const related = await Product.find({
    active: true,
    categoryId: prod.categoryId,
    _id: { $ne: prod._id },
  })
    .populate('categoryId', 'name slug')
    .limit(4)
    .lean();

  return NextResponse.json({
    ...shapeProduct(prod as never),
    related: related.map((r) => shapeProduct(r as never)),
  });
}
