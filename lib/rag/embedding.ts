import { createHash } from 'node:crypto';

/**
 * 一期的 embedding 走「内网/外部 OpenAI 兼容端点」，接口在此抽象：
 * 日后切本地实现只需在这里加一个 provider 分支。
 *
 * 配置优先级：
 * 1. EMBEDDING_API_URL（必须是完整接口地址，含 /v1/embeddings）→ 通用 OpenAI 兼容
 * 2. EMBEDDING_PROVIDER=dashscope|siliconflow → 内置预设
 * 3. 都没有 → mock（确定性伪向量，本地联调免费）
 */
export type EmbeddingProvider =
  'openai-compatible' | 'dashscope' | 'siliconflow' | 'mock';

export type EmbeddingConfig = {
  provider: EmbeddingProvider;
  url: string;
  model: string;
  apiKey: string;
  dim: number;
  batch: number;
};

const PRESETS = {
  dashscope: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings',
    model: 'text-embedding-v4',
    dim: 1024,
    batch: 10,
  },
  siliconflow: {
    url: 'https://api.siliconflow.cn/v1/embeddings',
    model: 'BAAI/bge-m3',
    dim: 1024,
    batch: 32,
  },
} as const;

export function embeddingConfig(
  env: NodeJS.ProcessEnv = process.env
): EmbeddingConfig {
  const dimOf = (fallback: number) => Number(env.EMBEDDING_DIM || fallback);
  const modelName = (fallback: string) =>
    (env.EMBEDDING_MODEL_NAME || env.EMBEDDING_MODEL || fallback).trim();
  const apiKey = (env.EMBEDDING_API_KEY || '').trim();

  const url = (env.EMBEDDING_API_URL || '').trim();
  if (url) {
    return {
      provider: 'openai-compatible',
      url,
      model: modelName('Qwen3-Embedding-8B'),
      apiKey,
      // Qwen3-Embedding-8B 原生 4096 维；换端点请同步 EMBEDDING_DIM 与迁移 SQL 的 vector(N)
      dim: dimOf(4096),
      batch: Number(env.EMBEDDING_BATCH || 32),
    };
  }
  const p = (env.EMBEDDING_PROVIDER || '').trim().toLowerCase();
  if (p === 'dashscope' || p === 'siliconflow') {
    const preset = PRESETS[p];
    return {
      provider: p,
      url: preset.url,
      model: modelName(preset.model),
      apiKey,
      dim: dimOf(preset.dim),
      batch: preset.batch,
    };
  }
  return {
    provider: 'mock',
    url: '',
    model: 'mock',
    apiKey: '',
    dim: dimOf(1024),
    batch: 100,
  };
}

/** 批量向量化（自动按服务端批量上限切段） */
export async function embedTexts(
  texts: string[],
  env: NodeJS.ProcessEnv = process.env
): Promise<number[][]> {
  const cfg = embeddingConfig(env);
  if (cfg.provider === 'mock') return texts.map((t) => mockVector(t, cfg.dim));
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += cfg.batch) {
    out.push(...(await embedBatch(cfg, texts.slice(i, i + cfg.batch))));
  }
  return out;
}

export async function embedOne(
  text: string,
  env: NodeJS.ProcessEnv = process.env
): Promise<number[]> {
  const [v] = await embedTexts([text], env);
  return v;
}

async function embedBatch(
  cfg: EmbeddingConfig,
  input: string[]
): Promise<number[][]> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (cfg.apiKey) headers.authorization = `Bearer ${cfg.apiKey}`;
  const body = JSON.stringify({ model: cfg.model, input });

  const call = async () => {
    const res = await fetch(cfg.url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(
        `embedding 服务返回 ${res.status}：${detail.slice(0, 200)}`
      );
    }
    return (await res.json()) as { data?: { embedding?: number[] }[] };
  };

  let json: { data?: { embedding?: number[] }[] };
  try {
    json = await call();
  } catch {
    json = await call(); // 网络抖动重试一次
  }
  const vecs = (json.data ?? []).map((d) => d.embedding ?? []);
  if (vecs.length !== input.length)
    throw new Error(
      `embedding 数量不符：收到 ${vecs.length}，期望 ${input.length}`
    );
  for (const v of vecs) {
    if (v.length !== cfg.dim) {
      throw new Error(
        `embedding 维度不符：${v.length} != ${cfg.dim}（检查 EMBEDDING_MODEL_NAME / EMBEDDING_DIM，需与迁移 SQL 的 vector(${cfg.dim}) 一致）`
      );
    }
  }
  return vecs;
}

/** 无端点时的本地联调：sha256 链式扩展出的确定性归一化伪向量 */
export function mockVector(text: string, dim: number): number[] {
  const out = new Array<number>(dim);
  let seed = createHash('sha256').update(text).digest();
  let i = 0;
  while (i < dim) {
    for (let k = 0; k + 1 < seed.length && i < dim; k += 2) {
      out[i++] = ((seed[k] << 8) | seed[k + 1]) / 32767.5 - 1;
    }
    seed = createHash('sha256').update(seed).digest();
  }
  let n = 0;
  for (const x of out) n += x * x;
  const inv = n > 0 ? 1 / Math.sqrt(n) : 0;
  return out.map((x) => x * inv);
}
