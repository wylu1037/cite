import Link from 'next/link';
import { GitCommit, History, ArrowUpRight } from 'lucide-react';

const RECENT_CHANGES = [
  {
    version: 'v1.4',
    scope: 'docs(quickstart)',
    description: '完善本地一键启动与 Node/pnpm 依赖运行指引',
    time: '2 小时前',
    hash: '3f9a12c',
  },
  {
    version: 'v1.3',
    scope: 'feat(rag)',
    description: '集成 PostgreSQL pgvector 稠密语义切片与混合重排检索',
    time: '昨天',
    hash: '8b4d90e',
  },
  {
    version: 'v1.2',
    scope: 'docs(api)',
    description: '补充 RESTful 路由命名标准与统一业务错误码清单',
    time: '3 天前',
    hash: '1a7c45f',
  },
  {
    version: 'v1.1',
    scope: 'feat(admin)',
    description: '上线管理后台在线发布与历史快照一键差异对比回滚',
    time: '上周',
    hash: '5d2e78b',
  },
];

export function LivePulse() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-3 lg:gap-12">
        {/* Section Header */}
        <div className="flex flex-col items-start gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-balance text-zinc-950 sm:text-3xl dark:text-linear-ink">
            最新修订与发布动态
          </h2>

          <Link
            href="/admin"
            className="flex min-h-11 items-center gap-1 text-sm text-zinc-600 transition-colors hover:text-linear-primary dark:text-linear-ink-subtle dark:hover:text-linear-primary-hover"
          >
            <span>版本历史与后台</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Revisions group by proximity, with metadata below each description. */}
        <div className="space-y-6 lg:col-span-2">
          {RECENT_CHANGES.map((item) => (
            <div key={item.hash} className="flex items-start gap-4">
              <span className="mt-0.5 shrink-0 rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600 dark:bg-linear-surface-2 dark:text-linear-ink-subtle">
                {item.version}
              </span>

              <div className="min-w-0 space-y-2">
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-linear-ink">
                  {item.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-linear-ink-subtle">
                  <span className="font-mono text-xs text-linear-primary dark:text-linear-primary-hover">
                    {item.scope}
                  </span>
                  <span className="font-mono">{item.hash}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
