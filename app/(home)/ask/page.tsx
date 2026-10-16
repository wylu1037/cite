import type { Metadata } from 'next';
import Link from 'next/link';
import { AskClient } from './ask-client';
import { Sparkles, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ask AI · 部门知识库智能问答',
  description: '基于站内文档的 RAG 语义检索与带引用智能问答',
};

export default function AskPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Linear Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 px-3 py-1 text-xs font-medium text-[#828fff]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask AI · 站内知识语义问答</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#f7f8f8]">
          向部门知识库提问
        </h1>
        <p className="max-w-xl text-xs text-[#8a8f98] leading-relaxed">
          基于已发布的 Markdown 文档进行 pgvector 向量检索与大模型深度推理。所有答案均附带可跳转的原文档引用；如果文档中未记录将明确说明。
        </p>
      </div>

      <AskClient />
    </main>
  );
}
