import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL,
  adminUserName,
  createSessionToken,
  verifyAdminPassword,
} from '@/lib/admin/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const user = typeof body?.user === 'string' ? body.user : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (user !== adminUserName() || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: '账号或密码不正确' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_TTL,
  });
  return res;
}
