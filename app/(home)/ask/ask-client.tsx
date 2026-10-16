'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import {
  Sparkles,
  Send,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Bot,
  User,
  ArrowRight,
  BookOpen,
  StopCircle,
} from 'lucide-react';

type Source = { title: string; url: string; heading: string; content: string };
type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[]; note?: string };
type StreamEvent = { type?: string; text?: string; sources?: Source[]; message?: string };

const PROMPT_SUGGESTIONS = [
  '后台怎么新建并发布一篇文档？',
  '本地开发如何一键启动知识库站点？',
  '内网 Docker Compose 部署与 pgvector 迁移步骤是什么？',
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
    <div className="relative my-3 rounded-[8px] border border-[#23252a] bg-[#010102] overflow-hidden group">
      <div className="flex items-center justify-between border-b border-[#23252a] bg-[#141516]/60 px-3 py-1.5 text-[11px] text-[#8a8f98]">
        <span className="font-mono">代码片段</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 hover:text-[#f7f8f8] transition-colors"
          title="复制代码"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[#4ade80]" />
              <span className="text-[#4ade80]">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-xs text-[#f7f8f8] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** 答案正文渲染：代码块、**粗体**、`行内代码`、[n] 引用 → 薰衣草紫蓝胶囊链接 */
function AnswerText({ text, sources }: { text: string; sources?: Source[] }) {
  const fence = text.split('```');
  return (
    <div className="space-y-2 text-xs leading-relaxed text-[#f7f8f8]">
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
        <strong key={out.length} className="font-semibold text-white">
          {m[1]}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      out.push(
        <code
          key={out.length}
          className="rounded-[4px] border border-[#23252a] bg-[#141516] px-1.5 py-0.5 font-mono text-[11px] text-[#828fff]"
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
            className="inline-flex items-center gap-0.5 mx-0.5 rounded-full border border-[#5e6ad2]/30 bg-[#5e6ad2]/15 px-1.5 py-0.2 text-[10px] font-mono text-[#828fff] hover:bg-[#5e6ad2]/30 hover:underline transition-colors"
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
  }

  return (
    <div className="flex-1 flex flex-col justify-between space-y-6">
      {/* Suggestions when conversation is empty */}
      {messages.length === 0 && (
        <div className="my-auto py-8 space-y-4">
          <p className="text-center text-xs text-[#8a8f98]">
            您可以使用自然语言直接提问，或者尝试以下常见问题：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PROMPT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => void send(s)}
                className="group flex flex-col justify-between rounded-[10px] border border-[#23252a] bg-[#0f1011] p-4 text-left transition-all hover:border-[#5e6ad2]/50 hover:bg-[#141516] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              >
                <span className="text-xs text-[#d0d6e0] group-hover:text-[#f7f8f8] leading-relaxed">
                  {s}
                </span>
                <span className="mt-3 flex items-center text-[10px] text-[#5e6ad2] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  立即提问 <ArrowRight className="h-3 w-3 ml-1" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Feed */}
      {messages.length > 0 && (
        <div className="space-y-4 pb-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Role Header */}
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#8a8f98]">
                {m.role === 'user' ? (
                  <>
                    <span>您</span>
                    <User className="h-3 w-3 text-[#d0d6e0]" />
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-[#828fff]" />
                    <span className="text-[#828fff] font-medium">知识库助手</span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`w-full max-w-3xl rounded-[12px] p-4 text-xs transition-all ${
                  m.role === 'user'
                    ? 'border border-[#23252a] bg-[#141516] text-[#f7f8f8] max-w-xl'
                    : 'border border-[#23252a] bg-[#0f1011] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
                }`}
              >
                {m.role === 'assistant' ? (
                  m.content ? (
                    <AnswerText text={m.content} sources={m.sources} />
                  ) : busy && i === messages.length - 1 ? (
                    <div className="flex items-center gap-2 text-xs text-[#8a8f98] py-2">
                      <div className="h-2 w-2 rounded-full bg-[#5e6ad2] animate-ping" />
                      <span>正在检索文档分块并构思回答…</span>
                    </div>
                  ) : (
                    <span className="text-[#8a8f98]">（暂无内容）</span>
                  )
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                )}
              </div>

              {/* Source References */}
              {m.role === 'assistant' && !!m.sources?.length && (
                <div className="mt-2 w-full max-w-3xl rounded-[8px] border border-[#23252a]/80 bg-[#141516]/60 p-3 text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium text-[#8a8f98] mb-2">
                    <BookOpen className="h-3.5 w-3.5 text-[#5e6ad2]" />
                    <span>引用来源（点击直达对应页面）：</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, j) => (
                      <a
                        key={j}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-[4px] border border-[#23252a] bg-[#0f1011] px-2 py-1 text-[#d0d6e0] hover:border-[#5e6ad2] hover:text-[#f7f8f8] transition-colors"
                      >
                        <span className="text-[#828fff] font-mono">[{j + 1}]</span>
                        <span>{s.title}</span>
                        {s.heading && <span className="text-[#62666d]">· {s.heading}</span>}
                        <ExternalLink className="h-2.5 w-2.5 ml-0.5 text-[#62666d]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}

      {/* Floating Linear Input Panel */}
      <div className="sticky bottom-4 z-20 w-full pt-2">
        <div className="rounded-[12px] border border-[#23252a] bg-[#0f1011]/95 backdrop-blur p-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)] focus-within:border-[#5e6ad2]/70 focus-within:ring-2 focus-within:ring-[#5e6ad2]/20 transition-all">
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
            placeholder="向知识库提问任何技术问题、流程规范或产品功能…"
            className="w-full resize-none bg-transparent text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none"
          />

          <div className="mt-2 flex items-center justify-between border-t border-[#23252a]/60 pt-2 text-[11px] text-[#62666d]">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">
                按 <Kbd>Enter</Kbd> 发送，<Kbd>Shift + Enter</Kbd> 换行
              </span>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  disabled={busy}
                  className="flex items-center gap-1 text-[#8a8f98] hover:text-[#f7f8f8] transition-colors ml-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  新对话
                </button>
              )}
            </div>

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
                  生成中…
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  发送
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
