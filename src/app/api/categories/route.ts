import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category, Product } from '@/models';

export async function GET() {
  await connectDB();
  const cats = await Category.find().lean();
  const counts = await Product.aggregate([
    { $match: { active: true } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), Number(c.count)]));

  return NextResponse.json(
    cats.map((c) => ({
      id: String(c._id),
      slug: c.slug,
      name: c.name,
      name_bn: c.nameBn || '',
      description: c.description || '',
      image: c.image || '',
      count: countMap.get(String(c._id)) || 0,
    }))
  );
}
