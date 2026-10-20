import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { KnowledgeTree } from '@/components/home/knowledge-tree';
import { CoreEngine } from '@/components/home/core-engine';
import { LivePulse } from '@/components/home/live-pulse';
import { CtaFooter } from '@/components/home/cta-footer';

export const metadata: Metadata = {
  title: '出处 · 部门文档资产与研发智能统一入口',
  description:
    '汇聚产品文档、开发联调规范、部署运维手册与团队工程最佳实践，集成 RAG 向量语义问答与全站全文检索。',
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <div data-home-page className="flex flex-1 flex-col">
      <HeroSection />
      <KnowledgeTree />
      <CoreEngine />
      <LivePulse />
      <CtaFooter locale={lang} />
    </div>
  );
}
