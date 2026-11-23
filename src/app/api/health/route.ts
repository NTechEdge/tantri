import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      ok: true,
      db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database connection failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
