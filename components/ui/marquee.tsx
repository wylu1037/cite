import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

export interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Optional CSS class to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   */
  pauseOnHover?: boolean;
  /**
   * Content to be scrolled infinitely
   */
  children: React.ReactNode;
  /**
   * Vertical scrolling instead of horizontal
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the children for smooth looping
   */
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]',
        {
          'flex-col': vertical,
          'flex-row': !vertical,
        },
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn('flex shrink-0 justify-around gap-(--gap)', {
            'animate-marquee flex-row': !vertical,
            'animate-marquee-vertical flex-col': vertical,
            'group-hover:[animation-play-state:paused]': pauseOnHover,
            '[animation-direction:reverse]': reverse,
          })}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
