'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
  Sparkles,
  Send,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

type Source = { title: string; url: string; heading: string; content: string };
type Msg = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  note?: string;
};
type StreamEvent = {
  type?: string;
  text?: string;
  sources?: Source[];
  message?: string;
};

const PROMPT_SUGGESTIONS = [
  '后台怎么新建并发布一篇文档？',
  '本地开发如何一键启动知识库站点？',
  'Docker Compose 部署与 pgvector 迁移步骤？',
  '知识库的侧栏目录与图标怎么配置？',
];

/** 代码块组件（带复制功能） */
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative my-3 overflow-hidden rounded-[8px] border border-zinc-200 bg-zinc-950 text-zinc-100 shadow-xs dark:border-linear-hairline">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400">
        <span className="font-mono">代码片段</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 transition-colors hover:text-white"
          title="复制代码"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** 答案正文渲染：代码块、**粗体**、`行内代码`、[n] 引用 → 薰衣草紫蓝胶囊链接 */
function AnswerText({ text, sources }: { text: string; sources?: Source[] }) {
  const fence = text.split('```');
  return (
    <div className="space-y-2 text-xs leading-relaxed text-zinc-800 sm:text-sm dark:text-linear-ink">
      {fence.map((part, i) =>
        i % 2 === 1 ? (
          <CodeBlock
            key={i}
            code={part.replace(/^[a-zA-Z]*\n/, '').trimEnd()}
          />
        ) : (
          <span key={i} className="whitespace-pre-wrap">
            {inline(part, sources)}
          </span>
        )
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
      out.push(
        <strong
          key={out.length}
          className="font-semibold text-zinc-900 dark:text-white"
        >
          {m[1]}
        </strong>
      );
    } else if (m[2] !== undefined) {
      out.push(
        <code
          key={out.length}
          className="rounded-[4px] border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-linear-primary dark:border-linear-hairline dark:bg-linear-surface-2 dark:text-linear-primary-hover"
        >
          {m[2]}
        </code>
      );
    } else {
      const n = Number(m[3]);
      const s = sources?.[n - 1];
      if (s) {
        out.push(
          <a
            key={out.length}
            href={s.url}
            title={`${s.title}${s.heading ? ` · ${s.heading}` : ''}`}
            target="_blank"
            rel="noreferrer"
            className="py-0.2 mx-0.5 inline-flex items-center gap-0.5 rounded-full border border-linear-primary/20 bg-linear-primary/10 px-1.5 font-mono text-xs text-linear-primary transition-colors hover:bg-linear-primary/20 dark:border-linear-primary/30 dark:bg-linear-primary/15 dark:text-linear-primary-hover dark:hover:bg-linear-primary/30"
          >
            [{n}]
          </a>
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

export function AskClient({ initialQuery }: { initialQuery?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(initialQuery ?? '');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const initialSentRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialQuery && !initialSentRef.current) {
      initialSentRef.current = true;
      void send(initialQuery);
    }
  }, [initialQuery]);

  async function send(queryText?: string) {
    const q = (queryText ?? input).trim();
    if (!q || busy) return;
    setBusy(true);
    setInput('');
    const history: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages([...history, { role: 'assistant', content: '' }]);

    const patchLast = (patch: (m: Msg) => Msg) =>
      setMessages((cur) =>
        cur.map((m, i) => (i === cur.length - 1 ? patch(m) : m))
      );

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
        const json = (await res.json()) as {
          note?: string;
          error?: string;
          sources?: Source[];
        };
        patchLast((m) => ({
          ...m,
          content: json.note ?? json.error ?? '（暂未在知识库中找到相关内容）',
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
          if (j.type === 'sources')
            patchLast((m) => ({ ...m, sources: j.sources }));
          else if (j.type === 'delta')
            patchLast((m) => ({ ...m, content: m.content + (j.text ?? '') }));
          else if (j.type === 'error')
            patchLast((m) => ({
              ...m,
              content: m.content || `（出错了：${j.message ?? '未知错误'}）`,
            }));
        }
      }
    } catch (e) {
      patchLast((m) => ({
        ...m,
        content:
          m.content ||
          `请求失败：${e instanceof Error ? e.message : '网络错误'}`,
      }));
    } finally {
      setBusy(false);
    }
  }

  function clearHistory() {
    setMessages([]);
    setInput('');
    setTimeout(() => taRef.current?.focus(), 50);
  }

  return (
    <div className="flex flex-1 flex-col justify-between">
      {/* Empty State: Centered Hero & Input */}
      {messages.length === 0 ? (
        <div className="my-auto flex flex-col items-center space-y-6 py-6 text-center sm:py-12">
          {/* Header */}
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-linear-primary/25 bg-linear-primary/10 px-3 py-1 text-xs font-medium text-linear-primary dark:text-linear-primary-hover">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI · 部门知识库智能问答</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-linear-ink">
              有什么可以帮您查阅？
            </h1>
            <p className="text-xs leading-relaxed text-zinc-500 sm:text-sm dark:text-linear-ink-subtle">
              基于站内已发布文档进行精准语义检索与大模型推理，所有回答均包含文档来源直达锚点。
            </p>
          </div>

          {/* Central Search/Input Box */}
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-3.5 text-left shadow-xl shadow-zinc-200/50 transition-all focus-within:border-linear-primary focus-within:ring-2 focus-within:ring-linear-primary/20 dark:border-linear-hairline dark:bg-linear-surface-1 dark:shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={3}
              placeholder="向知识库提问任何技术规范、部署指引或系统使用方法…"
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-linear-ink dark:placeholder:text-linear-ink-tertiary"
            />
            <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-linear-hairline/60">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-linear-ink-tertiary">
                按 <Kbd>Enter</Kbd> 发送，<Kbd>Shift + Enter</Kbd> 换行
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                className="h-8 px-4 text-xs font-medium"
              >
                <Send className="mr-1 h-3.5 w-3.5" />
                提问
              </Button>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="w-full max-w-2xl space-y-2.5 pt-2 text-left">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-linear-ink-tertiary">
              <Lightbulb className="h-3.5 w-3.5 text-linear-primary" />
              <span>常见问题快捷探索：</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void send(s)}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs text-zinc-700 shadow-xs transition-all hover:border-linear-primary hover:text-linear-primary hover:shadow-sm dark:border-linear-hairline dark:bg-linear-surface-1 dark:text-linear-ink-muted dark:hover:border-linear-primary dark:hover:text-linear-primary-hover"
                >
                  <span className="text-zinc-400 dark:text-linear-ink-tertiary">
                    ✦
                  </span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Conversation Mode */
        <div className="flex flex-1 flex-col space-y-6">
          {/* Conversation Top Bar */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-linear-hairline">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-primary/15 text-linear-primary dark:text-linear-primary-hover">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-xs font-semibold text-zinc-900 dark:text-linear-ink">
                Ask AI 对话中
              </span>
              <span className="text-xs text-zinc-400 dark:text-linear-ink-tertiary">
                （共 {messages.length} 条消息）
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              disabled={busy}
              className="h-7 text-xs"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              开启新对话
            </Button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 space-y-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* User Message */}
                {m.role === 'user' ? (
                  <div className="max-w-xl rounded-2xl rounded-tr-sm border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white shadow-xs sm:text-sm dark:border-linear-hairline dark:bg-linear-surface-2 dark:text-linear-ink">
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </p>
                  </div>
                ) : (
                  /* Assistant Message */
                  <div className="flex w-full flex-col items-start space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-linear-primary dark:text-linear-primary-hover">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>知识库助手</span>
                    </div>

                    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs sm:p-5 dark:border-linear-hairline dark:bg-linear-surface-1 dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                      {m.content ? (
                        <AnswerText text={m.content} sources={m.sources} />
                      ) : busy && i === messages.length - 1 ? (
                        <div className="flex items-center gap-2 py-2 text-xs text-zinc-400 dark:text-linear-ink-subtle">
                          <div className="h-2 w-2 animate-ping rounded-full bg-linear-primary" />
                          <span>正在检索知识库文档并组织回答…</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 dark:text-linear-ink-subtle">
                          （暂无内容）
                        </span>
                      )}
                    </div>

                    {/* Sources References Grid */}
                    {!!m.sources?.length && (
                      <div className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-linear-hairline dark:bg-linear-surface-2/60">
                        <div className="mb-2.5 flex items-center gap-1.5 font-medium text-zinc-600 dark:text-linear-ink-subtle">
                          <BookOpen className="h-3.5 w-3.5 text-linear-primary" />
                          <span>引用来源文档（点击直达对应章节）：</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {m.sources.map((s, j) => (
                            <a
                              key={j}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center justify-between rounded-[8px] border border-zinc-200 bg-white p-2.5 text-zinc-700 shadow-2xs transition-colors hover:border-linear-primary hover:text-linear-primary dark:border-linear-hairline dark:bg-linear-surface-1 dark:text-linear-ink-muted dark:hover:text-linear-primary-hover"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="shrink-0 font-mono font-semibold text-linear-primary dark:text-linear-primary-hover">
                                  [{j + 1}]
                                </span>
                                <span className="truncate font-medium">
                                  {s.title}
                                </span>
                                {s.heading && (
                                  <span className="truncate text-xs text-zinc-400 dark:text-linear-ink-tertiary">
                                    · {s.heading}
                                  </span>
                                )}
                              </div>
                              <ExternalLink className="ml-1.5 h-3 w-3 shrink-0 text-zinc-400 group-hover:text-linear-primary dark:text-linear-ink-tertiary" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Sticky Bottom Input Bar in Conversation Mode */}
          <div className="sticky bottom-4 z-20 w-full pt-2">
            <div className="rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-lg shadow-zinc-200/50 backdrop-blur transition-all focus-within:border-linear-primary focus-within:ring-2 focus-within:ring-linear-primary/20 dark:border-linear-hairline dark:bg-linear-surface-1/95 dark:shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder="继续追问或输入新问题…"
                className="w-full resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-linear-ink dark:placeholder:text-linear-ink-tertiary"
              />

              <div className="mt-1.5 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs text-zinc-400 dark:border-linear-hairline/60 dark:text-linear-ink-tertiary">
                <span className="hidden sm:inline">
                  按 <Kbd>Enter</Kbd> 发送，<Kbd>Shift + Enter</Kbd> 换行
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void send()}
                    disabled={busy || !input.trim()}
                    className="h-7 px-3 text-xs"
                  >
                    {busy ? (
                      <>
                        <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        回答中…
                      </>
                    ) : (
                      <>
                        <Send className="mr-1 h-3 w-3" />
                        发送
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
