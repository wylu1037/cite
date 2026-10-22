'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  FolderTree,
  BookOpen,
  Sparkles,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Brand } from '@/components/layout/brand';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
  external?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  {
    href: '/admin',
    label: '文档管理',
    icon: FileText,
    isActive: (p) => p === '/admin' || p.startsWith('/admin/edit'),
  },
  {
    href: '/admin/new',
    label: '新建文档',
    icon: Plus,
    isActive: (p) => p === '/admin/new',
  },
  {
    href: '/admin/meta',
    label: '目录与侧栏',
    icon: FolderTree,
    isActive: (p) => p === '/admin/meta',
  },
];

const EXTERNAL_NAV: NavItem[] = [
  {
    href: '/docs',
    label: '前台文档',
    icon: BookOpen,
    isActive: () => false,
    external: true,
  },
  {
    href: '/ask',
    label: 'Ask AI 问答',
    icon: Sparkles,
    isActive: () => false,
    external: true,
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  // 登录页保持纯净居中，不展示管理系统工作台外壳
  if (isLoginPage) {
    return (
      <div className="dark min-h-screen bg-linear-canvas text-linear-ink selection:bg-linear-primary selection:text-white">
        {children}
      </div>
    );
  }

  // 侧边栏内容：与 Docs 侧边栏（宽度 290px、内边距、字体、高亮态及 Footer 胶囊）完全对齐
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-linear-surface-1/40 p-3 backdrop-blur-xl">
      <div className="flex flex-col">
        {/* Workspace Brand (与 Docs 侧边栏完全对齐，纯粹克制) */}
        <div className="flex h-11 items-center justify-between px-2">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight transition-opacity hover:opacity-90"
            onClick={() => setMobileOpen(false)}
          >
            <Brand locale="zh" />
          </Link>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-1 text-linear-ink-subtle hover:bg-linear-surface-2 hover:text-linear-ink md:hidden"
              aria-label="关闭侧栏"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections (与 Docs 侧边栏同款条目样式与分组小标题) */}
        <div className="space-y-5 px-1 py-1">
          {/* Group 1: Content Management */}
          <div>
            <div className="px-2 pb-1.5 text-xs font-semibold tracking-wider text-linear-ink-tertiary uppercase">
              内容管理
            </div>
            <nav className="space-y-0.5">
              {PRIMARY_NAV.map((item) => {
                const Icon = item.icon;
                const active = item.isActive(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group flex h-8 items-center justify-between rounded-md px-2.5 text-xs font-medium transition-[color,background-color,scale] duration-150 ease-out active:scale-[0.98]',
                      active
                        ? 'bg-linear-surface-3 text-linear-ink shadow-xs ring-1 ring-zinc-700/50'
                        : 'text-linear-ink-subtle hover:bg-linear-surface-2 hover:text-linear-ink'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          active
                            ? 'text-linear-primary-hover'
                            : 'text-linear-ink-tertiary group-hover:text-linear-ink'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-linear-primary shadow-[0_0_8px_rgba(94,106,210,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Public Portals */}
          <div>
            <div className="px-2 pb-1.5 text-xs font-semibold tracking-wider text-linear-ink-tertiary uppercase">
              前台快捷入口
            </div>
            <nav className="space-y-0.5">
              {EXTERNAL_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-8 items-center justify-between rounded-md px-2.5 text-xs font-medium text-linear-ink-subtle transition-[color,background-color,scale] duration-150 ease-out hover:bg-linear-surface-2 hover:text-linear-ink active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-linear-ink-tertiary group-hover:text-linear-ink" />
                      <span>{item.label}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-linear-ink-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar Footer: 与 Docs 侧边栏 Footer 胶囊同款规格 (高 36px, 圆角 8px, 微边框) */}
      <div className="mt-auto pt-2">
        <div className="flex h-9 w-full items-center justify-between rounded-lg border border-linear-hairline bg-linear-surface-1 p-1 text-xs">
          {/* 左侧：管理员在线呼吸状态 */}
          <div className="flex items-center gap-2 px-1.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="truncate text-xs font-medium text-linear-ink">
              管理员在线
            </span>
          </div>

          {/* 右侧操作按钮组 */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Link
              href="/docs"
              target="_blank"
              rel="noreferrer"
              title="查看前台文档"
              aria-label="查看前台文档"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-linear-ink-subtle transition-[color,background-color] duration-150 hover:bg-linear-surface-3 hover:text-linear-ink"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </Link>

            <span
              aria-hidden
              className="mx-0.5 h-3.5 w-px shrink-0 bg-linear-hairline"
            />

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="退出登录"
              aria-label="退出登录"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-linear-ink-subtle transition-[color,background-color] duration-150 hover:bg-red-500/15 hover:text-red-400 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dark min-h-screen bg-linear-canvas text-linear-ink selection:bg-linear-primary selection:text-white">
      {/* Desktop Fixed Sidebar: 宽度 290px 精确对齐 Docs 侧栏 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72.5 border-r border-linear-hairline md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 flex w-72.5 flex-col border-r border-linear-hairline bg-linear-canvas shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Workspace Frame: 左内边距 290px 紧贴侧栏 */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-72.5">
        {/* Mobile-only Header Bar (桌面端隐藏) */}
        <div className="flex h-12 w-full items-center justify-between border-b border-linear-hairline bg-linear-canvas/80 px-4 backdrop-blur-md md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-linear-hairline text-linear-ink-subtle hover:bg-linear-surface-2 hover:text-linear-ink"
            aria-label="打开侧边导航"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Brand locale="zh" />
          </div>
          <div className="w-8" />
        </div>

        {/* Workspace Canvas (Full height, top-aligned) */}
        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  );
}
