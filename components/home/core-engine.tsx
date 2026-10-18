'use client';

import { Database, Search, RefreshCw } from 'lucide-react';
import { Relay, Loupe, Branches } from '@lucasmarkes/hairline/react';
import { cn } from '@/lib/utils';

export function CoreEngine() {
  const PILLARS = [
    {
      id: 'rag',
      title: 'RAG 向量语义智能检索',
      description:
        '文档段落切片后自动生成 1536 维语义向量并入库。结合余弦相似度与关键词混合重排，毫秒级定位精准段落并生成带溯源引用的解答。',
      icon: Database,
      figure: Relay,
      hint: '移动鼠标体验向量召回节点跃迁',
    },
    {
      id: 'search',
      title: '毫秒级中文分词全站搜索',
      description:
        '深度整合中文分词插件与全键盘快捷键 ⌘K 支持。全站文档内容在毫秒级内完成关键词与路径过滤，即搜即现，告别大海捞针。',
      icon: Search,
      figure: Loupe,
      hint: '移动鼠标观察标尺放大镜实时滑动',
    },
    {
      id: 'deploy',
      title: '免构建热生效与版本回滚',
      description:
        '文档发布与修订以持久化存储卷为准，免除漫长的前端全量重新打包流水线。后台在线编辑即写即发，并保留快照支持差异比对与一键回滚。',
      icon: RefreshCw,
      figure: Branches,
      hint: '移动鼠标观察提交分支在弹簧力下升降',
    },
  ];

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl bg-white px-6 py-10 sm:px-8 md:p-12 dark:bg-linear-surface-3">
          {/* Section Header */}
          <div className="mb-10 max-w-2xl md:mb-12">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-balance text-zinc-950 sm:text-3xl dark:text-linear-ink">
              专为研发团队打造的高性能知识底座
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-linear-ink-subtle">
              从底层数据引擎到检索响应，采用微动量交互图示，移动鼠标即可感受精密动态响应。
            </p>
          </div>

          {/* 3-Column Engineering Grid with Hairline Figures */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const Figure = pillar.figure;
              return (
                <div key={pillar.id} className="group flex min-w-0 flex-col">
                  <div>
                    {/* Clean Header: Icon + Title */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center text-linear-primary dark:text-linear-primary-hover">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-linear-ink">
                        {pillar.title}
                      </h3>
                    </div>

                    {/* Interactive Hairline SVG Figure */}
                    <div className="my-6 flex flex-col items-center">
                      <div className="flex h-36 w-full max-w-55 items-center justify-center">
                        <Figure
                          play
                          intensity={0.6}
                          className="h-full w-full text-zinc-800 transition-transform duration-200 dark:text-zinc-200"
                        />
                      </div>
                      <span className="mt-3 text-center text-xs text-zinc-500 dark:text-linear-ink-subtle">
                        {pillar.hint}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-linear-ink-subtle">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
