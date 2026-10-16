import { requireAdmin } from '@/lib/admin/server';
import { Editor } from './editor';

export default async function EditPage(props: PageProps<'/admin/edit/[...path]'>) {
  await requireAdmin();
  const { path: segments } = await props.params;
  const rel = segments.join('/');

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6 lg:p-8">
      <Editor path={rel} />
    </main>
  );
}
