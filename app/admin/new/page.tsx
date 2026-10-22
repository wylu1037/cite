import { requireAdmin } from '@/lib/admin/server';
import { listDocCategories } from '@/lib/admin/meta';
import { NewDocForm } from './form';

export default async function NewDocPage() {
  await requireAdmin();
  const categories = await listDocCategories();

  return (
    <div className="w-full flex-1 p-6 lg:p-8">
      <NewDocForm categories={categories} />
    </div>
  );
}
