import { requireAdmin } from '@/lib/admin/server';
import { listDocCategories } from '@/lib/admin/meta';
import { NewDocForm } from './form';

export default async function NewDocPage() {
  await requireAdmin();
  const categories = await listDocCategories();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-4 text-2xl font-bold">新建文档</h1>
      <NewDocForm categories={categories} />
    </main>
  );
}
