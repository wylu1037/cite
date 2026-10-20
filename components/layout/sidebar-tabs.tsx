'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SidebarTab = {
  url: string;
  text: string;
  icon: 'docs' | 'ask';
};

const ICONS = { docs: BookOpen, ask: Sparkles };

const isActive = (pathname: string, url: string) =>
  pathname === url || pathname.startsWith(`${url}/`);

/**
 * 文档 / 智能问答 两个产品区的切换器，放在搜索框下方。
 * 刻意不做滑块动画：两侧是不同布局，切换即整页跳转，动画看不到收尾。
 */
export function SidebarTabs({
  tabs,
  label,
}: {
  tabs: SidebarTab[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-0.5 rounded-lg bg-fd-secondary/70 p-0.5 dark:bg-linear-surface-1"
    >
      {tabs.map(({ url, text, icon }) => {
        const active = isActive(pathname, url);
        const Icon = ICONS[icon];
        return (
          <Link
            key={url}
            href={url}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-[13px] font-medium transition-[color,background-color,scale] duration-150 ease-out active:scale-[0.97]',
              active
                ? 'bg-fd-background text-fd-foreground shadow-xs ring-1 ring-fd-border/70 dark:bg-linear-hairline dark:text-linear-ink dark:ring-zinc-700/50'
                : 'text-fd-muted-foreground hover:text-fd-accent-foreground dark:text-linear-ink-subtle dark:hover:text-linear-ink'
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {text}
          </Link>
        );
      })}
    </nav>
  );
}
