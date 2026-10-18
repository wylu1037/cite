import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin/server';
import { saveMedia } from '@/lib/admin/docs';

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File))
    return NextResponse.json({ error: '缺少文件' }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: '文件超过 10MB' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const name = await saveMedia(file.name, buf);
  return NextResponse.json({ ok: true, url: `/api/media/${name}` });
}
