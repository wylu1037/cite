'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function NewDocForm() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    let path = slug.trim().replace(/^\/+/, '');
    if (!path) return;
    if (!/\.(md|mdx)$/i.test(path)) path += '.mdx';
    const t = title.trim() || '未命名文档';
    const content = `---\ntitle: ${t}\ndescription: \n---\n\n# ${t}\n`;

    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/doc', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(`/admin/edit/${path}`);
    } else {
      setError(typeof data.error === 'string' ? data.error : '创建失败');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border p-6">
      <label className="block space-y-1">
        <span className="text-sm">文件路径（用 / 分板块，如 getting-started/install.mdx）</span>
        <input
          className="w-full rounded-lg border bg-transparent px-3 py-2 font-mono text-sm"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="getting-started/install.mdx"
          required
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm">标题</span>
        <input
          className="w-full rounded-lg border bg-transparent px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="安装指南"
        />
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-fd-muted-foreground">
        创建后进入编辑页；先「保存草稿」再「发布」，发布后站点即时可见。
      </p>
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-60"
      >
        {busy ? '创建中…' : '创建并编辑'}
      </button>
    </form>
  );
}
