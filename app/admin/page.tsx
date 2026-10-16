import { requireAdmin } from '@/lib/admin/server';

export default async function AdminHome() {
  const user = await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-8">
      <h1 className="mb-2 text-2xl font-bold">知识库后台</h1>
      <p className="text-sm text-fd-muted-foreground">当前账号：{user}（文档管理页建设中）</p>
    </main>
  );
}
