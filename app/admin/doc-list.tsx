'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { DocEntry } from '@/lib/admin/docs';

function fmt(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function pageUrl(p: string) {
  const noExt = p.replace(/\.(mdx?|md)$/i, '');
  if (noExt === 'index') return '/docs';
  if (noExt.endsWith('/index')) return `/docs/${noExt.slice(0, -'/index'.length)}`;
  return `/docs/${noExt}`;
}

export function DocList({ docs }: { docs: DocEntry[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');

  async function remove(p: string) {
    if (!confirm(`确认删除 ${p}？（历史保留在 git，可回滚恢复）`)) return;
    setBusy(p);
    await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: p }),
    });
    setBusy('');
    router.refresh();
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">文档管理</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/new"
            className="rounded-lg bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground"
          >
            新建文档
          </Link>
          <button onClick={logout} className="rounded-lg border px-3 py-1.5 text-sm">
            退出登录
          </button>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-fd-muted-foreground">
            <th className="py-2">标题</th>
            <th>路径</th>
            <th>状态</th>
            <th>更新于</th>
            <th className="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.path} className="border-b">
              <td className="py-2">{d.title}</td>
              <td className="font-mono text-xs">{d.path}</td>
              <td>
                {d.hasDraft ? (
                  <span className="text-amber-600">有草稿</span>
                ) : d.published ? (
                  <span className="text-green-600">已发布</span>
                ) : (
                  <span className="text-fd-muted-foreground">未发布</span>
                )}
              </td>
              <td>{fmt(d.updatedAt)}</td>
              <td className="space-x-2 py-2 text-right">
                <Link className="underline" href={`/admin/edit/${d.path}`}>
                  编辑
                </Link>
                {d.published && (
                  <a className="underline" href={pageUrl(d.path)} target="_blank">
                    查看
                  </a>
                )}
                <button
                  className="text-red-600 underline disabled:opacity-50"
                  disabled={busy === d.path}
                  onClick={() => remove(d.path)}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
          {docs.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-fd-muted-foreground">
                还没有文档，点右上角「新建文档」开始
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
