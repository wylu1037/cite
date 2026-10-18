import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-9 w-full cursor-pointer appearance-none rounded-[8px] border border-zinc-200 bg-white py-1.5 pr-8 pl-3 text-sm text-zinc-900 transition-colors dark:border-linear-hairline dark:bg-linear-surface-1 dark:text-linear-ink',
            'hover:border-zinc-300 dark:hover:border-linear-hairline-strong',
            'focus-visible:border-linear-primary focus-visible:ring-2 focus-visible:ring-linear-primary/20 focus-visible:outline-none dark:focus-visible:ring-linear-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-linear-ink-tertiary" />
      </div>
    );
  }
);
Select.displayName = 'Select';
