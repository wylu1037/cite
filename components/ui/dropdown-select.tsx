'use client';

import * as React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = '请选择...',
  triggerClassName,
  contentClassName,
}: DropdownSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selected = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'group flex h-8 items-center justify-between gap-2.5 rounded-lg border border-linear-hairline bg-linear-surface-1 px-3 text-xs font-medium text-linear-ink transition-colors hover:border-linear-hairline-strong focus:outline-none focus-visible:ring-1 focus-visible:ring-linear-primary/40',
          triggerClassName
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selected?.icon}
          <span>{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-linear-ink-tertiary transition-transform duration-150 ease-out group-data-popup-open:rotate-180" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(
          'z-50 min-w-(--anchor-width) overflow-hidden rounded-lg border border-linear-hairline bg-linear-surface-1 p-1 text-xs shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl',
          contentClassName
        )}
      >
        <ScrollArea
          className="max-h-72"
          viewportClassName="pr-1"
          contentClassName="space-y-0.5"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-start text-xs font-medium transition-colors',
                  isSelected
                    ? 'bg-linear-primary/15 font-semibold text-linear-primary-hover'
                    : 'text-linear-ink-muted hover:bg-linear-surface-2 hover:text-linear-ink'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-linear-primary-hover" />
                )}
              </button>
            );
          })}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
