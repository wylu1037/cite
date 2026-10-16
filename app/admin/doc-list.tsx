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
  if (noExt.endsWith('/index')) return `/docs/${noExt.slice(0, -'/index'.length)}`;
  return `/docs/${noExt}`;
}

export function DocList({ docs }: { docs: DocEntry[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  async function remove(p: string) {
    if (!confirm(`确认删除 ${p}？（版本历史保留在 Git 中，可随时回滚恢复）`)) return;
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
        stats?: { docs: number; updated: number; skipped: number; deleted: number; chunks: number; errors?: string[] };
      };
      if (json.ok && json.stats) {
        const s = json.stats;
        setMsg(
          `索引重建完成：文档 ${s.docs} 篇（更新 ${s.updated} / 跳过 ${s.skipped} / 清理 ${s.deleted}），切分 ${s.chunks} 个向量分块` +
            (s.errors?.length ? `，失败 ${s.errors.length}：${s.errors[0]}` : ''),
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
        return d.title.toLowerCase().includes(q) || d.path.toLowerCase().includes(q);
      }
      return true;
    });
  }, [docs, filter, search]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#23252a] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8]">文档管理</h1>
            <Badge variant="outline" className="text-[11px] font-mono">
              {docs.length} 篇文档
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[#8a8f98]">
            管理知识库 Markdown/MDX 文档，支持实时编辑、双态草稿发布、Git 历史追溯与向量重建。
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
            <RefreshCw className={`h-3.5 w-3.5 text-[#828fff] ${busy === '__reindex__' ? 'animate-spin' : ''}`} />
            {busy === '__reindex__' ? '重建中…' : '重建向量索引'}
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} title="退出当前登录状态">
            <LogOut className="h-3.5 w-3.5" />
            退出
          </Button>
        </div>
      </div>

      {/* Index Status Message */}
      {msg && (
        <div className="flex items-center gap-2.5 rounded-[8px] border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 p-3 text-xs text-[#d0d6e0]">
          <CheckCircle2 className="h-4 w-4 text-[#828fff] shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#62666d]" />
          <Input
            placeholder="搜索文档标题或路径..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9 bg-[#0f1011]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center rounded-[8px] border border-[#23252a] bg-[#0f1011] p-0.5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-[6px] px-3 py-1 transition-colors ${
              filter === 'all'
                ? 'bg-[#18191a] text-[#f7f8f8] font-medium'
                : 'text-[#8a8f98] hover:text-[#f7f8f8]'
            }`}
          >
            全部 ({counts.all})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`rounded-[6px] px-3 py-1 transition-colors ${
              filter === 'published'
                ? 'bg-[#18191a] text-[#f7f8f8] font-medium'
                : 'text-[#8a8f98] hover:text-[#f7f8f8]'
            }`}
          >
            已发布 ({counts.published})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`rounded-[6px] px-3 py-1 transition-colors ${
              filter === 'draft'
                ? 'bg-[#18191a] text-[#f7f8f8] font-medium'
                : 'text-[#8a8f98] hover:text-[#f7f8f8]'
            }`}
          >
            草稿中 ({counts.draft})
          </button>
        </div>
      </div>

      {/* High-density Table */}
      <div className="overflow-hidden rounded-[12px] border border-[#23252a] bg-[#0f1011] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#d0d6e0]">
            <thead>
              <tr className="border-b border-[#23252a] bg-[#141516]/80 text-[#8a8f98] font-medium">
                <th className="py-2.5 px-4">标题</th>
                <th className="py-2.5 px-4">文件路径</th>
                <th className="py-2.5 px-4">状态</th>
                <th className="py-2.5 px-4">更新时间</th>
                <th className="py-2.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a]/60">
              {filteredDocs.map((d) => (
                <tr
                  key={d.path}
                  className="transition-colors hover:bg-[#141516]/60 group"
                >
                  <td className="py-3 px-4 font-medium text-[#f7f8f8]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#8a8f98] group-hover:text-[#5e6ad2] transition-colors" />
                      <span>{d.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#8a8f98]">
                    {d.path}
                  </td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4 text-[#8a8f98] whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-[#62666d]" />
                      {fmt(d.updatedAt)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/edit/${d.path}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Edit3 className="h-3 w-3 mr-1" />
                          编辑
                        </Button>
                      </Link>
                      {d.published && (
                        <a href={pageUrl(d.path)} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
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
                        <Trash2 className="h-3 w-3 mr-1" />
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8a8f98]">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#141516] border border-[#23252a] mb-2">
                      <AlertCircle className="h-5 w-5 text-[#62666d]" />
                    </div>
                    <p className="text-sm font-medium text-[#d0d6e0]">未找到匹配的文档</p>
                    <p className="text-xs text-[#62666d] mt-1">
                      {search ? '请尝试更换搜索关键字' : '点击右上角「新建文档」创建您的第一篇知识库内容'}
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
