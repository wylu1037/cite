import * as React from 'react';
import { cn } from '@/lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded-[4px] border border-zinc-200 dark:border-[#23252a] bg-zinc-100 dark:bg-[#141516] px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 dark:text-[#8a8f98] shadow-xs',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
