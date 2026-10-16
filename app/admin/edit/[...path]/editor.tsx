'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type HistoryEntry = { rev: string; date: string; message: string };

export function Editor({ path }: { path: string }) {
  const router = useRouter();
  const [content, setContent] = useState<string | null>(null);
  const [draft, setDraft] = useState(false);
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/doc?path=${encodeURIComponent(path)}`);
    if (res.ok) {
      const data = await res.json();
      setContent(typeof data.content === 'string' ? data.content : '');
      setDraft(Boolean(data.draft));
      setPublished(Boolean(data.published));
    } else {
      setContent('');
      setDraft(false);
      setPublished(false);
      setMessage('文档不存在：保存草稿即可新建');
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveDraft(silent = false) {
    if (content === null) return false;
    setBusy('保存');
    const res = await fetch('/api/admin/doc', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });
    setBusy('');
    if (res.ok) {
      setDraft(true);
      if (!silent) setMessage('草稿已保存');
      return true;
    }
    setMessage('保存失败');
    return false;
  }

  async function publish() {
    if (!(await saveDraft(true))) return;
    setBusy('发布');
    const res = await fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    setBusy('');
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setDraft(false);
      setPublished(true);
      setMessage('已发布，站点即时可见');
      router.refresh();
    } else {
      setMessage(typeof data.error === 'string' ? data.error : '发布失败');
    }
  }

  async function remove() {
    if (!confirm(`确认删除 ${path}？`)) return;
    setBusy('删除');
    await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    setBusy('');
    router.push('/admin');
    router.refresh();
  }

  async function openHistory() {
    setBusy('读取历史');
    const res = await fetch(`/api/admin/history?path=${encodeURIComponent(path)}`);
    const data = await res.json().catch(() => ({ history: [] }));
    setBusy('');
    setHistory(Array.isArray(data.history) ? data.history : []);
  }

  async function doRevert(rev: string) {
    if (!confirm(`回滚到 ${rev}？当前内容会先进入 git 历史，不会丢。`)) return;
    setBusy('回滚');
    const res = await fetch('/api/admin/revert', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, rev }),
    });
    setBusy('');
    if (res.ok) {
      setMessage(`已回滚到 ${rev}`);
      setHistory(null);
      await load();
    } else {
      setMessage('回滚失败');
    }
  }

  async function upload(file: File) {
    setBusy('上传图片');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (res.ok && typeof data.url === 'string') {
      insertAtCursor(`\n![图片](${data.url})\n`);
      setMessage('图片已上传并插入到光标处');
    } else {
      setMessage(typeof data.error === 'string' ? data.error : '上传失败');
    }
  }

  function insertAtCursor(text: string) {
    const ta = taRef.current;
    if (!ta || content === null) return;
    const start = ta.selectionStart ?? content.length;
    const end = ta.selectionEnd ?? content.length;
    setContent(content.slice(0, start) + text + content.slice(end));
  }

  const noExt = path.replace(/\.(mdx?|md)$/i, '');
  const siteUrl =
    noExt === 'index' ? '/docs' : noExt.endsWith('/index') ? `/docs/${noExt.slice(0, -6)}` : `/docs/${noExt}`;

  if (content === null) return <p className="text-fd-muted-foreground">加载中…</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/admin" className="underline">
          ← 返回列表
        </Link>
        <code className="font-mono text-xs text-fd-muted-foreground">{path}</code>
        <span className="text-xs text-fd-muted-foreground">
          {draft ? '· 有未发布草稿' : published ? '· 已发布' : '· 未发布'}
        </span>
        <span className="flex-1" />
        {published && (
          <a className="underline" href={siteUrl} target="_blank">
            在站点查看
          </a>
        )}
      </div>

      <textarea
        ref={taRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
        className="h-[60vh] w-full rounded-xl border bg-transparent p-4 font-mono text-sm leading-6"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => saveDraft()}
          disabled={!!busy}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60"
        >
          保存草稿
        </button>
        <button
          onClick={publish}
          disabled={!!busy}
          className="rounded-lg bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground disabled:opacity-60"
        >
          发布
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!!busy}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60"
        >
          上传图片
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = '';
          }}
        />
        <button
          onClick={openHistory}
          disabled={!!busy}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60"
        >
          历史版本
        </button>
        <span className="flex-1" />
        <button
          onClick={remove}
          disabled={!!busy}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-60"
        >
          删除
        </button>
      </div>

      <p className="text-sm text-fd-muted-foreground">
        {busy ? `处理中（${busy}）…` : message}
      </p>

      {history && (
        <div className="rounded-xl border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold">历史版本</h2>
            <button className="text-sm underline" onClick={() => setHistory(null)}>
              收起
            </button>
          </div>
          {history.length === 0 && <p className="text-sm text-fd-muted-foreground">暂无历史</p>}
          <ul className="space-y-1 text-sm">
            {history.map((h) => (
              <li key={h.rev} className="flex items-center gap-3">
                <code className="font-mono text-xs">{h.rev}</code>
                <span className="text-fd-muted-foreground">{h.date}</span>
                <span className="flex-1">{h.message}</span>
                <button className="underline" onClick={() => doRevert(h.rev)}>
                  回滚到此版本
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
