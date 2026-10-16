import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { invalidateDoc } from '@/lib/source';
import { AdminError, commitAll, docsDir, parseTitle } from './docs';

/** '' 表示根目录；拒绝点开头段与 .. */
function safeDir(dir: string): string {
  const norm = dir.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!norm) return '';
  const segs = norm.split('/');
  if (segs.some((s) => !s || s === '..' || s.startsWith('.'))) throw new AdminError('非法目录');
  return norm;
}

export async function listMetaDirs(): Promise<string[]> {
  const out: string[] = [''];
  async function rec(rel: string) {
    const list = await readdir(path.join(docsDir, rel), { withFileTypes: true }).catch(() => []);
    for (const e of list) {
      if (!e.isDirectory() || e.name.startsWith('.') || e.name === '(dev)') continue;
      const r = rel ? `${rel}/${e.name}` : e.name;
      out.push(r);
      await rec(r);
    }
  }
  await rec('');
  return out;
}

async function dirTitle(absDir: string, fallback: string): Promise<string> {
  try {
    const meta = JSON.parse(await readFile(path.join(absDir, 'meta.json'), 'utf8')) as { title?: unknown };
    if (typeof meta.title === 'string' && meta.title) return meta.title;
  } catch {}
  for (const f of ['index.mdx', 'index.md']) {
    try {
      return parseTitle(await readFile(path.join(absDir, f), 'utf8'), fallback);
    } catch {}
  }
  return fallback;
}

export type MetaEntry = { name: string; type: 'page' | 'dir'; title: string };

export async function readMeta(dirRaw: string) {
  const dir = safeDir(dirRaw);
  const absDir = path.join(docsDir, dir);
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(await readFile(path.join(absDir, 'meta.json'), 'utf8')) as Record<string, unknown>;
  } catch {}
  const entries: MetaEntry[] = [];
  const list = await readdir(absDir, { withFileTypes: true }).catch(() => []);
  for (const e of list.sort((a, b) => a.name.localeCompare(b.name, 'zh'))) {
    if (e.name.startsWith('.') || e.name === '(dev)' || e.name === 'meta.json') continue;
    if (e.isDirectory()) {
      entries.push({ name: e.name, type: 'dir', title: await dirTitle(path.join(absDir, e.name), e.name) });
    } else if (/\.(md|mdx)$/i.test(e.name)) {
      const content = await readFile(path.join(absDir, e.name), 'utf8');
      entries.push({ name: e.name.replace(/\.(md|mdx)$/i, ''), type: 'page', title: parseTitle(content, e.name) });
    }
  }
  return { dir, meta, entries };
}

const META_FIELDS = ['title', 'pages', 'pagesIndex', 'description', 'root', 'defaultOpen', 'collapsible', 'icon'] as const;

export async function saveMeta(dirRaw: string, meta: unknown) {
  const dir = safeDir(dirRaw);
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) throw new AdminError('meta 必须是对象');
  const src = meta as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of META_FIELDS) {
    if (k in src && src[k] !== undefined && src[k] !== '') out[k] = src[k];
  }
  if (out.pages && (!Array.isArray(out.pages) || out.pages.some((p) => typeof p !== 'string'))) {
    throw new AdminError('pages 必须是字符串数组');
  }
  for (const k of ['title', 'pagesIndex', 'description', 'icon'] as const) {
    if (k in out && typeof out[k] !== 'string') throw new AdminError(`${k} 必须是字符串`);
  }
  if ('root' in out && typeof out.root !== 'boolean' && typeof out.root !== 'string') {
    throw new AdminError('root 必须是布尔或字符串');
  }
  for (const k of ['defaultOpen', 'collapsible'] as const) {
    if (k in out && typeof out[k] !== 'boolean') throw new AdminError(`${k} 必须是布尔`);
  }
  const rel = dir ? `${dir}/meta.json` : 'meta.json';
  await mkdir(path.join(docsDir, dir), { recursive: true });
  await writeFile(path.join(docsDir, rel), `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  await commitAll(`docs(meta): update sidebar ${rel}`);
  try {
    invalidateDoc(rel);
  } catch {}
  return { ok: true, dir, meta: out };
}
