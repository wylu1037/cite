'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownSelect } from '@/components/ui/dropdown-select';
import { IconSelect } from '@/components/ui/icon-select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Save,
  FolderTree,
  Folder,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

type Entry = { name: string; type: 'page' | 'dir'; title: string };
type MetaData = {
  dir: string;
  meta: Record<string, unknown>;
  entries: Entry[];
};

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
    setPages(
      Array.isArray(json.meta.pages) ? (json.meta.pages as string[]) : []
    );
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

  const titleOf = (name: string) =>
    data?.entries.find((e) => e.name === name)?.title;
  const unlisted = (data?.entries ?? []).filter((e) => !pages.includes(e.name));

  return (
    <div className="w-full flex-1 space-y-5 p-6 lg:p-8">
      {/* Top Scope & Action Toolbar (无重复标题与多余分割线，直奔操作) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Directory / Module Scope Selector */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-linear-hairline bg-linear-surface-1 text-linear-primary-hover">
            <FolderTree className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <DropdownSelect
              value={dir}
              onChange={setDir}
              options={dirs.map((d) => ({
                value: d,
                label: d ? d : '根目录（content/docs/meta.json）',
                icon: d ? (
                  <Folder className="h-3.5 w-3.5 text-linear-primary-hover" />
                ) : (
                  <FolderTree className="h-3.5 w-3.5 text-linear-primary-hover" />
                ),
              }))}
              triggerClassName="h-8 min-w-56"
            />
            <span className="font-mono text-xs text-linear-ink-tertiary">
              meta.json
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={save}
            disabled={busy || !data}
            className="h-8 text-xs font-medium"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {busy ? '保存中…' : '保存配置'}
          </Button>
        </div>
      </div>

      {/* Status Feedback Notification */}
      {msg && (
        <div className="flex items-center gap-2 rounded-lg border border-linear-primary/30 bg-linear-primary/10 p-3 text-xs text-linear-ink-muted">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-linear-primary-hover" />
          <span>{msg}</span>
        </div>
      )}

      {/* Responsive Grid Layout: Left Properties, Right Ordering */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Scope Properties & Guidance (5 cols on xl) */}
        <div className="space-y-6 xl:col-span-5">
          {/* Form Details Card */}
          <Card className="border-linear-hairline bg-linear-surface-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-linear-ink">
                目录元属性
              </CardTitle>
              <CardDescription className="text-xs text-linear-ink-subtle">
                设置当前板块在前台侧栏显示的展示标题与图标
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-linear-ink-muted">
                  展示标题
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：快速上手、部署运维"
                  className="text-xs bg-linear-surface-2 border-linear-hairline"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-medium text-linear-ink-muted">
                  <span>Lucide 侧栏图标</span>
                  <span className="text-xs text-linear-ink-tertiary">
                    点击预览并下拉选择
                  </span>
                </label>
                <IconSelect
                  value={icon}
                  onChange={setIcon}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <div className="rounded-xl border border-linear-hairline bg-linear-surface-1/40 p-4 text-xs text-linear-ink-subtle space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-linear-ink">
              <Sparkles className="h-3.5 w-3.5 text-linear-primary-hover" />
              <span>配置提示</span>
            </div>
            <p>
              修改展示标题和图标后，点击右上角「保存配置」即可即时在前台侧栏生效，无需重启开发服务。
            </p>
          </div>
        </div>

        {/* Right Column: Pages Ordering Card (7 cols on xl) */}
        <div className="space-y-6 xl:col-span-7">
          <Card className="border-linear-hairline bg-linear-surface-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-linear-ink">
                    <Layers className="h-4 w-4 text-linear-primary" />
                    侧栏文章排序（已列出 {pages.length} 项）
                  </CardTitle>
                  <CardDescription className="text-xs text-linear-ink-subtle">
                    按自上而下的顺序显示，可使用箭头调整顺序或从侧栏隐藏
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-linear-hairline p-8 text-center text-xs text-linear-ink-subtle">
                  暂未指定显示顺序（未配置时默认按文件名排序）
                </div>
              ) : (
                <div className="divide-y divide-linear-hairline/60 rounded-lg border border-linear-hairline bg-linear-surface-2/60">
                  {pages.map((p, i) => (
                    <div
                      key={p}
                      className="flex items-center justify-between px-3 py-2.5 text-xs transition-colors hover:bg-linear-surface-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 font-mono text-xs text-linear-ink-tertiary">
                          {(i + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="truncate font-medium text-linear-ink">
                          {titleOf(p) ?? p}
                        </span>
                        <span className="font-mono text-xs text-linear-ink-subtle">
                          ({p})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
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
                          className="text-linear-ink-subtle hover:text-[#ff6b6b]"
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
                  <label className="mb-2 block text-xs font-medium text-linear-ink-subtle">
                    可添加到侧栏的文章或子目录：
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {unlisted.map((e) => (
                      <button
                        key={e.name}
                        type="button"
                        onClick={() => add(e.name)}
                        className="flex items-center gap-1.5 rounded-md border border-linear-hairline bg-linear-surface-2 px-2.5 py-1 text-xs text-linear-ink-muted transition-colors hover:border-linear-primary hover:text-linear-ink"
                      >
                        <Plus className="h-3 w-3 text-linear-primary" />
                        <span>{e.title || e.name}</span>
                        <span className="font-mono text-xs text-linear-ink-tertiary">
                          ({e.name})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
