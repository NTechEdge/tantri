import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { hashOtp } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/mailer';
import { Otp } from '@/models';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    await connectDB();

    const last = await Otp.findOne({ email }).sort({ createdAt: -1 }).lean();
    if (last?.createdAt && Date.now() - new Date(last.createdAt).getTime() < 45_000) {
      return NextResponse.json(
        { error: 'Please wait 45 seconds before requesting another code' },
        { status: 429 }
      );
    }

    const hourly = await Otp.countDocuments({
      email,
      createdAt: { $gt: new Date(Date.now() - 3_600_000) },
    });
    if (hourly >= 6) {
      return NextResponse.json({ error: 'Too many codes requested. Try again later.' }, { status: 429 });
    }

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    await Otp.create({
      email,
      codeHash: hashOtp(email, code),
      expiresAt: new Date(Date.now() + 10 * 60_000),
    });

    await sendOtpEmail(email, code, body.lang === 'en' ? 'en' : 'bn');
    return NextResponse.json({ ok: true, message: `Code sent to ${email}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
