#!/usr/bin/env node
// 极简迁移执行器：按序执行 prisma/migrations/*/migration.sql，并记录到 _kb_migrations 表。
// 本项目的迁移是手写 SQL（pgvector 扩展、vector 列、hnsw 索引 Prisma 生成不了），
// 因此部署链路里不依赖 `prisma migrate` 运行时，只用 pg 直连执行。
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  // 本地开发便捷：尝试从 .env 读（dotenv 是 devDependency，生产容器里变量由 compose 注入）
  try {
    const { config } = await import('dotenv');
    config();
  } catch {}
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[migrate] 缺少 DATABASE_URL');
  process.exit(1);
}

const dir = path.join(process.cwd(), 'prisma', 'migrations');
const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
} catch (e) {
  const detail =
    e && e.errors
      ? e.errors.map((x) => x.message).join('; ')
      : e instanceof Error
        ? e.message
        : String(e);
  console.error(`[migrate] 连接数据库失败：${detail || e?.name || '未知错误'}`);
  process.exit(1);
}
let applied = 0;
try {
  await client.query(
    'CREATE TABLE IF NOT EXISTS _kb_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())'
  );
  await client.query('SELECT pg_advisory_lock(721347)'); // 防多实例并发执行
  const entries = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  for (const name of entries) {
    const done = await client.query(
      'SELECT 1 FROM _kb_migrations WHERE name = $1',
      [name]
    );
    if (done.rowCount) continue;
    const sql = await readFile(path.join(dir, name, 'migration.sql'), 'utf8');
    console.log(`[migrate] 应用 ${name}`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO _kb_migrations (name) VALUES ($1)', [
        name,
      ]);
      await client.query('COMMIT');
      applied++;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  }
  console.log(
    applied ? `[migrate] 完成，应用了 ${applied} 个迁移` : '[migrate] 已是最新'
  );
} finally {
  await client.query('SELECT pg_advisory_unlock(721347)').catch(() => {});
  await client.end();
}
