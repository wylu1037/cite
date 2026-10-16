import type { Metadata } from 'next';
import { AskClient } from './ask-client';

export const metadata: Metadata = {
  title: 'Ask AI · 部门知识库智能问答',
  description: '基于站内文档的 RAG 语义检索与带引用智能问答',
};

export default function AskPage() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col">
      <AskClient />
    </div>
  );
}
