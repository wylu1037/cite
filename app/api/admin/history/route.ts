import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin/server';
import { AdminError, listHistory } from '@/lib/admin/docs';

export async function GET(request: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  const rel = new URL(request.url).searchParams.get('path') ?? '';
  try {
    return NextResponse.json({ history: await listHistory(rel) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof AdminError ? e.message : '读取历史失败' },
      { status: 400 }
    );
  }
}
