import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { calcCoupon, getPayments, shippingFor } from '@/lib/store-helpers';
import { Order, Product, User } from '@/models';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });

  await connectDB();
  const orders = await Order.find({ userId: user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(
    orders.map((o) => ({
      id: String(o._id),
      order_no: o.orderNo,
      name: o.name,
      email: o.email,
      phone: o.phone,
      address: o.address,
      district: o.district,
      note: o.note,
      payment_method: o.paymentMethod,
      payment_status: o.paymentStatus,
      status: o.status,
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      total: o.total,
      coupon: o.coupon,
      created_at: o.createdAt,
      items: o.items,
    }))
  );
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });

  try {
    await connectDB();
    const b = await req.json();
    const items = Array.isArray(b.items) ? b.items : [];
    const name = String(b.name || '').trim();
    const phone = String(b.phone || '').trim();
    const address = String(b.address || '').trim();
    const district = String(b.district || '').trim();

    if (!items.length) return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    if (
      name.length < 2 ||
      !/^(\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, '')) ||
      address.length < 8 ||
      !district
    ) {
      return NextResponse.json(
        { error: 'Please fill name, a valid BD mobile number, full address and district' },
        { status: 400 }
      );
    }

    const payments = await getPayments();
    const pmDef = payments.find((p) => p.id === b.payment_method && p.enabled);
    if (!pmDef) return NextResponse.json({ error: 'Choose a valid payment method' }, { status: 400 });

    const lang = b.lang === 'en' ? 'en' : 'bn';
    if (pmDef.id !== 'cod' && String(b.payment_ref || '').trim().length < 6) {
      return NextResponse.json(
        { error: lang === 'en' ? 'Enter your payment Transaction ID (TrxID)' : 'আপনার পেমেন্টের ট্রানজ্যাকশন আইডি (TrxID) দিন' },
        { status: 400 }
      );
    }

    const lines: { productId: unknown; name: string; variant: string; price: number; qty: number; image: string }[] = [];
    let subtotal = 0;

    for (const it of items) {
      const p = await Product.findOne({ _id: it.id, active: true });
      const qty = Math.max(1, Math.min(Number(it.qty || 1), 20));
      if (!p) return NextResponse.json({ error: 'A product in your cart is no longer available' }, { status: 400 });
      if (p.stock < qty) return NextResponse.json({ error: `Only ${p.stock} left of "${p.name}"` }, { status: 400 });

      const unitPrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
      subtotal += unitPrice * qty;
      lines.push({
        productId: p._id,
        name: p.name,
        variant: [it.size && `Size: ${it.size}`, it.color && `Colour: ${it.color}`].filter(Boolean).join(' · '),
        price: unitPrice,
        qty,
        image: p.images[0] || '',
      });
    }

    const cp = await calcCoupon(b.coupon, subtotal);
    if ('error' in cp) return NextResponse.json({ error: cp.error }, { status: 400 });

    const shipping = await shippingFor(district, subtotal - cp.discount);
    const total = subtotal - cp.discount + shipping;
    const orderNo = 'TN' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + crypto.randomInt(1000, 9999);

    const order = await Order.create({
      orderNo,
      userId: user.id,
      name,
      email: user.email,
      phone,
      address,
      district,
      note: String(b.note || '').slice(0, 300),
      paymentMethod: pmDef.id,
      paymentRef: String(b.payment_ref || '').trim(),
      paymentSender: String(b.payment_sender || '').trim().slice(0, 20),
      paymentStatus: pmDef.id === 'cod' ? 'unpaid' : 'pending',
      lang,
      subtotal,
      discount: cp.discount,
      shipping,
      total,
      coupon: cp.offer ? cp.offer.code : null,
      items: lines,
    });

    for (const l of lines) {
      await Product.findByIdAndUpdate(l.productId, { $inc: { stock: -l.qty, sold: l.qty } });
    }
    if (cp.offer) {
      cp.offer.used += 1;
      await cp.offer.save();
    }
    await User.findByIdAndUpdate(user.id, { name, phone });

    return NextResponse.json({ ok: true, id: String(order._id), order_no: order.orderNo, total: order.total });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
