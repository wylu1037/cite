'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowLeft,
  Save,
  FolderTree,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

type Entry = { name: string; type: 'page' | 'dir'; title: string };
type MetaData = { dir: string; meta: Record<string, unknown>; entries: Entry[] };

export function MetaEditor({ dirs }: { dirs: string[] }) {
  const [dir, setDir] = useState('');
  const [data, setData] = useState<MetaData | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (d: string) => {
    setData(null);
    const res = await fetch(`/api/admin/meta?dir=${encodeURIComponent(d)}`);
    const json = (await res.json()) as MetaData;
    setData(json);
    setPages(Array.isArray(json.meta.pages) ? (json.meta.pages as string[]) : []);
    setTitle(typeof json.meta.title === 'string' ? json.meta.title : '');
    setIcon(typeof json.meta.icon === 'string' ? json.meta.icon : '');
  }, []);

  useEffect(() => {
    void load(dir);
  }, [dir, load]);

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= pages.length) return;
    const next = pages.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setPages(next);
  }

  function removeAt(i: number) {
    setPages(pages.filter((_, k) => k !== i));
  }

  function add(name: string) {
    if (!pages.includes(name)) setPages([...pages, name]);
  }

  async function save() {
    setBusy(true);
    setMsg('');
    const meta: Record<string, unknown> = { ...(data?.meta ?? {}), pages };
    if (title) meta.title = title;
    else delete meta.title;
    if (icon) meta.icon = icon;
    else delete meta.icon;
    const res = await fetch('/api/admin/meta', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dir, meta }),
    });
    setBusy(false);
    if (res.ok) {
      setMsg('已保存侧栏配置，前台站点即时生效');
      void load(dir);
    } else {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setMsg(`保存失败：${json.error ?? res.status}`);
    }
  }

  const titleOf = (name: string) => data?.entries.find((e) => e.name === name)?.title;
  const unlisted = (data?.entries ?? []).filter((e) => !pages.includes(e.name));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#23252a] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8]">侧栏与目录配置</h1>
            <Badge variant="outline" className="text-xs">meta.json</Badge>
          </div>
          <p className="mt-1 text-xs text-[#8a8f98]">
            配置前台文档侧栏的显示名称、Lucide 图标以及文章排列顺序。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              返回文档列表
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={save}
            disabled={busy || !data}
            className="h-8"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {busy ? '保存中…' : '保存配置'}
          </Button>
        </div>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-[8px] border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 p-3 text-xs text-[#d0d6e0]">
          <CheckCircle2 className="h-4 w-4 text-[#828fff] shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Directory Selector Card */}
      <Card className="border-[#23252a] bg-[#0f1011]">
        <CardContent className="p-4 space-y-2">
          <label className="text-xs font-medium text-[#d0d6e0] flex items-center gap-1.5">
            <FolderTree className="h-3.5 w-3.5 text-[#5e6ad2]" />
            选择要配置的板块目录
          </label>
          <select
            value={dir}
            onChange={(e) => setDir(e.target.value)}
            className="w-full rounded-[8px] border border-[#23252a] bg-[#141516] px-3 py-2 text-xs text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
          >
            {dirs.map((d) => (
              <option key={d} value={d}>
                {d ? `📁 ${d}` : '🏠 根目录（content/docs/meta.json）'}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Form Details Card */}
      <Card className="border-[#23252a] bg-[#0f1011]">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-[#f7f8f8]">目录元属性</CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">
            设置此目录在前台侧栏显示的展示标题与图标
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#d0d6e0]">展示标题</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：快速上手、部署运维"
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#d0d6e0]">
                Lucide 图标名（选填）
              </label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="例如：Rocket, BookOpen, Code, Server"
                className="text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages Ordering Card */}
      <Card className="border-[#23252a] bg-[#0f1011]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#f7f8f8]">
                <Layers className="h-4 w-4 text-[#5e6ad2]" />
                侧栏文章排序（已列出 {pages.length} 项）
              </CardTitle>
              <CardDescription className="text-xs text-[#8a8f98]">
                按自上而下的顺序显示，可使用箭头调整顺序或从侧栏隐藏
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pages.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-[#23252a] p-6 text-center text-xs text-[#8a8f98]">
              暂未指定显示顺序（未配置时默认按文件名排序）
            </div>
          ) : (
            <div className="divide-y divide-[#23252a]/60 rounded-[8px] border border-[#23252a] bg-[#141516]/60">
              {pages.map((p, i) => (
                <div
                  key={p}
                  className="flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-[#141516]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] text-[#62666d] w-5">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-medium text-[#f7f8f8]">
                      {titleOf(p) ?? p}
                    </span>
                    <span className="font-mono text-[10px] text-[#8a8f98]">
                      ({p})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      title="上移"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(i, 1)}
                      disabled={i === pages.length - 1}
                      title="下移"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-[#8a8f98] hover:text-[#ff6b6b]"
                      onClick={() => removeAt(i)}
                      title="从侧栏移除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unlisted documents to add */}
          {unlisted.length > 0 && (
            <div className="pt-2">
              <label className="text-xs font-medium text-[#8a8f98] block mb-2">
                可添加到侧栏的文章或子目录：
              </label>
              <div className="flex flex-wrap gap-2">
                {unlisted.map((e) => (
                  <button
                    key={e.name}
                    type="button"
                    onClick={() => add(e.name)}
                    className="flex items-center gap-1 rounded-[6px] border border-[#23252a] bg-[#141516] px-2.5 py-1 text-xs text-[#d0d6e0] hover:border-[#5e6ad2] hover:text-[#f7f8f8] transition-colors"
                  >
                    <Plus className="h-3 w-3 text-[#5e6ad2]" />
                    <span>{e.title || e.name}</span>
                    <span className="font-mono text-[10px] text-[#62666d]">
                      ({e.name})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
