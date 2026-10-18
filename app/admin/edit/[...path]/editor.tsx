'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Send,
  Image as ImageIcon,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  GitCommit,
  RotateCcw,
  X,
  FileCode,
} from 'lucide-react';

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
      setMessage('已成功发布到前台知识库，即时生效');
      router.refresh();
    } else {
      setMessage(typeof data.error === 'string' ? data.error : '发布失败');
    }
  }

  async function remove() {
    if (!confirm(`确认删除 ${path}？（历史保留在 Git 中，可随时回滚）`)) return;
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
    const res = await fetch(
      `/api/admin/history?path=${encodeURIComponent(path)}`
    );
    const data = await res.json().catch(() => ({ history: [] }));
    setBusy('');
    setHistory(Array.isArray(data.history) ? data.history : []);
  }

  async function doRevert(rev: string) {
    if (!confirm(`回滚到 ${rev}？当前内容会自动提交一次 Git 历史，不会丢失。`))
      return;
    setBusy('回滚');
    const res = await fetch('/api/admin/revert', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, rev }),
    });
    setBusy('');
    if (res.ok) {
      setMessage(`已成功回滚到版本 ${rev}`);
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
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: form,
    });
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
    noExt === 'index'
      ? '/docs'
      : noExt.endsWith('/index')
        ? `/docs/${noExt.slice(0, -6)}`
        : `/docs/${noExt}`;

  if (content === null) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-linear-ink-subtle">
        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-linear-primary border-t-transparent" />
        加载文档中…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linear-hairline pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-[6px] border border-linear-hairline bg-linear-surface-2 px-2 py-0.5 font-mono text-xs text-linear-ink">
              {path}
            </span>
            {draft ? (
              <Badge variant="warning" size="sm">
                有未发布草稿
              </Badge>
            ) : published ? (
              <Badge variant="success" size="sm">
                已发布
              </Badge>
            ) : (
              <Badge variant="outline" size="sm">
                未发布草稿
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {published && (
            <a href={siteUrl} target="_blank" rel="noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-linear-ink-subtle hover:text-linear-ink"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                前台查看
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Editor Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-linear-hairline bg-linear-surface-1 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => saveDraft()}
            disabled={!!busy}
          >
            <Save className="h-3.5 w-3.5" />
            保存草稿
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={publish}
            disabled={!!busy}
          >
            <Send className="h-3.5 w-3.5" />
            发布上线
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={!!busy}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            插入图片
          </Button>
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

          <Button
            variant="secondary"
            size="sm"
            onClick={openHistory}
            disabled={!!busy}
          >
            <History className="h-3.5 w-3.5 text-linear-primary-hover" />
            版本历史
          </Button>
        </div>

        <div>
          <Button
            variant="destructive"
            size="sm"
            onClick={remove}
            disabled={!!busy}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            删除
          </Button>
        </div>
      </div>

      {/* Status Tip */}
      {message && (
        <div className="flex items-center gap-2 rounded-[6px] border border-linear-hairline bg-linear-surface-2 p-2.5 text-xs text-linear-ink-muted">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-linear-primary-hover" />
          <span>{busy ? `正在执行：${busy}…` : message}</span>
        </div>
      )}

      {/* Editor Textarea */}
      <div className="overflow-hidden rounded-[12px] border border-linear-hairline bg-linear-surface-1 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-linear-hairline bg-linear-surface-2/60 px-4 py-2 text-xs text-linear-ink-subtle">
          <span className="flex items-center gap-1.5 font-medium">
            <FileCode className="h-3.5 w-3.5 text-linear-primary" />
            Markdown / MDX 源码编辑
          </span>
          <span className="text-[11px] text-linear-ink-tertiary">
            支持 GitHub Flavored Markdown 与 MDX 扩展语法
          </span>
        </div>
        <textarea
          ref={taRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          className="h-[65vh] w-full resize-none bg-transparent p-5 font-mono text-xs leading-relaxed text-linear-ink selection:bg-linear-primary/40 placeholder:text-linear-ink-tertiary focus:outline-none"
          placeholder="编写 Markdown 文档内容..."
        />
      </div>

      {/* Git History Modal / Panel */}
      {history && (
        <Card className="border-linear-hairline bg-linear-surface-1">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-linear-ink">
                <GitCommit className="h-4 w-4 text-linear-primary-hover" />
                Git 提交历史记录
              </CardTitle>
              <CardDescription className="text-xs text-linear-ink-subtle">
                每次发布或回滚均会自动记录为 Git 历史提交，点击可一键无损回滚。
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setHistory(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="py-4 text-center text-xs text-linear-ink-subtle">
                暂无版本历史
              </p>
            ) : (
              <div className="divide-y divide-linear-hairline/60">
                {history.map((h) => (
                  <div
                    key={h.rev}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Kbd>{h.rev}</Kbd>
                      <span className="text-xs text-linear-ink">
                        {h.message}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-linear-ink-subtle">
                      <span>{h.date}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => doRevert(h.rev)}
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        回滚至此版本
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
