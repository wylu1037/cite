import type { Metadata } from 'next';
import Link from 'next/link';
import { AskClient } from './ask-client';

export const metadata: Metadata = { title: '问知识库' };

export default function AskPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">问知识库</h1>
      <p className="mt-1 text-sm text-fd-muted-foreground">
        基于站内文档回答，答案会给出引用来源；找不到时会明确说明。也可以直接去{' '}
        <Link href="/docs" className="underline">
          文档
        </Link>{' '}
        里全文搜索。
      </p>
      <AskClient />
    </main>
  );
}
