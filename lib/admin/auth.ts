import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'kb_admin';
export const ADMIN_SESSION_TTL = 7 * 24 * 3600; // 秒

function sessionSecret(): string {
  return process.env.SESSION_SECRET || 'insecure-dev-secret';
}

export function adminUserName(): string {
  return process.env.ADMIN_USER || 'admin';
}

export function verifyAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL;
  const payload = `${adminUserName()}.${exp}`;
  const sig = createHmac('sha256', sessionSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [user, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
  const expected = createHmac('sha256', sessionSecret()).update(`${user}.${exp}`).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return user;
}
