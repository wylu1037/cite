import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'border border-linear-hairline bg-linear-surface-2 text-linear-ink-muted',
        primary:
          'border border-linear-primary/30 bg-linear-primary/15 text-linear-primary-hover',
        success: 'border border-[#27a644]/30 bg-[#27a644]/15 text-[#4ade80]',
        warning: 'border border-[#f5a623]/30 bg-[#f5a623]/15 text-[#fbbf24]',
        destructive:
          'border border-[#e5484d]/30 bg-[#e5484d]/15 text-[#ff6b6b]',
        outline: 'border border-linear-hairline text-linear-ink-subtle',
      },
      size: {
        default: 'gap-1 rounded-full px-2 py-0.5 text-xs',
        sm: 'py-0.2 gap-1 rounded-[4px] px-1.5 text-[11px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
