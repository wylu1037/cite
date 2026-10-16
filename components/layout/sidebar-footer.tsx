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
    <div className="flex flex-col gap-2 pt-1 w-full">
      {/* 现代化分段主题切换器 */}
      <div
        role="group"
        aria-label="切换主题"
        className="flex items-center w-full p-1 rounded-xl bg-zinc-100 dark:bg-[#141516] border border-zinc-200/80 dark:border-[#23252a] shadow-xs"
      >
        <button
          type="button"
          onClick={() => changeTheme('light')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
            currentTheme === 'light'
              ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-semibold dark:bg-[#23252a] dark:text-[#f7f8f8] dark:border-zinc-700/50'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:text-[#8a8f98] dark:hover:text-[#f7f8f8] dark:hover:bg-[#18191a]/60'
          }`}
          title="浅色模式"
        >
          <Sun className="size-3.5 shrink-0" />
          <span>浅色</span>
        </button>

        <button
          type="button"
          onClick={() => changeTheme('dark')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
            currentTheme === 'dark'
              ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-semibold dark:bg-[#23252a] dark:text-[#f7f8f8] dark:border-zinc-700/50'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:text-[#8a8f98] dark:hover:text-[#f7f8f8] dark:hover:bg-[#18191a]/60'
          }`}
          title="深色模式"
        >
          <Moon className="size-3.5 shrink-0" />
          <span>深色</span>
        </button>

        <button
          type="button"
          onClick={() => changeTheme('system')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
            currentTheme === 'system'
              ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60 font-semibold dark:bg-[#23252a] dark:text-[#f7f8f8] dark:border-zinc-700/50'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 dark:text-[#8a8f98] dark:hover:text-[#f7f8f8] dark:hover:bg-[#18191a]/60'
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
          className="inline-flex items-center gap-1.5 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors py-0.5"
        >
          <Settings className="size-3" />
          <span>管理后台</span>
        </Link>
        <span className="text-[11px] text-zinc-400/80 dark:text-zinc-600">知识库系统</span>
      </div>
    </div>
  );
}
