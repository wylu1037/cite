import Link from 'next/link';
import { BookOpen, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { brandOf } from '@/lib/shared';

export function CtaFooter({ locale }: { locale: string }) {
  const brand = brandOf(locale);
  return (
    <footer className="pb-8 md:pb-12">
      {/* Pre-footer Call to Action */}
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-balance text-zinc-950 sm:text-3xl dark:text-linear-ink">
              开始探索团队知识资产或贡献新文档
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-linear-ink-subtle">
              支持全键盘快速操作。文档由各板块负责人在后台维护，修改与发布即时生效。
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/docs"
              className={cn(
                buttonVariants({ variant: 'primary', size: 'default' }),
                'min-h-11 gap-1.5'
              )}
            >
              <BookOpen className="h-4 w-4" />
              <span>探索全部文档</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'default' }),
                'min-h-11 gap-1.5 border-0'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
              <span>进入管理后台</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links & System Details */}
      <div className="py-8 text-xs">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 text-zinc-500 md:grid-cols-3 dark:text-linear-ink-subtle">
          {/* Brand & Subtitle */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-zinc-800 dark:text-linear-ink-muted">
              {brand.name}
            </span>
            <p>{brand.tagline}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
              <span>Next.js 16</span>
              <span>Fumadocs</span>
              <span>pgvector</span>
            </div>
          </div>

          {/* Quick Links */}
          <nav
            aria-label="页脚导航"
            className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 md:col-span-2 lg:grid-cols-4"
          >
            <Link
              href="/docs/quickstart"
              className="inline-flex min-h-11 items-center transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              快速上手
            </Link>
            <Link
              href="/docs/product"
              className="inline-flex min-h-11 items-center transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              产品文档
            </Link>
            <Link
              href="/docs/develop"
              className="inline-flex min-h-11 items-center transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              开发与接口
            </Link>
            <Link
              href="/docs/ops"
              className="inline-flex min-h-11 items-center transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              部署运维
            </Link>
            <Link
              href="/docs/faq"
              className="inline-flex min-h-11 items-center transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              团队规范
            </Link>
            <Link
              href="/ask"
              className="inline-flex min-h-11 items-center transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              智能问答
            </Link>
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              后台管理
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
