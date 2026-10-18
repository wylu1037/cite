import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-[8px] border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 dark:border-linear-hairline dark:bg-linear-surface-1 dark:text-linear-ink dark:placeholder:text-linear-ink-tertiary',
          'hover:border-zinc-300 dark:hover:border-linear-hairline-strong',
          'focus-visible:border-linear-primary focus-visible:ring-2 focus-visible:ring-linear-primary/20 focus-visible:outline-none dark:focus-visible:ring-linear-primary/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
