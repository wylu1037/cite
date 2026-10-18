import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin/server';
import { AdminError } from '@/lib/admin/docs';
import { readMeta, saveMeta } from '@/lib/admin/meta';

export async function GET(request: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  const dir = new URL(request.url).searchParams.get('dir') ?? '';
  try {
    return NextResponse.json(await readMeta(dir));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof AdminError ? e.message : '读取失败' },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    dir?: unknown;
    meta?: unknown;
  } | null;
  if (!body || typeof body.dir !== 'string') {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }
  try {
    return NextResponse.json(await saveMeta(body.dir, body.meta));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof AdminError ? e.message : '保存失败' },
      { status: 400 }
    );
  }
}
