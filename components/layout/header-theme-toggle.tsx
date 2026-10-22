'use client';

import { useTheme } from 'fumadocs-ui/provider/base';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useReducedMotion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/utils';
import { triggerThemeTransition } from './theme-transition';
import type { MouseEvent } from 'react';

const copy = {
  zh: '切换主题',
  en: 'Toggle theme',
};

export function HeaderThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();

  const label = locale === 'en' ? copy.en : copy.zh;

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';

    triggerThemeTransition({
      element: e.currentTarget,
      nextResolved: next,
      resolvedTheme,
      apply: () => setTheme(next),
      reduceMotion: Boolean(reduceMotion),
    });
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggle}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'size-9 cursor-pointer text-fd-muted-foreground transition-[color,transform] hover:text-fd-accent-foreground active:scale-95',
        className
      )}
    >
      <Sun className="size-4.5 dark:hidden" />
      <Moon className="hidden size-4.5 dark:block" />
    </button>
  );
}
