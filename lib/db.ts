import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/lib/generated/prisma/client';

const g = globalThis as typeof globalThis & { __kbPrisma?: PrismaClient };

/**
 * 进程级单例：与 lib/source 同理，Next 分包下本模块可能有多份实例，
 * 连接池必须全进程共享（否则 pg 连接数被悄悄放大）。
 */
export const prisma =
  g.__kbPrisma ??
  (g.__kbPrisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
  }));
