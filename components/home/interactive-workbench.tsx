'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Terrain, Stack, Cabinet, Branches } from '@lucasmarkes/hairline/react';
import { Marquee } from '@/components/ui/marquee';

interface WorkbenchItem {
  id: string;
  tag: string;
  command: string;
  resultHighlight: string;
  resultDesc: string;
  href: string;
  Figure: typeof Terrain;
}

const ITEMS: WorkbenchItem[] = [
  {
    id: 'rag',
    tag: 'RAG · 语义检索 0.91',
    command: '$ ask "一键启动服务"',
    resultHighlight: 'pnpm dev',
    resultDesc: '实时响应 · 免构建热重载',
    href: '/ask?q=一键启动服务',
    Figure: Terrain,
  },
  {
    id: 'api',
    tag: 'API · SSE 流式契约',
    command: '$ curl -X POST /api/chat',
    resultHighlight: '200 OK · SSE Stream',
    resultDesc: '结构化流式 · 智能段落溯源',
    href: '/docs/develop',
    Figure: Stack,
  },
  {
    id: 'ops',
    tag: '运维 · 容器拓扑',
    command: '$ docker compose up -d',
    resultHighlight: 'pgvector: 1536-dim online',
    resultDesc: '双容器编排 · 零停机迁移',
    href: '/docs/ops',
    Figure: Cabinet,
  },
  {
    id: 'gitops',
    tag: 'GitOps · 自动化构建',
    command: '$ git push origin main',
    resultHighlight: 'docs synced · v1.4',
    resultDesc: '文档自动索引 · 向量增量同步',
    href: '/docs',
    Figure: Branches,
  },
];

function WorkbenchCard({ item }: { item: WorkbenchItem }) {
  const Fig = item.Figure;

  return (
    <Link
      href={item.href}
      className="group/card relative flex w-full flex-col gap-3 overflow-hidden rounded-xl bg-white p-4 transition-colors duration-200 hover:bg-zinc-50 sm:p-5 dark:bg-linear-surface-2 dark:hover:bg-linear-surface-3"
    >
      {/* Category and navigation affordance */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 dark:text-linear-ink-subtle">
          <span className="h-1.5 w-1.5 rounded-full bg-linear-primary" />
          <span className="truncate font-medium">{item.tag}</span>
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-linear-ink-subtle" />
      </div>

      {/* Main Split: Code Block on Left & Hairline 3D Graphic on Right (STRETCH & PERFECTLY ALIGNED) */}
      <div className="grid grid-cols-12 items-stretch gap-3">
        {/* Left: Mini Terminal Code Block (8 cols on desktop) */}
        <div className="col-span-7 flex min-w-0 flex-col justify-between overflow-hidden font-mono text-xs sm:col-span-8">
          {/* Command Prompt Line */}
          <div className="flex items-center gap-1.5 py-2 text-zinc-800 dark:text-zinc-200">
            <span className="font-bold text-linear-primary select-none">
              &gt;
            </span>
            <span className="truncate font-semibold">{item.command}</span>
          </div>

          {/* Output Execution Result */}
          <div className="space-y-2 pt-3 pb-2">
            <div className="truncate font-mono text-xs font-bold text-linear-primary sm:text-sm dark:text-linear-primary-hover">
              {item.resultHighlight}
            </div>
            <div className="font-sans text-xs leading-relaxed text-zinc-500 dark:text-linear-ink-muted">
              {item.resultDesc}
            </div>
          </div>
        </div>

        {/* The figure shares the card surface with the command. */}
        <div className="col-span-5 flex items-center justify-center overflow-hidden p-2 transition-transform duration-200 group-hover/card:scale-[1.03] sm:col-span-4">
          <Fig
            play
            intensity={0.6}
            className="pointer-events-auto h-full min-h-19 w-full"
          />
        </div>
      </div>
    </Link>
  );
}

export function InteractiveWorkbench() {
  return (
    <div className="relative flex h-115 w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-zinc-100/70 p-3 dark:bg-linear-surface-1">
      <Marquee
        vertical
        pauseOnHover
        repeat={3}
        className="w-full [--duration:26s] focus-within:[&_.animate-marquee-vertical]:[animation-play-state:paused] motion-reduce:[&_.animate-marquee-vertical]:animate-none"
      >
        {ITEMS.map((item) => (
          <WorkbenchCard key={item.id} item={item} />
        ))}
      </Marquee>

      {/* Top and Bottom Gradient Fade Masks for authentic marquee look */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-linear-to-b from-zinc-100 to-transparent dark:from-linear-surface-1" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-zinc-100 to-transparent dark:from-linear-surface-1" />
    </div>
  );
}
