import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { embedOne } from '@/lib/rag/embedding';

export const maxDuration = 120;

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type SourceRef = { title: string; url: string; heading: string; content: string };

const TOP_K = 6;

const vecLiteral = (v: number[]) => `[${v.map((x) => (Number.isFinite(x) ? x.toFixed(6) : '0')).join(',')}]`;

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

function buildSystemPrompt(sources: SourceRef[]): string {
  const ctx = sources
    .map((s, i) => `[${i + 1}] ${s.title}${s.heading ? `（${s.heading}）` : ''} ${s.url}\n${s.content}`)
    .join('\n\n');
  return `你是公司内部知识库的问答助手，只依据下面「资料」中的内容回答用户问题：
- 引用资料时在句末标注编号，如 [1]；引用多条写作 [1][2]
- 资料不足以回答时，明确说没找到，并建议到 /docs 站内搜索或更换问法
- 用简体中文回答，简洁直接，不要编造资料之外的内容

资料：
${ctx || '（暂无相关资料）'}`;
}

async function retrieve(question: string): Promise<SourceRef[]> {
  const qvec = await embedOne(question);
  const rows = await prisma.$queryRaw<SourceRef[]>`
    SELECT d."title", d."url", c."heading", c."content"
    FROM "Chunk" c JOIN "Doc" d ON d."id" = c."docId"
    ORDER BY c."embedding" <=> ${vecLiteral(qvec)}::vector ASC
    LIMIT ${TOP_K}`;
  // 按文档去重，保留每篇最相关的一两块
  const picked: SourceRef[] = [];
  const count = new Map<string, number>();
  for (const r of rows) {
    const n = count.get(r.url) ?? 0;
    if (n >= 2) continue;
    count.set(r.url, n + 1);
    picked.push(r);
  }
  return picked;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { messages?: ChatMessage[] } | null;
  const messages = (body?.messages ?? [])
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-8);
  const question = [...messages].reverse().find((m) => m.role === 'user')?.content.trim();
  if (!question) return NextResponse.json({ error: '缺少问题' }, { status: 400 });

  let sources: SourceRef[] = [];
  try {
    sources = await retrieve(question);
  } catch (e) {
    console.error('[chat] 检索失败，降级为直答：', e);
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '';
  if (!apiKey) {
    return NextResponse.json({
      mode: 'retrieval',
      sources,
      note: '未配置 LLM（OPENAI_API_KEY，内网网关填 EMPTY 即可）：以下是检索到的相关资料；配置后可由模型总结并引用回答。',
    });
  }

  const base = (process.env.OPENAI_API_BASE || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');
  let upstream: Response;
  try {
    upstream = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.LLM_MODEL_NAME || process.env.DEEPSEEK_MODEL || 'deepseek-flash',
        max_tokens: Number(process.env.LLM_MAX_TOKENS || 2048),
        stream: true,
        messages: [{ role: 'system', content: buildSystemPrompt(sources) }, ...messages],
      }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch (e) {
    return NextResponse.json({
      mode: 'retrieval',
      sources,
      note: `模型服务不可达（${e instanceof Error ? e.message : '请求失败'}），先给出相关资料。`,
    });
  }
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    return NextResponse.json({
      mode: 'retrieval',
      sources,
      note: `模型服务返回 ${upstream.status}：${detail.slice(0, 200)}`,
    });
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(enc.encode(sse({ type: 'sources', sources })));
      const reader = upstream.body!.getReader();
      let buf = '';
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith('data:')) continue;
            const payload = t.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              const j = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] };
              const delta = j.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(enc.encode(sse({ type: 'delta', text: delta })));
            } catch {}
          }
        }
        controller.enqueue(enc.encode(sse({ type: 'done' })));
      } catch (e) {
        controller.enqueue(enc.encode(sse({ type: 'error', message: e instanceof Error ? e.message : '流式传输中断' })));
      } finally {
        controller.close();
      }
    },
    cancel() {
      upstream.body?.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store' },
  });
}
