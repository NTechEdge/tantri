import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Order, Product } from '@/models';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { id } = await params;
  await connectDB();
  const b = await req.json();
  await Product.findByIdAndUpdate(id, {
    name: String(b.name),
    nameBn: String(b.name_bn || ''),
    categoryId: b.category_id,
    description: String(b.description || ''),
    descriptionBn: String(b.description_bn || ''),
    price: Number(b.price),
    salePrice: b.sale_price ? Number(b.sale_price) : null,
    stock: Number(b.stock || 0),
    sku: String(b.sku || ''),
    images: Array.isArray(b.images) ? b.images : [],
    sizes: Array.isArray(b.sizes) ? b.sizes : [],
    colors: Array.isArray(b.colors) ? b.colors : [],
    material: String(b.material || ''),
    origin: String(b.origin || 'Made in Bangladesh'),
    featured: Boolean(b.featured),
    active: b.active !== false && b.active !== 0,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { id } = await params;
  await connectDB();
  const hasOrders = await Order.exists({ 'items.productId': id });
  if (hasOrders) {
    await Product.findByIdAndUpdate(id, { active: false });
    return NextResponse.json({ ok: true, archived: true });
  }
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
