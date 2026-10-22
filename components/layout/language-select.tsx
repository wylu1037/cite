'use client';

import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import type { LanguageSelectProps } from 'fumadocs-ui/layouts/shared/slots/language-select';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const copy = {
  zh: '选择语言',
  en: 'Choose a language',
};

/**
 * 顶栏语言切换。fumadocs 自带的 LanguageSelect 弹层写死 min-w-[240px]，
 * 两个选项撑不满，看起来空了一大截；这里换成按内容收缩的版本。
 */
export function HeaderLanguageSelect({
  className,
  children,
}: LanguageSelectProps) {
  const { locale, locales = [], onChange } = useI18n();
  if (locales.length < 2) return null;

  const label = locale === 'en' ? copy.en : copy.zh;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className={(s) =>
          cn(
            buttonVariants({ variant: 'ghost' }),
            'gap-1.5 p-1.5',
            s.open && 'bg-fd-accent',
            className
          )
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto min-w-0 p-1">
        <p className="px-2 py-1 text-xs font-medium whitespace-nowrap text-fd-muted-foreground">
          {label}
        </p>
        {locales.map((item) => {
          const active = item.locale === locale;
          return (
            <button
              key={item.locale}
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => onChange?.(item.locale)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-start text-sm whitespace-nowrap transition-colors',
                active
                  ? 'bg-fd-primary/10 text-fd-primary'
                  : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
              )}
            >
              {item.name}
              {active && <Check className="size-3.5 shrink-0" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

/** 移动端菜单里的当前语言文本，与 HeaderLanguageSelect 配套使用 */
export function HeaderLanguageText(props: ComponentProps<'span'>) {
  const { locale, locales = [] } = useI18n();
  return (
    <span {...props}>
      {locales.find((item) => item.locale === locale)?.name}
    </span>
  );
}
