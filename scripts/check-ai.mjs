#!/usr/bin/env node
// 在内网机器上验 AI 接线：embedding 实际维度 + LLM 一句话回复（不碰数据库）。
// 用法：node scripts/check-ai.mjs
if (!process.env.EMBEDDING_API_URL && !process.env.OPENAI_API_BASE) {
  try {
    const { config } = await import('dotenv');
    config();
  } catch {}
}

const dim = Number(process.env.EMBEDDING_DIM || 0);
const eUrl = (process.env.EMBEDDING_API_URL || '').trim();
if (eUrl) {
  try {
    const headers = { 'content-type': 'application/json' };
    if (process.env.EMBEDDING_API_KEY) headers.authorization = `Bearer ${process.env.EMBEDDING_API_KEY}`;
    const res = await fetch(eUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: process.env.EMBEDDING_MODEL_NAME || 'Qwen3-Embedding-8B', input: ['维度探测'] }),
      signal: AbortSignal.timeout(15_000),
    });
    const j = await res.json().catch(() => ({}));
    const v = j?.data?.[0]?.embedding ?? [];
    let verdict = '';
    if (dim) verdict = v.length === dim ? `（EMBEDDING_DIM=${dim} ✓）` : `（EMBEDDING_DIM=${dim} ✗ 不一致：改 .env 的 EMBEDDING_DIM，并同步 prisma/migrations 的 vector(${v.length}) 后重新迁移）`;
    console.log(`[check-ai] embedding HTTP ${res.status} 维度=${v.length}${verdict}`);
  } catch (e) {
    console.log('[check-ai] embedding 失败：', e instanceof Error ? e.message : e);
  }
} else {
  console.log('[check-ai] 未配置 EMBEDDING_API_URL（将使用 mock 伪向量）');
}

const base = (process.env.OPENAI_API_BASE || '').replace(/\/+$/, '');
if (base) {
  try {
    const headers = { 'content-type': 'application/json' };
    if (process.env.OPENAI_API_KEY) headers.authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: process.env.LLM_MODEL_NAME || 'dsv4',
        messages: [{ role: 'user', content: '只回复两个字：收到' }],
        max_tokens: 16,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const j = await res.json().catch(() => ({}));
    console.log(`[check-ai] LLM HTTP ${res.status} 模型=${j.model ?? '?'} 回复=${JSON.stringify(j.choices?.[0]?.message?.content ?? j.error ?? '')}`.slice(0, 300));
  } catch (e) {
    console.log('[check-ai] LLM 失败：', e instanceof Error ? e.message : e);
  }
} else {
  console.log('[check-ai] 未配置 OPENAI_API_BASE');
}
