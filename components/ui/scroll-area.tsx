'use client';

import * as React from 'react';
import { ScrollArea as BaseScrollArea } from '@base-ui-components/react';
import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<
  typeof BaseScrollArea.Root
> {
  viewportClassName?: string;
  contentClassName?: string;
  scrollbarClassName?: string;
  thumbClassName?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      children,
      viewportClassName,
      contentClassName,
      scrollbarClassName,
      thumbClassName,
      orientation = 'vertical',
      ...props
    },
    ref
  ) => {
    return (
      <BaseScrollArea.Root
        ref={ref}
        className={cn(
          'relative flex min-h-0 flex-col overflow-hidden',
          className
        )}
        {...props}
      >
        <BaseScrollArea.Viewport
          className={cn(
            'custom-scrollbar min-h-0 w-full flex-1 rounded-[inherit] outline-none',
            viewportClassName
          )}
        >
          <BaseScrollArea.Content className={contentClassName}>
            {children}
          </BaseScrollArea.Content>
        </BaseScrollArea.Viewport>

        {(orientation === 'vertical' || orientation === 'both') && (
          <BaseScrollArea.Scrollbar
            orientation="vertical"
            className={cn(
              'flex h-full w-2 touch-none p-0.5 transition-opacity duration-200 select-none',
              'data-hovering:opacity-100 data-scrolling:opacity-100 data-[hovering]:opacity-100 data-[scrolling]:opacity-100',
              'opacity-30 hover:opacity-100',
              scrollbarClassName
            )}
          >
            <BaseScrollArea.Thumb
              className={cn(
                'relative flex-1 rounded-full bg-linear-hairline-strong transition-colors hover:bg-linear-ink-subtle',
                thumbClassName
              )}
            />
          </BaseScrollArea.Scrollbar>
        )}

        {(orientation === 'horizontal' || orientation === 'both') && (
          <BaseScrollArea.Scrollbar
            orientation="horizontal"
            className={cn(
              'flex h-2 w-full touch-none p-0.5 transition-opacity duration-200 select-none',
              'data-hovering:opacity-100 data-scrolling:opacity-100 data-[hovering]:opacity-100 data-[scrolling]:opacity-100',
              'opacity-30 hover:opacity-100',
              scrollbarClassName
            )}
          >
            <BaseScrollArea.Thumb
              className={cn(
                'relative flex-1 rounded-full bg-linear-hairline-strong transition-colors hover:bg-linear-ink-subtle',
                thumbClassName
              )}
            />
          </BaseScrollArea.Scrollbar>
        )}

        <BaseScrollArea.Corner />
      </BaseScrollArea.Root>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

export const ScrollAreaRoot = BaseScrollArea.Root;
export const ScrollAreaViewport = BaseScrollArea.Viewport;
export const ScrollAreaContent = BaseScrollArea.Content;
export const ScrollAreaScrollbar = BaseScrollArea.Scrollbar;
export const ScrollAreaThumb = BaseScrollArea.Thumb;
export const ScrollAreaCorner = BaseScrollArea.Corner;
