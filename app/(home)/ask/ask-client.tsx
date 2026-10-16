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
type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[]; note?: string };
type StreamEvent = { type?: string; text?: string; sources?: Source[]; message?: string };

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
    <div className="relative my-3 rounded-[8px] border border-zinc-200 dark:border-[#23252a] bg-zinc-950 text-zinc-100 overflow-hidden shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-[11px] text-zinc-400">
        <span className="font-mono">代码片段</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 hover:text-white transition-colors"
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
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-[#f7f8f8]">
      {fence.map((part, i) =>
        i % 2 === 1 ? (
          <CodeBlock key={i} code={part.replace(/^[a-zA-Z]*\n/, '').trimEnd()} />
        ) : (
          <span key={i} className="whitespace-pre-wrap">
            {inline(part, sources)}
          </span>
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
      out.push(
        <strong key={out.length} className="font-semibold text-zinc-900 dark:text-white">
          {m[1]}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      out.push(
        <code
          key={out.length}
          className="rounded-[4px] border border-zinc-200 dark:border-[#23252a] bg-zinc-100 dark:bg-[#141516] px-1.5 py-0.5 font-mono text-[11px] text-[#5e6ad2] dark:text-[#828fff]"
        >
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
            title={`${s.title}${s.heading ? ` · ${s.heading}` : ''}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 mx-0.5 rounded-full border border-[#5e6ad2]/20 dark:border-[#5e6ad2]/30 bg-[#5e6ad2]/10 dark:bg-[#5e6ad2]/15 px-1.5 py-0.2 text-[10px] font-mono text-[#5e6ad2] dark:text-[#828fff] hover:bg-[#5e6ad2]/20 dark:hover:bg-[#5e6ad2]/30 transition-colors"
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
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(queryText?: string) {
    const q = (queryText ?? input).trim();
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

  function clearHistory() {
    setMessages([]);
    setInput('');
    setTimeout(() => taRef.current?.focus(), 50);
  }

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Empty State: Centered Hero & Input */}
      {messages.length === 0 ? (
        <div className="my-auto py-6 sm:py-12 flex flex-col items-center text-center space-y-6">
          {/* Header */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5e6ad2]/25 bg-[#5e6ad2]/10 px-3 py-1 text-xs font-medium text-[#5e6ad2] dark:text-[#828fff]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI · 部门知识库智能问答</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-[#f7f8f8]">
              有什么可以帮您查阅？
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8a8f98] leading-relaxed">
              基于站内已发布文档进行精准语义检索与大模型推理，所有回答均包含文档来源直达锚点。
            </p>
          </div>

          {/* Central Search/Input Box */}
          <div className="w-full max-w-2xl text-left rounded-2xl border border-zinc-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] p-3.5 shadow-xl shadow-zinc-200/50 dark:shadow-[0_12px_40px_rgba(0,0,0,0.8)] focus-within:border-[#5e6ad2] focus-within:ring-2 focus-within:ring-[#5e6ad2]/20 transition-all">
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
              className="w-full resize-none bg-transparent text-sm text-zinc-900 dark:text-[#f7f8f8] placeholder:text-zinc-400 dark:placeholder:text-[#62666d] focus:outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-[#23252a]/60 pt-2.5 mt-2">
              <span className="text-[11px] text-zinc-400 dark:text-[#62666d] flex items-center gap-1.5">
                按 <Kbd>Enter</Kbd> 发送，<Kbd>Shift + Enter</Kbd> 换行
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                className="h-8 px-4 text-xs font-medium"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                提问
              </Button>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="w-full max-w-2xl space-y-2.5 text-left pt-2">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-[#62666d]">
              <Lightbulb className="h-3.5 w-3.5 text-[#5e6ad2]" />
              <span>常见问题快捷探索：</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void send(s)}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] px-3.5 py-1.5 text-xs text-zinc-700 dark:text-[#d0d6e0] hover:border-[#5e6ad2] hover:text-[#5e6ad2] dark:hover:border-[#5e6ad2] dark:hover:text-[#828fff] transition-all shadow-xs hover:shadow-sm"
                >
                  <span className="text-zinc-400 dark:text-[#62666d]">✦</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Conversation Mode */
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Conversation Top Bar */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#23252a] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5e6ad2]/15 text-[#5e6ad2] dark:text-[#828fff]">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-xs font-semibold text-zinc-900 dark:text-[#f7f8f8]">
                Ask AI 对话中
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-[#62666d]">
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
              <RotateCcw className="h-3 w-3 mr-1" />
              开启新对话
            </Button>
          </div>

          {/* Messages Stream */}
          <div className="space-y-6 flex-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* User Message */}
                {m.role === 'user' ? (
                  <div className="rounded-2xl rounded-tr-sm bg-zinc-900 dark:bg-[#141516] text-white dark:text-[#f7f8f8] border border-zinc-800 dark:border-[#23252a] px-4 py-2.5 text-xs sm:text-sm max-w-xl shadow-xs">
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                ) : (
                  /* Assistant Message */
                  <div className="w-full flex flex-col items-start space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#5e6ad2] dark:text-[#828fff]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>知识库助手</span>
                    </div>

                    <div className="w-full rounded-2xl border border-zinc-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] p-4 sm:p-5 shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                      {m.content ? (
                        <AnswerText text={m.content} sources={m.sources} />
                      ) : busy && i === messages.length - 1 ? (
                        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-[#8a8f98] py-2">
                          <div className="h-2 w-2 rounded-full bg-[#5e6ad2] animate-ping" />
                          <span>正在检索知识库文档并组织回答…</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 dark:text-[#8a8f98]">
                          （暂无内容）
                        </span>
                      )}
                    </div>

                    {/* Sources References Grid */}
                    {!!m.sources?.length && (
                      <div className="w-full rounded-xl border border-zinc-200 dark:border-[#23252a] bg-zinc-50 dark:bg-[#141516]/60 p-3 text-xs mt-1">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-600 dark:text-[#8a8f98] mb-2.5">
                          <BookOpen className="h-3.5 w-3.5 text-[#5e6ad2]" />
                          <span>引用来源文档（点击直达对应章节）：</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {m.sources.map((s, j) => (
                            <a
                              key={j}
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between rounded-[8px] border border-zinc-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] p-2.5 text-zinc-700 dark:text-[#d0d6e0] hover:border-[#5e6ad2] hover:text-[#5e6ad2] dark:hover:text-[#828fff] transition-colors group shadow-2xs"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-mono text-[#5e6ad2] dark:text-[#828fff] font-semibold shrink-0">
                                  [{j + 1}]
                                </span>
                                <span className="truncate font-medium">{s.title}</span>
                                {s.heading && (
                                  <span className="text-zinc-400 dark:text-[#62666d] truncate text-[11px]">
                                    · {s.heading}
                                  </span>
                                )}
                              </div>
                              <ExternalLink className="h-3 w-3 text-zinc-400 dark:text-[#62666d] group-hover:text-[#5e6ad2] shrink-0 ml-1.5" />
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
            <div className="rounded-2xl border border-zinc-200 dark:border-[#23252a] bg-white/95 dark:bg-[#0f1011]/95 backdrop-blur p-3 shadow-lg shadow-zinc-200/50 dark:shadow-[0_8px_32px_rgba(0,0,0,0.8)] focus-within:border-[#5e6ad2] focus-within:ring-2 focus-within:ring-[#5e6ad2]/20 transition-all">
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
                className="w-full resize-none bg-transparent text-sm text-zinc-900 dark:text-[#f7f8f8] placeholder:text-zinc-400 dark:placeholder:text-[#62666d] focus:outline-none"
              />

              <div className="mt-1.5 flex items-center justify-between border-t border-zinc-100 dark:border-[#23252a]/60 pt-2 text-[11px] text-zinc-400 dark:text-[#62666d]">
                <span className="hidden sm:inline">
                  按 <Kbd>Enter</Kbd> 发送，<Kbd>Shift + Enter</Kbd> 换行
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void send()}
                    disabled={busy || !input.trim()}
                    className="h-7 text-xs px-3"
                  >
                    {busy ? (
                      <>
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                        回答中…
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-1" />
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
