import Link from 'next/link';
import { BookOpen, Sparkles } from 'lucide-react';
import { Brand } from '@/components/layout/brand';
import { AdminNav } from '@/components/layout/admin-nav';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-linear-canvas text-linear-ink selection:bg-linear-primary selection:text-white">
      {/* Top sticky Linear navigation bar */}
      <header className="sticky top-0 z-40 w-full border-b border-linear-hairline bg-linear-canvas/85 backdrop-blur-lg">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4 md:gap-6">
            <Link
              href="/admin"
              className="flex shrink-0 items-center gap-2.5 text-sm font-semibold"
            >
              <Brand locale="zh" />
              <span className="hidden items-center gap-2.5 md:flex">
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-linear-hairline"
                />
                <span className="font-medium text-linear-ink-subtle">
                  管理后台
                </span>
              </span>
            </Link>

            <AdminNav />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/docs"
              target="_blank"
              rel="noreferrer"
              aria-label="前台文档"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'rounded-lg dark:bg-linear-surface-1'
              )}
            >
              <BookOpen className="h-3.5 w-3.5 text-linear-ink-subtle" />
              <span className="hidden sm:inline">前台文档</span>
            </Link>
            <Link
              href="/ask"
              aria-label="Ask AI"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'sm' }),
                'rounded-lg dark:border-linear-primary/30 dark:bg-linear-primary/10 dark:text-linear-primary-hover dark:hover:border-linear-primary/40 dark:hover:bg-linear-primary/20'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
