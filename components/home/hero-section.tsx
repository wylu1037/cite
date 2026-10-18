import Link from 'next/link';
import { HeroSearch } from './hero-search';
import { InteractiveWorkbench } from './interactive-workbench';
import { BookOpen, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const POPULAR_PROMPTS = [
  '后台怎么新建并发布文档？',
  '本地开发如何一键启动？',
  'Docker Compose 部署步骤',
  '统一 API 错误码规范',
];

export function HeroSection() {
  return (
    <section className="relative pt-8 pb-12 md:pt-12 md:pb-16">
      {/* Top Status Bar */}
      <div className="mx-auto mb-10 max-w-6xl px-4 md:mb-12">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-xs text-zinc-500 dark:text-linear-ink-subtle">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              服务正常运行
            </span>
            <span className="hidden text-zinc-500 sm:inline dark:text-linear-ink-subtle">
              · 部门技术与业务知识底座
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-linear-ink-subtle">
            <span className="hidden sm:inline">RAG 向量检索就绪</span>
            <span className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600 dark:bg-linear-surface-2 dark:text-linear-ink-subtle">
              v1.4
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Split Grid: Left Text & Command / Right Interactive Workbench */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Authoritative Copy & Command Input */}
          <div className="space-y-6 lg:col-span-7">
            {/* Headline */}
            <h1 className="text-3xl leading-[1.2] font-semibold tracking-[-0.035em] text-balance text-zinc-950 sm:text-4xl md:text-5xl dark:text-linear-ink">
              构建团队一致的技术认知，
              <span className="mt-3 block text-2xl font-normal text-zinc-500 sm:text-3xl md:text-4xl dark:text-linear-ink-subtle">
                连接代码、架构与工程规范。
              </span>
            </h1>

            {/* Subhead */}
            <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-linear-ink-subtle">
              统一沉淀部门产品架构、API 约定、容器运维手册与团队工程规范。集成
              pgvector
              稠密向量语义检索与智能问答，让每一份文档都成为即搜即用的生产力。
            </p>

            {/* Search Box */}
            <div className="pt-1">
              <HeroSearch />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ variant: 'primary', size: 'default' }),
                  'min-h-11 gap-1.5'
                )}
              >
                <BookOpen className="h-4 w-4" />
                <span>查阅文档</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/ask"
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'default' }),
                  'min-h-11 gap-1.5 border-0'
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-linear-primary dark:text-linear-primary-hover" />
                <span>智能 AI 问答</span>
              </Link>

              <Link
                href="/admin"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'default' }),
                  'min-h-11 gap-1 text-zinc-500 dark:text-linear-ink-subtle'
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>后台管理</span>
              </Link>
            </div>

            {/* Quick Prompts Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-2 text-xs text-zinc-500 dark:text-linear-ink-subtle">
              <span className="text-xs text-zinc-500 dark:text-linear-ink-subtle">
                快捷检索:
              </span>
              {POPULAR_PROMPTS.map((prompt) => (
                <Link
                  key={prompt}
                  href={`/ask?q=${encodeURIComponent(prompt)}`}
                  className="inline-flex min-h-11 items-center rounded-md bg-zinc-100/70 px-3 py-2 text-xs text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-linear-primary dark:bg-linear-surface-1 dark:text-linear-ink-subtle dark:hover:bg-linear-surface-2 dark:hover:text-linear-primary-hover"
                >
                  {prompt}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Workbench Console */}
          <div className="lg:col-span-5">
            <InteractiveWorkbench />
          </div>
        </div>
      </div>
    </section>
  );
}
