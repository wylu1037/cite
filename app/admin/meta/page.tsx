import { requireAdmin } from '@/lib/admin/server';
import { listMetaDirs } from '@/lib/admin/meta';
import { MetaEditor } from './meta-editor';

export default async function AdminMetaPage() {
  await requireAdmin();
  const dirs = await listMetaDirs();
  return <MetaEditor dirs={dirs} />;
}
