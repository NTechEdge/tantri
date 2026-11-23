import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { User } from '@/models';

export async function GET() {
  const user = await getAuthUser();
  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });

  const body = await req.json();
  await connectDB();
  await User.findByIdAndUpdate(user.id, {
    name: String(body.name || '').slice(0, 80),
    phone: String(body.phone || '').slice(0, 20),
  });
  return NextResponse.json({ ok: true });
}
