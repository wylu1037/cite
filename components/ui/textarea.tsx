import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-[8px] border border-[#23252a] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] placeholder:text-[#62666d] transition-colors',
          'hover:border-[#34343a]',
          'focus-visible:outline-none focus-visible:border-[#5e6ad2] focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
