-- 手写迁移：pgvector 扩展 + 向量列 + hnsw 索引（Prisma 不会为 Unsupported 列生成这些）
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "Doc" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Doc_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Doc_path_key" ON "Doc"("path");

CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "ord" INTEGER NOT NULL,
    "heading" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "embedding" vector(4096) NOT NULL,
    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Chunk_docId_idx" ON "Chunk"("docId");
-- 注：Qwen3-Embedding-8B 原生 4096 维，超过 pgvector hnsw 对 vector 类型的 2000 维上限。
-- 当前数据规模（几百块）顺序扫描足够；日后若把维度截断到 <=2000（或换 halfvec <=4000）再补索引。

ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_docId_fkey"
  FOREIGN KEY ("docId") REFERENCES "Doc"("id") ON DELETE CASCADE ON UPDATE CASCADE;
