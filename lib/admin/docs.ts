import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, rm, stat, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { contentDir, invalidateDoc } from '@/lib/source';

const exec = promisify(execFile);

export const contentRoot = path.resolve(contentDir);
export const docsDir = path.join(contentRoot, 'docs');
export const draftsDir = path.join(contentRoot, 'drafts');
export const mediaDir = path.join(contentRoot, 'media');

export class AdminError extends Error {}

/** 规范化并防目录逃逸；只允许 md/mdx */
function safeRel(rel: string): string {
  const norm = rel.replace(/\\/g, '/').replace(/^\/+/, '');
  const segs = norm.split('/');
  if (!norm || segs.some((s) => !s || s === '..' || s.startsWith('.'))) {
    throw new AdminError('非法路径');
  }
  if (!/\.(md|mdx)$/i.test(norm)) throw new AdminError('只支持 .md / .mdx 文件');
  return norm;
}

const absDoc = (rel: string) => path.join(docsDir, rel);
const absDraft = (rel: string) => path.join(draftsDir, rel);

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export function parseTitle(content: string, fallback: string): string {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const t = fm[1].match(/^title:\s*(.+)$/m);
    if (t) return t[1].trim().replace(/^['"]|['"]$/g, '');
  }
  const h = content.match(/^#\s+(.+)$/m);
  return h ? h[1].trim() : fallback;
}

async function walk(dir: string, rel = ''): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === '(dev)') continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walk(path.join(dir, e.name), r)));
    else if (/\.(md|mdx)$/i.test(e.name)) out.push(r);
  }
  return out;
}

export type DocEntry = {
  path: string;
  title: string;
  updatedAt: number;
  hasDraft: boolean;
  published: boolean;
};

export async function listDocs(): Promise<DocEntry[]> {
  const [docs, drafts] = await Promise.all([walk(docsDir), walk(draftsDir)]);
  const draftSet = new Set(drafts);
  const all = Array.from(new Set([...docs, ...drafts])).sort((a, b) => a.localeCompare(b, 'zh'));
  const out: DocEntry[] = [];
  for (const r of all) {
    const published = docs.includes(r);
    const src = published ? absDoc(r) : absDraft(r);
    const [content, st] = await Promise.all([readFile(src, 'utf8'), stat(src)]);
    out.push({
      path: r,
      title: parseTitle(content, r),
      updatedAt: st.mtimeMs,
      hasDraft: draftSet.has(r),
      published,
    });
  }
  return out;
}

export async function readDoc(rel: string) {
  const r = safeRel(rel);
  const published = await exists(absDoc(r));
  const draft = await exists(absDraft(r));
  if (!published && !draft) throw new AdminError('文档不存在');
  const content = await readFile(draft ? absDraft(r) : absDoc(r), 'utf8');
  return { path: r, content, draft, published };
}

export async function saveDraft(rel: string, content: string) {
  const r = safeRel(rel);
  await mkdir(path.dirname(absDraft(r)), { recursive: true });
  await writeFile(absDraft(r), content, 'utf8');
  return { ok: true, path: r };
}

// ---------- git 版本（以 contentRoot 为工作目录，自动发现所属仓库） ----------

async function git(args: string[]): Promise<string> {
  const { stdout } = await exec('git', args, { cwd: contentRoot, maxBuffer: 10 * 1024 * 1024 });
  return stdout.trim();
}

async function ensureRepo() {
  try {
    await git(['rev-parse', '--git-dir']);
  } catch {
    await git(['init', '-b', 'main']);
    await git(['config', 'user.name', 'kb-admin']).catch(() => {});
    await git(['config', 'user.email', 'kb-admin@local']).catch(() => {});
    await git(['add', '-A']).catch(() => {});
    await git(['commit', '-m', 'chore(content): initialize content repository', '--allow-empty']).catch(() => {});
  }
}

export async function commitAll(message: string) {
  await ensureRepo();
  await git(['add', '-A', '--', '.']);
  await git(['commit', '-m', message, '--', '.']).catch(() => {}); // 无变化时静默
}

export async function publish(rel: string) {
  const r = safeRel(rel);
  const src = absDraft(r);
  const dst = absDoc(r);
  if (await exists(src)) {
    await mkdir(path.dirname(dst), { recursive: true });
    await rename(src, dst);
  } else if (!(await exists(dst))) {
    throw new AdminError('草稿不存在，无法发布');
  }
  await commitAll(`docs(content): publish ${r}`);
  try {
    invalidateDoc(r);
  } catch {}
  return { ok: true, path: r };
}

export async function deleteDoc(rel: string) {
  const r = safeRel(rel);
  await rm(absDoc(r), { force: true });
  await rm(absDraft(r), { force: true });
  await commitAll(`docs(content): delete ${r}`);
  try {
    invalidateDoc(r);
  } catch {}
  return { ok: true, path: r };
}

export type HistoryEntry = { rev: string; date: string; message: string };

export async function listHistory(rel: string): Promise<HistoryEntry[]> {
  const r = safeRel(rel);
  await ensureRepo();
  // 注意：git log 的 pathspec 相对当前工作目录（contentRoot），
  // 不用 --show-prefix 拼仓库根相对路径（那是 git show rev:path 的格式）。
  const out = await git([
    'log',
    '--follow',
    '--date=format:%Y-%m-%d %H:%M',
    '--pretty=format:%h|%ad|%s',
    '--',
    `docs/${r}`,
  ]).catch(() => '');
  return out
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const [rev, date, ...rest] = l.split('|');
      return { rev, date, message: rest.join('|') };
    });
}

export async function readVersion(rel: string, rev: string) {
  const r = safeRel(rel);
  if (!/^[0-9a-f]{4,40}$/i.test(rev)) throw new AdminError('非法版本号');
  const prefix = await git(['rev-parse', '--show-prefix']);
  const content = await git(['show', `${rev}:${prefix}docs/${r}`]);
  return { content: content ? `${content}\n` : '' };
}

export async function revert(rel: string, rev: string) {
  const r = safeRel(rel);
  const { content } = await readVersion(r, rev);
  if (!content) throw new AdminError('该版本内容为空');
  await mkdir(path.dirname(absDoc(r)), { recursive: true });
  await writeFile(absDoc(r), content, 'utf8');
  await rm(absDraft(r), { force: true });
  await commitAll(`docs(content): revert ${r} to ${rev}`);
  try {
    invalidateDoc(r);
  } catch {}
  return { ok: true, path: r, rev };
}

// ---------- 图片 ----------

export async function saveMedia(originalName: string, data: Buffer): Promise<string> {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'file';
  const name = `${Date.now()}-${safe}`;
  await mkdir(mediaDir, { recursive: true });
  await writeFile(path.join(mediaDir, name), data);
  return name;
}

export function resolveMedia(name: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) throw new AdminError('非法文件名');
  return path.join(mediaDir, name);
}
