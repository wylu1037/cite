'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Source = { title: string; url: string; heading: string; content: string };
type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[]; note?: string };
type StreamEvent = { type?: string; text?: string; sources?: Source[]; message?: string };

/** 轻量渲染：``` 代码块、**粗体**、`行内代码`、[n] 引用 → 可点击链接 */
function AnswerText({ text, sources }: { text: string; sources?: Source[] }) {
  const fence = text.split('```');
  return (
    <div className="whitespace-pre-wrap">
      {fence.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="my-2 overflow-x-auto rounded-lg bg-fd-muted px-3 py-2 text-xs">
            {part.replace(/^[a-zA-Z]*\n/, '')}
          </pre>
        ) : (
          <span key={i}>{inline(part, sources)}</span>
        ),
      )}
    </div>
  );
}

function inline(text: string, sources?: Source[]): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[(\d+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={out.length}>{m[1]}</strong>);
    } else if (m[2] !== undefined) {
      out.push(
        <code key={out.length} className="rounded bg-fd-muted px-1 py-0.5 text-xs">
          {m[2]}
        </code>,
      );
    } else {
      const n = Number(m[3]);
      const s = sources?.[n - 1];
      if (s) {
        out.push(
          <a
            key={out.length}
            href={s.url}
            title={s.title}
            className="mx-0.5 rounded bg-fd-muted px-1 text-xs no-underline hover:underline"
          >
            [{n}]
          </a>,
        );
      } else {
        out.push(m[0]);
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function AskClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setBusy(true);
    setInput('');
    const history: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages([...history, { role: 'assistant', content: '' }]);

    const patchLast = (patch: (m: Msg) => Msg) =>
      setMessages((cur) => cur.map((m, i) => (i === cur.length - 1 ? patch(m) : m)));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      const ct = res.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        const json = (await res.json()) as { note?: string; error?: string; sources?: Source[] };
        patchLast((m) => ({
          ...m,
          content: json.note ?? json.error ?? '（暂无内容）',
          sources: json.sources,
        }));
        return;
      }
      if (!res.body) throw new Error('无响应体');
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;
          let j: StreamEvent;
          try {
            j = JSON.parse(line.slice(5)) as StreamEvent;
          } catch {
            continue;
          }
          if (j.type === 'sources') patchLast((m) => ({ ...m, sources: j.sources }));
          else if (j.type === 'delta') patchLast((m) => ({ ...m, content: m.content + (j.text ?? '') }));
          else if (j.type === 'error')
            patchLast((m) => ({ ...m, content: m.content || `（出错了：${j.message ?? '未知错误'}）` }));
        }
      }
    } catch (e) {
      patchLast((m) => ({ ...m, content: m.content || `请求失败：${e instanceof Error ? e.message : '网络错误'}` }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {messages.length === 0 && (
        <div className="rounded-xl border border-dashed p-6 text-sm text-fd-muted-foreground">
          试试问：「后台怎么新建并发布一篇文档？」「本地怎么把站点跑起来？」
        </div>
      )}
      {messages.map((m, i) => (
        <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
          <div
            className={
              m.role === 'user'
                ? 'inline-block rounded-2xl bg-fd-primary px-4 py-2 text-sm whitespace-pre-wrap text-fd-primary-foreground'
                : 'rounded-2xl border px-4 py-3 text-sm'
            }
          >
            {m.role === 'assistant' ? (
              m.content ? (
                <AnswerText text={m.content} sources={m.sources} />
              ) : busy ? (
                '思考中…'
              ) : (
                '（暂无内容）'
              )
            ) : (
              m.content
            )}
          </div>
          {!!m.sources?.length && (
            <div className="mt-2 space-y-1 text-xs text-fd-muted-foreground">
              <div>参考资料：</div>
              {m.sources.map((s, j) => (
                <a key={j} href={s.url} className="block underline decoration-dotted hover:text-fd-foreground">
                  [{j + 1}] {s.title}
                  {s.heading ? ` · ${s.heading}` : ''}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
      <div className="flex gap-2 pt-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={2}
          placeholder="输入问题，Enter 发送，Shift+Enter 换行"
          className="flex-1 resize-none rounded-xl border bg-fd-background px-3 py-2 text-sm outline-none focus:border-fd-primary"
        />
        <button
          onClick={() => void send()}
          disabled={busy || !input.trim()}
          className="self-end rounded-xl bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground disabled:opacity-50"
        >
          {busy ? '回答中…' : '发送'}
        </button>
      </div>
    </div>
  );
}
