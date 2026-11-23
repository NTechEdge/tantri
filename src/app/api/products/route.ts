import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { shapeProduct } from '@/lib/store-helpers';
import { Category, Product } from '@/models';

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';
  const featured = searchParams.get('featured');
  const limit = Math.min(Number(searchParams.get('limit') || 60), 100);

  const filter: Record<string, unknown> = { active: true };
  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (!cat) return NextResponse.json([]);
    filter.categoryId = cat._id;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { nameBn: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  if (featured === '1' || featured === 'true') filter.featured = true;

  let rows = await Product.find(filter).populate('categoryId', 'name slug').limit(limit).lean();

  if (sort === 'popular') {
    rows = rows.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  } else if (sort === 'price_asc') {
    rows = rows.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (sort === 'price_desc') {
    rows = rows.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  } else {
    rows = rows.sort((a, b) => String(b._id).localeCompare(String(a._id)));
  }

  return NextResponse.json(rows.map((p) => shapeProduct(p as never)));
}
