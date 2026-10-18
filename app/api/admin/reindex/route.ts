import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin/server';
import { reindexAll } from '@/lib/rag/indexer';

export const maxDuration = 300;

export async function POST() {
  if (!(await getAdmin()))
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, stats: await reindexAll() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '重建索引失败' },
      { status: 500 }
    );
  }
}
