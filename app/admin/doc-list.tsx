'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import type { DocEntry } from '@/lib/admin/docs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import {
  Plus,
  RefreshCw,
  LogOut,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

function fmt(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function pageUrl(p: string) {
  const noExt = p.replace(/\.(mdx?|md)$/i, '');
  if (noExt === 'index') return '/docs';
  if (noExt.endsWith('/index'))
    return `/docs/${noExt.slice(0, -'/index'.length)}`;
  return `/docs/${noExt}`;
}

export function DocList({ docs }: { docs: DocEntry[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  async function remove(p: string) {
    if (!confirm(`确认删除 ${p}？（版本历史保留在 Git 中，可随时回滚恢复）`))
      return;
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

  async function reindex() {
    setBusy('__reindex__');
    setMsg('');
    try {
      const res = await fetch('/api/admin/reindex', { method: 'POST' });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        stats?: {
          docs: number;
          updated: number;
          skipped: number;
          deleted: number;
          chunks: number;
          errors?: string[];
        };
      };
      if (json.ok && json.stats) {
        const s = json.stats;
        setMsg(
          `索引重建完成：文档 ${s.docs} 篇（更新 ${s.updated} / 跳过 ${s.skipped} / 清理 ${s.deleted}），切分 ${s.chunks} 个向量分块` +
            (s.errors?.length
              ? `，失败 ${s.errors.length}：${s.errors[0]}`
              : '')
        );
      } else {
        setMsg(`索引失败：${json.error ?? '未知错误'}`);
      }
    } catch {
      setMsg('索引失败：网络连接异常');
    } finally {
      setBusy('');
    }
  }

  const counts = useMemo(() => {
    return {
      all: docs.length,
      published: docs.filter((d) => d.published).length,
      draft: docs.filter((d) => d.hasDraft).length,
    };
  }, [docs]);

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      if (filter === 'published' && !d.published) return false;
      if (filter === 'draft' && !d.hasDraft) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) || d.path.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [docs, filter, search]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col gap-4 border-b border-linear-hairline pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-linear-ink">
              文档管理
            </h1>
            <Badge variant="outline" className="font-mono text-[11px]">
              {docs.length} 篇文档
            </Badge>
          </div>
          <p className="mt-1 text-xs text-linear-ink-subtle">
            管理知识库 Markdown/MDX 文档，支持实时编辑、双态草稿发布、Git
            历史追溯与向量重建。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/new">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" />
              新建文档
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={reindex}
            disabled={busy === '__reindex__'}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-linear-primary-hover ${busy === '__reindex__' ? 'animate-spin' : ''}`}
            />
            {busy === '__reindex__' ? '重建中…' : '重建向量索引'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="退出当前登录状态"
          >
            <LogOut className="h-3.5 w-3.5" />
            退出
          </Button>
        </div>
      </div>

      {/* Index Status Message */}
      {msg && (
        <div className="flex items-center gap-2.5 rounded-[8px] border border-linear-primary/30 bg-linear-primary/10 p-3 text-xs text-linear-ink-muted">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-linear-primary-hover" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-linear-ink-tertiary" />
          <Input
            placeholder="搜索文档标题或路径..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-linear-surface-1 pl-8 text-xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center rounded-[8px] border border-linear-hairline bg-linear-surface-1 p-0.5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-[6px] px-3 py-1 transition-colors ${
              filter === 'all'
                ? 'bg-linear-surface-3 font-medium text-linear-ink'
                : 'text-linear-ink-subtle hover:text-linear-ink'
            }`}
          >
            全部 ({counts.all})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`rounded-[6px] px-3 py-1 transition-colors ${
              filter === 'published'
                ? 'bg-linear-surface-3 font-medium text-linear-ink'
                : 'text-linear-ink-subtle hover:text-linear-ink'
            }`}
          >
            已发布 ({counts.published})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`rounded-[6px] px-3 py-1 transition-colors ${
              filter === 'draft'
                ? 'bg-linear-surface-3 font-medium text-linear-ink'
                : 'text-linear-ink-subtle hover:text-linear-ink'
            }`}
          >
            草稿中 ({counts.draft})
          </button>
        </div>
      </div>

      {/* High-density Table */}
      <div className="overflow-hidden rounded-[12px] border border-linear-hairline bg-linear-surface-1 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-linear-ink-muted">
            <thead>
              <tr className="border-b border-linear-hairline bg-linear-surface-2/80 font-medium text-linear-ink-subtle">
                <th className="px-4 py-2.5">标题</th>
                <th className="px-4 py-2.5">文件路径</th>
                <th className="px-4 py-2.5">状态</th>
                <th className="px-4 py-2.5">更新时间</th>
                <th className="px-4 py-2.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linear-hairline/60">
              {filteredDocs.map((d) => (
                <tr
                  key={d.path}
                  className="group transition-colors hover:bg-linear-surface-2/60"
                >
                  <td className="px-4 py-3 font-medium text-linear-ink">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-linear-ink-subtle transition-colors group-hover:text-linear-primary" />
                      <span>{d.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-linear-ink-subtle">
                    {d.path}
                  </td>
                  <td className="px-4 py-3">
                    {d.hasDraft ? (
                      <Badge variant="warning" size="sm">
                        草稿待发布
                      </Badge>
                    ) : d.published ? (
                      <Badge variant="success" size="sm">
                        已发布
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm">
                        未发布
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-linear-ink-subtle">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-linear-ink-tertiary" />
                      {fmt(d.updatedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/edit/${d.path}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                        >
                          <Edit3 className="mr-1 h-3 w-3" />
                          编辑
                        </Button>
                      </Link>
                      {d.published && (
                        <a
                          href={pageUrl(d.path)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            预览
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={busy === d.path}
                        onClick={() => remove(d.path)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-linear-ink-subtle"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-linear-hairline bg-linear-surface-2">
                      <AlertCircle className="h-5 w-5 text-linear-ink-tertiary" />
                    </div>
                    <p className="text-sm font-medium text-linear-ink-muted">
                      未找到匹配的文档
                    </p>
                    <p className="mt-1 text-xs text-linear-ink-tertiary">
                      {search
                        ? '请尝试更换搜索关键字'
                        : '点击右上角「新建文档」创建您的第一篇知识库内容'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
