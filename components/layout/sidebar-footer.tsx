'use client';

import { useTheme } from 'fumadocs-ui/provider/base';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import {
  Check,
  ChevronDown,
  Languages,
  Monitor,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import {
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'motion/react';
import { useEffect, useId, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { triggerThemeTransition } from './theme-transition';

type ThemeValue = 'light' | 'dark' | 'system';

const copy = {
  zh: {
    theme: '切换主题',
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    language: '切换语言',
    admin: '管理后台',
  },
  en: {
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    admin: 'Admin',
  },
};

const THEMES = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
] as const;

/** 胶囊内各分段共用的按钮底样式：同高、同圆角、同按压反馈 */
const segment =
  'inline-flex h-7 cursor-pointer items-center justify-center rounded-md text-fd-muted-foreground transition-[color,background-color,scale] duration-150 ease-out hover:bg-fd-accent hover:text-fd-accent-foreground active:scale-[0.96] dark:text-linear-ink-subtle dark:hover:bg-linear-surface-3 dark:hover:text-linear-ink';

function Divider() {
  return (
    <span
      aria-hidden
      className="mx-0.5 h-4 w-px shrink-0 bg-fd-border dark:bg-linear-hairline"
    />
  );
}

export function SidebarFooter({ locale }: { locale: string }) {
  const t = locale === 'en' ? copy.en : copy.zh;

  // 与顶部搜索框同一套外观（圆角、描边、底色），首尾呼应
  return (
    <div className="flex h-9 w-full items-center rounded-lg border bg-fd-secondary/50 p-1 dark:border-linear-hairline dark:bg-linear-surface-1">
      <Link
        href="/admin"
        aria-label={t.admin}
        title={t.admin}
        className={cn(segment, 'size-7 shrink-0')}
      >
        <Settings className="size-4" />
      </Link>
      <Divider />
      <LanguageSwitch label={t.language} />
      <Divider />
      <ThemeSwitch t={t} />
    </div>
  );
}

function LanguageSwitch({ label }: { label: string }) {
  const { locale, locales = [], onChange } = useI18n();
  if (locales.length < 2) return <span className="flex-1" />;

  const current = locales.find((item) => item.locale === locale)?.name;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className={(s) =>
          cn(
            segment,
            'group min-w-0 flex-1 justify-start gap-1.5 px-2 text-xs font-medium',
            s.open &&
              'bg-fd-accent text-fd-accent-foreground dark:bg-linear-surface-3 dark:text-linear-ink'
          )
        }
      >
        <Languages className="size-4 shrink-0" />
        <span className="truncate">{current}</span>
        <ChevronDown className="ms-auto size-3 shrink-0 opacity-60 transition-transform duration-200 ease-out group-data-popup-open:rotate-180" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto min-w-(--anchor-width) p-1"
        aria-label={label}
      >
        {locales.map((item) => {
          const active = item.locale === locale;
          return (
            <button
              key={item.locale}
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => onChange?.(item.locale)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-start text-sm transition-colors',
                active
                  ? 'text-fd-primary'
                  : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
              )}
            >
              {item.name}
              {active && <Check className="size-3.5" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function ThemeSwitch({ t }: { t: (typeof copy)['zh'] }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const groupId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeTheme = (next: ThemeValue, e: MouseEvent<HTMLButtonElement>) => {
    if (next === theme) return;

    const nextResolved =
      next === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : next;

    triggerThemeTransition({
      element: e.currentTarget,
      nextResolved,
      resolvedTheme,
      apply: () => setTheme(next),
      reduceMotion: Boolean(reduceMotion),
    });
  };

  const current = mounted ? theme : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={groupId}>
        <div
          role="group"
          aria-label={t.theme}
          className="flex shrink-0 items-center gap-0.5"
        >
          {THEMES.map(({ value, icon: Icon }) => {
            const active = current === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                aria-label={t[value]}
                title={t[value]}
                onClick={(e) => changeTheme(value, e)}
                className={cn(
                  segment,
                  'relative size-7',
                  // 选中项由滑块提供底色，去掉悬停底色避免叠色
                  active &&
                    'text-fd-foreground hover:bg-transparent dark:text-linear-ink dark:hover:bg-transparent'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="theme-pill"
                    aria-hidden
                    className="absolute inset-0 rounded-md bg-fd-background shadow-xs ring-1 ring-fd-border/70 dark:bg-linear-hairline dark:ring-zinc-700/50"
                    transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                  />
                )}
                <Icon className="relative size-3.5" />
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
