import { requireAdmin } from '@/lib/admin/server';
import { listDocs } from '@/lib/admin/docs';
import { DocList } from './doc-list';

export default async function AdminHome() {
  await requireAdmin();
  const docs = await listDocs();

  return (
    <div className="w-full flex-1 p-6 lg:p-8">
      <DocList docs={docs} />
    </div>
  );
}
