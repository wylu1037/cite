'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Plus, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  {
    href: '/admin',
    label: '文档列表',
    icon: FileText,
    isActive: (p: string) => p === '/admin' || p.startsWith('/admin/edit'),
  },
  {
    href: '/admin/new',
    label: '新建文档',
    icon: Plus,
    isActive: (p: string) => p === '/admin/new',
  },
  {
    href: '/admin/meta',
    label: '侧栏配置',
    icon: FolderTree,
    isActive: (p: string) => p === '/admin/meta',
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 items-center gap-0.5 md:gap-1">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.isActive(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs transition-colors md:min-h-0 md:py-1',
              active
                ? 'text-linear-primary-hover'
                : 'text-linear-ink-subtle hover:bg-linear-surface-2 hover:text-linear-ink'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
