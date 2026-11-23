import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { COOKIE_NAME, hashOtp, isAdminEmail, signAuthToken } from '@/lib/auth';
import { Otp, User } from '@/models';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();

    await connectDB();

    const otp = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });
    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 });
    }
    if (otp.attempts >= 5) {
      return NextResponse.json({ error: 'Too many wrong attempts. Request a new code.' }, { status: 429 });
    }
    if (otp.codeHash !== hashOtp(email, code)) {
      otp.attempts += 1;
      await otp.save();
      return NextResponse.json({ error: 'Incorrect code' }, { status: 400 });
    }

    otp.used = true;
    await otp.save();

    const role = isAdminEmail(email) ? 'admin' : 'customer';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, role });
    } else if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    const res = NextResponse.json({
      ok: true,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        role: user.role,
      },
    });

    res.cookies.set(COOKIE_NAME, signAuthToken(String(user._id)), {
      httpOnly: true,
      sameSite: 'lax',
      secure: (process.env.SITE_URL || '').startsWith('https'),
      maxAge: 14 * 86400,
      path: '/',
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
