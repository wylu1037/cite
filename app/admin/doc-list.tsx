'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { DocEntry } from '@/lib/admin/docs';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';
import {
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  X,
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [langFilter, setLangFilter] = useState<'all' | 'zh' | 'en'>('all');

  // 支持键盘按 "/" 快捷键聚焦搜索框
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function remove(p: string) {
    if (!confirm(`确认删除 ${p}？（版本历史保留在 Git 中，可随时回滚恢复）`))
      return;
    setBusy(p);
    try {
      await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: p }),
      });
      router.refresh();
    } finally {
      setBusy('');
    }
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
          `向量索引重建完成：已同步 ${s.docs} 篇文档（更新 ${s.updated} / 跳过 ${s.skipped} / 清理 ${s.deleted}），切分 ${s.chunks} 个向量分块` +
            (s.errors?.length
              ? `，警告：${s.errors[0]}`
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
    const zhCount = docs.filter((d) => d.path.startsWith('zh/')).length;
    const enCount = docs.filter((d) => d.path.startsWith('en/')).length;
    const otherCount = docs.length - zhCount - enCount;

    return {
      all: docs.length,
      published: docs.filter((d) => d.published).length,
      draft: docs.filter((d) => d.hasDraft).length,
      zh: zhCount,
      en: enCount,
      other: otherCount,
    };
  }, [docs]);

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      // 状态过滤
      if (filter === 'published' && !d.published) return false;
      if (filter === 'draft' && !d.hasDraft) return false;

      // 语言过滤
      if (langFilter === 'zh' && !d.path.startsWith('zh/')) return false;
      if (langFilter === 'en' && !d.path.startsWith('en/')) return false;

      // 关键字搜索
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) || d.path.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [docs, filter, langFilter, search]);

  const hasActiveFilters = search.trim() !== '' || filter !== 'all' || langFilter !== 'all';

  function resetFilters() {
    setSearch('');
    setFilter('all');
    setLangFilter('all');
  }

  return (
    <div className="space-y-5">
      {/* Index Status Notification */}
      {msg && (
        <div className="flex items-center justify-between rounded-lg border border-linear-primary/30 bg-linear-primary/10 px-3.5 py-2.5 text-xs text-linear-ink-muted shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-linear-primary-hover" />
            <span>{msg}</span>
          </div>
          <button
            onClick={() => setMsg('')}
            className="text-linear-ink-tertiary hover:text-linear-ink"
            aria-label="关闭通知"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Key Metrics Overview Bar: 整洁对齐、纯粹单层边框、去除任何内部嵌套小方框 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Metric 1: Total Docs */}
        <div className="flex flex-col justify-between rounded-xl border border-linear-hairline bg-linear-surface-1/50 p-4 transition-colors hover:bg-linear-surface-1/80">
          <div className="flex items-center justify-between text-linear-ink-tertiary">
            <span className="text-xs font-medium text-linear-ink-tertiary">
              文档总数
            </span>
            <FileText className="h-4 w-4 text-linear-ink-tertiary" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold tracking-tight text-linear-ink">
              {counts.all}
            </span>
            <span className="text-xs text-linear-ink-subtle">
              中文 {counts.zh} · 英文 {counts.en}
            </span>
          </div>
        </div>

        {/* Metric 2: Drafts & Publishing */}
        <div className="flex flex-col justify-between rounded-xl border border-linear-hairline bg-linear-surface-1/50 p-4 transition-colors hover:bg-linear-surface-1/80">
          <div className="flex items-center justify-between text-linear-ink-tertiary">
            <span className="text-xs font-medium text-linear-ink-tertiary">
              草稿与发布
            </span>
            <Layers className="h-4 w-4 text-linear-ink-tertiary" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold tracking-tight text-linear-ink">
              {counts.published}
            </span>
            <span className="text-xs text-linear-ink-subtle">
              {counts.draft > 0 ? (
                <span className="font-medium text-amber-400">
                  {counts.draft} 篇草稿待发布
                </span>
              ) : (
                '全部已同步'
              )}
            </span>
          </div>
        </div>

        {/* Metric 3: Vector Index Engine */}
        <div className="flex flex-col justify-between rounded-xl border border-linear-hairline bg-linear-surface-1/50 p-4 transition-colors hover:bg-linear-surface-1/80">
          <div className="flex items-center justify-between text-linear-ink-tertiary">
            <span className="text-xs font-medium text-linear-ink-tertiary">
              知识库向量引擎
            </span>
            <Sparkles className="h-4 w-4 text-linear-primary-hover" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-lg font-semibold tracking-tight text-linear-ink">
                已就绪
              </span>
            </div>
            <span className="text-xs text-linear-ink-subtle">
              全量语义检索可用
            </span>
          </div>
        </div>
      </div>

      {/* Unified Action & Filter Toolbar: 绝对同高同对齐 (h-8 锁死) */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Left: Search Input & Faceted Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input with "/" shortcut */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-2 left-2.5 h-4 w-4 text-linear-ink-tertiary" />
            <Input
              ref={searchInputRef}
              placeholder="搜索文档标题或文件路径..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 bg-linear-surface-1 pr-9 pl-8 text-xs border-linear-hairline focus:border-linear-primary/40"
            />
            <div className="absolute top-1.5 right-2 pointer-events-none">
              <Kbd>/</Kbd>
            </div>
          </div>

          {/* Language filter pill */}
          <div className="flex h-8 items-center rounded-lg border border-linear-hairline bg-linear-surface-1 p-0.5 text-xs">
            <button
              onClick={() => setLangFilter('all')}
              className={`h-full rounded-md px-2.5 text-xs transition-colors ${
                langFilter === 'all'
                  ? 'bg-linear-surface-3 font-medium text-linear-ink'
                  : 'text-linear-ink-subtle hover:text-linear-ink'
              }`}
            >
              全部语言
            </button>
            <button
              onClick={() => setLangFilter('zh')}
              className={`h-full rounded-md px-2.5 text-xs transition-colors ${
                langFilter === 'zh'
                  ? 'bg-linear-surface-3 font-medium text-linear-ink'
                  : 'text-linear-ink-subtle hover:text-linear-ink'
              }`}
            >
              🇨🇳 中文 ({counts.zh})
            </button>
            <button
              onClick={() => setLangFilter('en')}
              className={`h-full rounded-md px-2.5 text-xs transition-colors ${
                langFilter === 'en'
                  ? 'bg-linear-surface-3 font-medium text-linear-ink'
                  : 'text-linear-ink-subtle hover:text-linear-ink'
              }`}
            >
              🇬🇧 英文 ({counts.en})
            </button>
          </div>

          {/* Status filter pill */}
          <div className="flex h-8 items-center rounded-lg border border-linear-hairline bg-linear-surface-1 p-0.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`h-full rounded-md px-2.5 text-xs transition-colors ${
                filter === 'all'
                  ? 'bg-linear-surface-3 font-medium text-linear-ink'
                  : 'text-linear-ink-subtle hover:text-linear-ink'
              }`}
            >
              全部 ({counts.all})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`h-full rounded-md px-2.5 text-xs transition-colors ${
                filter === 'published'
                  ? 'bg-linear-surface-3 font-medium text-linear-ink'
                  : 'text-linear-ink-subtle hover:text-linear-ink'
              }`}
            >
              已发布 ({counts.published})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`h-full rounded-md px-2.5 text-xs transition-colors ${
                filter === 'draft'
                  ? 'bg-linear-surface-3 font-medium text-linear-ink'
                  : 'text-linear-ink-subtle hover:text-linear-ink'
              }`}
            >
              草稿中 ({counts.draft})
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-linear-ink-tertiary hover:bg-linear-surface-2 hover:text-linear-ink"
            >
              <X className="h-3 w-3" />
              <span>重置筛选</span>
            </button>
          )}
        </div>

        {/* Right: Actions 绝对严格高度一致 (h-8) */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={reindex}
            disabled={busy === '__reindex__'}
            className="h-8 text-xs font-medium"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-linear-primary-hover ${
                busy === '__reindex__' ? 'animate-spin' : ''
              }`}
            />
            <span>{busy === '__reindex__' ? '重建中…' : '重建向量索引'}</span>
          </Button>

          <Link
            href="/admin/new"
            className={cn(
              buttonVariants({ variant: 'primary', size: 'sm' }),
              'h-8 text-xs font-medium'
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>新建文档</span>
          </Link>
        </div>
      </div>

      {/* High-density Workbench Table */}
      <div className="overflow-hidden rounded-xl border border-linear-hairline bg-linear-surface-1 shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-linear-ink-muted">
            <thead>
              <tr className="border-b border-linear-hairline bg-linear-surface-2/70 text-xs font-medium tracking-wider text-linear-ink-tertiary uppercase">
                <th className="px-4 py-3">文档标题</th>
                <th className="px-4 py-3">文件路径</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">最后修改</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linear-hairline/60">
              {filteredDocs.map((d) => (
                <tr
                  key={d.path}
                  className="group transition-colors hover:bg-linear-surface-2/50"
                >
                  {/* Title */}
                  <td className="px-4 py-3.5 font-medium text-linear-ink">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-linear-hairline bg-linear-surface-2 text-linear-ink-subtle transition-colors group-hover:border-linear-primary/40 group-hover:text-linear-primary-hover">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <Link
                        href={`/admin/edit/${d.path}`}
                        className="truncate transition-colors hover:text-linear-primary-hover"
                      >
                        {d.title}
                      </Link>
                    </div>
                  </td>

                  {/* File Path */}
                  <td className="px-4 py-3.5 font-mono text-xs text-linear-ink-subtle">
                    <span className="rounded bg-linear-surface-2 px-1.5 py-0.5 border border-linear-hairline/60">
                      {d.path}
                    </span>
                  </td>

                  {/* Status Indicator Badge */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {d.hasDraft ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        草稿待发布
                      </span>
                    ) : d.published ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        已发布
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-linear-hairline bg-linear-surface-2 px-2 py-0.5 text-xs font-medium text-linear-ink-subtle">
                        <span className="h-1.5 w-1.5 rounded-full bg-linear-ink-tertiary" />
                        未发布
                      </span>
                    )}
                  </td>

                  {/* Update Time */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-linear-ink-subtle">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-linear-ink-tertiary" />
                      {fmt(d.updatedAt)}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/edit/${d.path}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-xs text-linear-ink-subtle hover:text-linear-ink"
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
                            className="h-7 px-2 text-xs text-linear-ink-subtle hover:text-linear-ink"
                            title="在前台页面新窗口预览"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-linear-ink-tertiary transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                        disabled={busy === d.path}
                        onClick={() => remove(d.path)}
                        title="删除文档（支持 Git 追溯）"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filteredDocs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-14 text-center text-linear-ink-subtle"
                  >
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-linear-hairline bg-linear-surface-2 text-linear-ink-tertiary">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-linear-ink">
                      未找到符合条件的文档
                    </p>
                    <p className="mt-1 text-xs text-linear-ink-tertiary">
                      {hasActiveFilters
                        ? '请尝试调整或重置您的搜索与筛选条件'
                        : '知识库中尚无文档，点击上方按钮创建'}
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={resetFilters}
                        className="mt-4 text-xs"
                      >
                        清空筛选条件
                      </Button>
                    )}
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
