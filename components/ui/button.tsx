import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:ring-2 focus-visible:ring-linear-primary/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-linear-primary text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-linear-primary-hover active:bg-linear-primary-focus dark:shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
        secondary:
          'border border-zinc-200 bg-zinc-100 text-zinc-900 hover:border-zinc-300 hover:bg-zinc-200 active:bg-zinc-300 dark:border-linear-hairline dark:bg-linear-surface-1 dark:text-linear-ink dark:hover:border-linear-hairline-strong dark:hover:bg-linear-surface-2 dark:active:bg-linear-surface-3',
        outline:
          'border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200 dark:border-linear-hairline dark:text-linear-ink-muted dark:hover:bg-linear-surface-2 dark:hover:text-linear-ink dark:active:bg-linear-surface-3',
        ghost:
          'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200 dark:text-linear-ink-subtle dark:hover:bg-linear-surface-2 dark:hover:text-linear-ink dark:active:bg-linear-surface-3',
        destructive:
          'border border-red-200 bg-red-500/10 text-red-600 hover:bg-red-500/20 active:bg-red-500/30 dark:border-[#e5484d]/30 dark:bg-[#e5484d]/15 dark:text-[#ff6b6b] dark:hover:bg-[#e5484d]/25 dark:active:bg-[#e5484d]/35',
      },
      size: {
        default: 'h-9 gap-2 rounded-[8px] px-3.5 text-sm',
        sm: 'h-8 gap-1.5 rounded-[6px] px-2.5 text-xs',
        lg: 'h-10 gap-2.5 rounded-[8px] px-5 text-sm',
        icon: 'h-9 w-9 rounded-[8px]',
        'icon-sm': 'h-7 w-7 rounded-[6px]',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
