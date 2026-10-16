import * as React from 'react';
import { cn } from '@/lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded-[4px] border border-[#23252a] bg-[#141516] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#8a8f98] shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]',
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
