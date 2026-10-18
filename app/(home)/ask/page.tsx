import type { Metadata } from 'next';
import { AskClient } from './ask-client';

export const metadata: Metadata = {
  title: 'Ask AI · 部门知识库智能问答',
  description: '基于站内文档的 RAG 语义检索与带引用智能问答',
};

export default async function AskPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 md:py-10">
      <AskClient initialQuery={searchParams.q} />
    </div>
  );
}
