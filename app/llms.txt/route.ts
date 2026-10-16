import { docsLlms } from '@/lib/source';

// 内容以卷为准（免重建发布）：禁用构建期缓存
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(await docsLlms.index());
}
