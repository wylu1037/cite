'use client';

import { useTheme } from 'fumadocs-ui/provider/base';
import { Sun, Moon, Monitor, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function SidebarFooter() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(newTheme);
      });
    } else {
      setTheme(newTheme);
    }
  };

  const currentTheme = mounted ? theme : 'system';

  return (
    <div className="flex w-full flex-col gap-2 pt-1">
      {/* 现代化分段主题切换器 */}
      <div
        role="group"
        aria-label="切换主题"
        className="flex w-full items-center rounded-xl border border-zinc-200/80 bg-zinc-100 p-1 shadow-xs dark:border-linear-hairline dark:bg-linear-surface-2"
      >
        <button
          type="button"
          onClick={() => changeTheme('light')}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
            currentTheme === 'light'
              ? 'border border-zinc-200/60 bg-white font-semibold text-zinc-900 shadow-xs dark:border-zinc-700/50 dark:bg-linear-hairline dark:text-linear-ink'
              : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-linear-ink-subtle dark:hover:bg-linear-surface-3/60 dark:hover:text-linear-ink'
          }`}
          title="浅色模式"
        >
          <Sun className="size-3.5 shrink-0" />
          <span>浅色</span>
        </button>

        <button
          type="button"
          onClick={() => changeTheme('dark')}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
            currentTheme === 'dark'
              ? 'border border-zinc-200/60 bg-white font-semibold text-zinc-900 shadow-xs dark:border-zinc-700/50 dark:bg-linear-hairline dark:text-linear-ink'
              : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-linear-ink-subtle dark:hover:bg-linear-surface-3/60 dark:hover:text-linear-ink'
          }`}
          title="深色模式"
        >
          <Moon className="size-3.5 shrink-0" />
          <span>深色</span>
        </button>

        <button
          type="button"
          onClick={() => changeTheme('system')}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
            currentTheme === 'system'
              ? 'border border-zinc-200/60 bg-white font-semibold text-zinc-900 shadow-xs dark:border-zinc-700/50 dark:bg-linear-hairline dark:text-linear-ink'
              : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-linear-ink-subtle dark:hover:bg-linear-surface-3/60 dark:hover:text-linear-ink'
          }`}
          title="跟随系统"
        >
          <Monitor className="size-3.5 shrink-0" />
          <span>系统</span>
        </button>
      </div>

      {/* 底部快捷链接 */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-400 dark:text-zinc-500">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 py-0.5 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
        >
          <Settings className="size-3" />
          <span>管理后台</span>
        </Link>
        <span className="text-[11px] text-zinc-400/80 dark:text-zinc-600">
          知识库系统
        </span>
      </div>
    </div>
  );
}
