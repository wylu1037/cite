'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

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
      setMsg('已保存，站点侧栏即时生效');
      void load(dir);
    } else {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setMsg(`保存失败：${json.error ?? res.status}`);
    }
  }

  const titleOf = (name: string) => data?.entries.find((e) => e.name === name)?.title;
  const unlisted = (data?.entries ?? []).filter((e) => !pages.includes(e.name));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">侧栏配置</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="rounded-lg border px-3 py-1.5 text-sm">
            返回文档管理
          </Link>
          <button
            onClick={save}
            disabled={busy || !data}
            className="rounded-lg bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground disabled:opacity-50"
          >
            {busy ? '保存中…' : '保存'}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">目录</label>
        <select
          value={dir}
          onChange={(e) => setDir(e.target.value)}
          className="w-full rounded-lg border p-2 text-sm"
        >
          {dirs.map((d) => (
            <option key={d} value={d}>
              {d || '根目录'}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">标题（留空用默认）</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border p-2 text-sm"
            placeholder="如：快速上手"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">图标（lucide 名称，留空无）</label>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full rounded-lg border p-2 text-sm"
            placeholder="如：Rocket"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">侧栏顺序（列出的按序在前）</h2>
        <ul className="divide-y rounded-lg border">
          {pages.map((p, i) => (
            <li key={`${p}-${i}`} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="flex-1">
                {titleOf(p) ?? '（已不存在）'}{' '}
                <span className="text-fd-muted-foreground">{p}</span>
              </span>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded border px-2 disabled:opacity-30">
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === pages.length - 1}
                className="rounded border px-2 disabled:opacity-30"
              >
                ↓
              </button>
              <button onClick={() => removeAt(i)} className="rounded border px-2">
                ✕
              </button>
            </li>
          ))}
          {pages.length === 0 && (
            <li className="px-3 py-2 text-sm text-fd-muted-foreground">未配置，全部按默认顺序展示</li>
          )}
        </ul>
      </div>

      {unlisted.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold">未加入的条目（默认排在列表之后）</h2>
          <ul className="divide-y rounded-lg border">
            {unlisted.map((e) => (
              <li key={e.name} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span className="flex-1">
                  {e.title} <span className="text-fd-muted-foreground">{e.name}{e.type === 'dir' ? '/' : ''}</span>
                </span>
                <button onClick={() => add(e.name)} className="rounded border px-2">
                  加入
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {msg && <p className="text-sm">{msg}</p>}
      <p className="text-xs text-fd-muted-foreground">
        保存后写入该目录的 meta.json（自动提交 git），站点侧栏即时生效。
      </p>
    </div>
  );
}
