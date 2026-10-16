import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin/server';
import { AdminError, revert } from '@/lib/admin/docs';

export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const rel = typeof body?.path === 'string' ? body.path : '';
  const rev = typeof body?.rev === 'string' ? body.rev : '';
  try {
    return NextResponse.json(await revert(rel, rev));
  } catch (e) {
    return NextResponse.json({ error: e instanceof AdminError ? e.message : '回滚失败' }, { status: 400 });
  }
}
