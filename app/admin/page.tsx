import { requireAdmin } from '@/lib/admin/server';
import { listDocs } from '@/lib/admin/docs';
import { DocList } from './doc-list';

export default async function AdminHome() {
  await requireAdmin();
  const docs = await listDocs();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <DocList docs={docs} />
    </main>
  );
}
