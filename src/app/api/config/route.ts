import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getPayments, getSetting } from '@/lib/store-helpers';

export async function GET() {
  await connectDB();
  const [shippingDhaka, shippingOutside, freeOver, phone, allPayments] = await Promise.all([
    getSetting('shipping_dhaka', '70'),
    getSetting('shipping_outside', '130'),
    getSetting('free_over', '3000'),
    getSetting('phone', '+880 1XXX-XXXXXX'),
    getPayments(),
  ]);

  const payments = allPayments.filter(
    (p) => p.enabled && (p.id === 'cod' || (p.id === 'bangla_qr' ? p.qr : p.number || p.qr))
  );

  return NextResponse.json({
    shipping_dhaka: Number(shippingDhaka),
    shipping_outside: Number(shippingOutside),
    free_shipping_over: Number(freeOver),
    support_phone: String(phone),
    payments,
  });
}
