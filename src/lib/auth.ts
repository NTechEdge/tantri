import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { connectDB } from './db';
import { User } from '@/models';
import type { User as UserDTO } from './types';

export const COOKIE_NAME = 'tt';
const SECRET = process.env.JWT_SECRET || 'dev-secret';

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function hashOtp(email: string, code: string): string {
  return crypto
    .createHash('sha256')
    .update(email.trim().toLowerCase() + code + SECRET)
    .digest('hex');
}

export function signAuthToken(userId: string): string {
  return jwt.sign({ id: userId }, SECRET, { expiresIn: '14d' });
}

export async function getAuthUser(): Promise<UserDTO | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET) as { id: string };
    await connectDB();
    const u = await User.findById(decoded.id).lean();
    if (!u) return null;
    return {
      id: String(u._id),
      email: u.email,
      name: u.name || '',
      phone: u.phone || '',
      role: u.role,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<UserDTO | null> {
  const u = await getAuthUser();
  if (!u || u.role !== 'admin') return null;
  return u;
}
