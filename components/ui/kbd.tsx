import * as React from 'react';
import { cn } from '@/lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded-[4px] border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 shadow-xs dark:border-linear-hairline dark:bg-linear-surface-2 dark:text-linear-ink-subtle',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
