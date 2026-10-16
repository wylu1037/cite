import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[#5e6ad2] text-white hover:bg-[#828fff] active:bg-[#5e69d1] shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
        secondary:
          'bg-[#0f1011] text-[#f7f8f8] border border-[#23252a] hover:bg-[#141516] hover:border-[#34343a] active:bg-[#18191a]',
        outline:
          'border border-[#23252a] text-[#d0d6e0] hover:bg-[#141516] hover:text-[#f7f8f8] active:bg-[#18191a]',
        ghost:
          'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#141516] active:bg-[#18191a]',
        destructive:
          'bg-[#e5484d]/15 text-[#ff6b6b] border border-[#e5484d]/30 hover:bg-[#e5484d]/25 active:bg-[#e5484d]/35',
      },
      size: {
        default: 'h-9 px-3.5 text-sm rounded-[8px] gap-2',
        sm: 'h-8 px-2.5 text-xs rounded-[6px] gap-1.5',
        lg: 'h-10 px-5 text-sm rounded-[8px] gap-2.5',
        icon: 'h-9 w-9 rounded-[8px]',
        'icon-sm': 'h-7 w-7 rounded-[6px]',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
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
  },
);
Button.displayName = 'Button';
