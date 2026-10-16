import { createHash, randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { docsDir, parseTitle } from '@/lib/admin/docs';
import { prisma } from '@/lib/db';
import { chunkDoc } from './chunk';
import { embedTexts } from './embedding';

export type ReindexStats = {
  docs: number;
  updated: number;
  skipped: number;
  deleted: number;
  chunks: number;
  errors: string[];
};

async function walk(dir: string, rel = ''): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === '(dev)' || e.name === 'meta.json') continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walk(path.join(dir, e.name), r)));
    else if (/\.(md|mdx)$/i.test(e.name)) out.push(r);
  }
  return out;
}

function docUrl(rel: string): string {
  const noExt = rel.replace(/\.(md|mdx)$/i, '');
  if (noExt === 'index') return '/docs';
  if (noExt.endsWith('/index')) return `/docs/${noExt.slice(0, -'/index'.length)}`;
  return `/docs/${noExt}`;
}

const vecLiteral = (v: number[]) => `[${v.map((x) => (Number.isFinite(x) ? x.toFixed(6) : '0')).join(',')}]`;

/** 全量重建：新增/变更的文档重切分重嵌入，磁盘上已删除的文档清理掉 */
export async function reindexAll(): Promise<ReindexStats> {
  const stats: ReindexStats = { docs: 0, updated: 0, skipped: 0, deleted: 0, chunks: 0, errors: [] };
  const files = await walk(docsDir);
  const seen = new Set<string>();

  for (const rel of files) {
    stats.docs++;
    seen.add(rel);
    try {
      const raw = await readFile(path.join(docsDir, rel), 'utf8');
      const hash = createHash('sha256').update(raw).digest('hex');
      const existing = await prisma.doc.findUnique({ where: { path: rel } });
      if (existing && existing.hash === hash) {
        stats.skipped++;
        continue;
      }

      const title = parseTitle(raw, rel);
      const url = docUrl(rel);
      const docId = existing?.id ?? randomUUID();
      const chunks = chunkDoc(raw, title);
      const vectors = await embedTexts(chunks.map((c) => `${c.heading}\n${c.content}`));

      await prisma.$transaction(async (tx) => {
        if (existing) {
          await tx.chunk.deleteMany({ where: { docId } });
          await tx.doc.update({ where: { id: docId }, data: { hash, title, url } });
        } else {
          await tx.doc.create({ data: { id: docId, path: rel, hash, title, url } });
        }
        for (let i = 0; i < chunks.length; i++) {
          await tx.$executeRaw`
            INSERT INTO "Chunk" ("id", "docId", "ord", "heading", "content", "embedding")
            VALUES (${randomUUID()}, ${docId}, ${chunks[i].ord}, ${chunks[i].heading}, ${chunks[i].content}, ${vecLiteral(vectors[i])}::vector)`;
        }
      });

      stats.updated++;
      stats.chunks += chunks.length;
    } catch (e) {
      stats.errors.push(`${rel}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const stale = await prisma.doc.findMany({ where: { path: { notIn: [...seen] } }, select: { id: true } });
  for (const s of stale) {
    await prisma.chunk.deleteMany({ where: { docId: s.id } });
    await prisma.doc.delete({ where: { id: s.id } });
    stats.deleted++;
  }
  return stats;
}
