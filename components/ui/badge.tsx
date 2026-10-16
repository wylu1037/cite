import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-[#141516] text-[#d0d6e0] border border-[#23252a]',
        primary: 'bg-[#5e6ad2]/15 text-[#828fff] border border-[#5e6ad2]/30',
        success: 'bg-[#27a644]/15 text-[#4ade80] border border-[#27a644]/30',
        warning: 'bg-[#f5a623]/15 text-[#fbbf24] border border-[#f5a623]/30',
        destructive: 'bg-[#e5484d]/15 text-[#ff6b6b] border border-[#e5484d]/30',
        outline: 'border border-[#23252a] text-[#8a8f98]',
      },
      size: {
        default: 'px-2 py-0.5 text-xs rounded-full gap-1',
        sm: 'px-1.5 py-0.2 text-[11px] rounded-[4px] gap-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
