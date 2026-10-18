import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin/server';
import { AdminError, readDoc, saveDraft } from '@/lib/admin/docs';

export async function GET(request: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  const rel = new URL(request.url).searchParams.get('path') ?? '';
  try {
    return NextResponse.json(await readDoc(rel));
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
  const body = await request.json().catch(() => null);
  const rel = typeof body?.path === 'string' ? body.path : '';
  if (typeof body?.content !== 'string') {
    return NextResponse.json({ error: '缺少内容' }, { status: 400 });
  }
  try {
    return NextResponse.json(await saveDraft(rel, body.content));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof AdminError ? e.message : '保存失败' },
      { status: 400 }
    );
  }
}
