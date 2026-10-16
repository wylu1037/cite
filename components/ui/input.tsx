import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-[8px] border border-zinc-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] px-3 py-1.5 text-sm text-zinc-900 dark:text-[#f7f8f8] placeholder:text-zinc-400 dark:placeholder:text-[#62666d] transition-colors',
          'hover:border-zinc-300 dark:hover:border-[#34343a]',
          'focus-visible:outline-none focus-visible:border-[#5e6ad2] focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/20 dark:focus-visible:ring-[#5e6ad2]/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
