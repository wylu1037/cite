import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin/server';
import { listDocs } from '@/lib/admin/docs';

export async function GET() {
  if (!(await getAdmin())) return NextResponse.json({ error: '未登录' }, { status: 401 });
  return NextResponse.json({ docs: await listDocs() });
}
