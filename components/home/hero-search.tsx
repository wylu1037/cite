'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { Search, Sparkles, CornerDownLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSearch() {
  const router = useRouter();
  const { enabled, setOpenSearch } = useSearchContext();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  function handleAsk(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/ask?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/ask');
    }
  }

  return (
    <div className="w-full">
      {/* Console Input Container */}
      <div
        className={cn(
          'relative flex items-center rounded-lg border bg-white p-1.5 transition-all duration-200 dark:bg-linear-surface-1',
          isFocused
            ? 'border-linear-primary ring-2 ring-linear-primary/20 dark:ring-linear-primary/30'
            : 'border-zinc-200 hover:border-zinc-300 dark:border-linear-hairline dark:hover:border-linear-hairline-strong'
        )}
      >
        {/* Left Search Icon Trigger */}
        <button
          type="button"
          onClick={() => enabled && setOpenSearch(true)}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-linear-primary dark:text-linear-ink-subtle dark:hover:text-linear-primary-hover"
          title="打开全文搜索 (⌘K)"
        >
          <Search className="h-4 w-4 shrink-0" />
        </button>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAsk();
            }
          }}
          placeholder="搜索知识库文档、API 约定、SOP 或向 AI 提问..."
          aria-label="搜索知识库文档或向 AI 提问"
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-linear-ink dark:placeholder:text-linear-ink-subtle"
        />

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {enabled && (
            <button
              onClick={() => setOpenSearch(true)}
              type="button"
              className="hidden min-h-11 cursor-pointer items-center gap-1.5 rounded-md bg-zinc-50 px-2 py-1 text-xs text-zinc-500 transition-colors hover:text-zinc-900 sm:inline-flex dark:bg-linear-surface-2 dark:text-linear-ink-subtle dark:hover:text-white"
              title="打开全文检索"
            >
              <span>搜索</span>
              <kbd className="font-mono text-xs text-zinc-400 dark:text-linear-ink-tertiary">
                ⌘K
              </kbd>
            </button>
          )}

          <button
            onClick={() => handleAsk()}
            type="button"
            className={cn(
              'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
              query.trim()
                ? 'bg-linear-primary text-white hover:bg-linear-primary-hover'
                : 'bg-zinc-100 text-zinc-700 hover:bg-linear-primary/15 hover:text-linear-primary dark:bg-linear-surface-3 dark:text-linear-ink-muted dark:hover:text-linear-primary-hover'
            )}
          >
            <Sparkles
              className={cn(
                'h-3.5 w-3.5',
                query.trim()
                  ? 'text-white'
                  : 'text-linear-primary dark:text-linear-primary-hover'
              )}
            />
            <span>问 AI</span>
            {query.trim() ? (
              <CornerDownLeft className="h-3 w-3 opacity-75" />
            ) : (
              <ArrowRight className="h-3 w-3 opacity-60" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
