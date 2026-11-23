import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { shapeProduct } from '@/lib/store-helpers';
import { Product } from '@/models';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const rows = await Product.find().populate('categoryId', 'name slug').sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows.map((p) => shapeProduct(p as never)));
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await connectDB();
  const b = await req.json();
  if (!b.name || Number(b.price) <= 0) {
    return NextResponse.json({ error: 'Name and valid price required' }, { status: 400 });
  }

  let slug = slugify(b.name);
  if (await Product.exists({ slug })) slug += '-' + Date.now().toString(36);

  const created = await Product.create({
    slug,
    name: String(b.name),
    nameBn: String(b.name_bn || ''),
    categoryId: b.category_id,
    description: String(b.description || ''),
    descriptionBn: String(b.description_bn || ''),
    price: Number(b.price),
    salePrice: b.sale_price ? Number(b.sale_price) : null,
    stock: Number(b.stock || 0),
    sku: String(b.sku || 'TN-' + Date.now().toString().slice(-5)),
    images: Array.isArray(b.images) ? b.images : [],
    sizes: Array.isArray(b.sizes) ? b.sizes : [],
    colors: Array.isArray(b.colors) ? b.colors : [],
    material: String(b.material || ''),
    origin: String(b.origin || 'Made in Bangladesh'),
    featured: Boolean(b.featured),
    active: b.active !== false && b.active !== 0,
  });

  return NextResponse.json({ ok: true, id: String(created._id) });
}
