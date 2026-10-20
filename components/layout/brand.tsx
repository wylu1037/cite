import { brandOf } from '@/lib/shared';

// ponytail: same geometry as public/brand/mark.svg — keep both in sync if the mark changes.
// One 45° slash + one dot: dot ⌀ = stroke width, dot centre 2× stroke off the slash axis.
export function Brand({ locale }: { locale: string }) {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5 shrink-0 text-linear-primary"
      >
        <path
          d="M5.78 18.22 18.22 5.78"
          stroke="currentColor"
          strokeWidth={4.4}
          strokeLinecap="round"
          fill="none"
        />
        <circle cx={18.22} cy={18.22} r={2.2} fill="currentColor" />
      </svg>
      <span>{brandOf(locale).name}</span>
    </>
  );
}
