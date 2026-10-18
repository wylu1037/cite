import Link from 'next/link';
import { ArrowUpRight, ChevronRight, FileText, FolderGit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryNode {
  id: string;
  title: string;
  enTitle: string;
  href: string;
  description: string;
  items: { title: string; href: string }[];
}

const CATEGORIES: CategoryNode[] = [
  {
    id: 'quickstart',
    title: '快速上手',
    enTitle: 'Getting Started',
    href: '/docs/quickstart',
    description:
      '新人入职指南、知识库日常查阅，以及 Markdown / MDX 编写规范与模板。',
    items: [
      { title: '如何使用知识库（浏览与搜索）', href: '/docs/quickstart' },
      {
        title: '文档写作速览（语法与约定）',
        href: '/docs/quickstart/writing-guide',
      },
      { title: '后台在线新建与发布流程', href: '/admin' },
    ],
  },
  {
    id: 'product',
    title: '产品文档',
    enTitle: 'Product Architecture',
    href: '/docs/product',
    description:
      '核心产品业务矩阵、产品架构设计全景、功能流程图与角色权限模型。',
    items: [
      { title: '产品文档板块说明与模板', href: '/docs/product' },
      { title: '业务全景图与功能清单', href: '/docs/product' },
      { title: 'RBAC 角色权限与审批流程', href: '/docs/product' },
    ],
  },
  {
    id: 'develop',
    title: '开发与接口',
    enTitle: 'APIs & Contracts',
    href: '/docs/develop',
    description:
      '统一 REST/RPC 接口设计约定、前后端联调流程、公共 SDK 与统一错误码。',
    items: [
      { title: '开发与接口板块联调约定', href: '/docs/develop' },
      { title: '统一 REST 路由与状态码标准', href: '/docs/develop' },
      { title: 'SSE 流式接口与客户端集成', href: '/docs/develop' },
    ],
  },
  {
    id: 'ops',
    title: '部署与运维',
    enTitle: 'Infrastructure & SOP',
    href: '/docs/ops',
    description:
      '各环境配置拓扑清单、Docker/K8s 容器编排、CI/CD 流水线与故障应急手册。',
    items: [
      { title: '部署运维环境与模板说明', href: '/docs/ops' },
      { title: 'Docker Compose 与 pgvector 部署', href: '/docs/ops' },
      { title: '环境变量配置与敏感信息管理', href: '/docs/ops' },
    ],
  },
  {
    id: 'faq',
    title: '团队规范与 FAQ',
    enTitle: 'Team Standards',
    href: '/docs/faq',
    description:
      '高频技术排错清单、Git 分支规范与 Conventional Commits、代码评审标准。',
    items: [
      { title: '高频常见问题排查与速查', href: '/docs/faq' },
      { title: 'Conventional Commits 提交规范', href: '/docs/faq' },
      { title: 'Git 分支模型与代码评审约定', href: '/docs/faq' },
    ],
  },
];

export function KnowledgeTree() {
  return (
    <section className="pt-12 pb-16 md:pt-16 md:pb-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end md:mb-12">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl dark:text-linear-ink">
              知识资产全景目录
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-linear-ink-subtle">
              按工程研发与产研协作周期组织，支持直接点击对应文章条目快速查阅。
            </p>
          </div>

          <Link
            href="/docs"
            className="group flex min-h-11 items-center gap-1 self-start text-sm font-medium text-zinc-600 transition-colors hover:text-linear-primary sm:self-end dark:text-linear-ink-subtle dark:hover:text-linear-primary-hover"
          >
            <span>浏览全部文档</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* A distinct starting point, followed by four open document groups. */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              className={cn(
                'group relative flex min-w-0 flex-col justify-between',
                idx === 0 &&
                  'rounded-2xl bg-white p-6 sm:p-8 md:col-span-2 lg:col-span-1 lg:row-span-2 lg:self-start dark:bg-linear-surface-3',
                idx !== 0 && 'py-1'
              )}
            >
              <div>
                {/* Title */}
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-linear-ink">
                    <Link
                      href={cat.href}
                      className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-linear-primary dark:hover:text-linear-primary-hover"
                    >
                      {cat.title}
                      <ArrowUpRight className="h-4 w-4 text-zinc-500 dark:text-linear-ink-subtle" />
                    </Link>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-linear-ink-subtle">
                    {cat.enTitle}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-linear-ink-subtle">
                    {cat.description}
                  </p>
                </div>

                {/* Sub-articles Direct Links */}
                <div className="mt-6 space-y-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-linear-ink-subtle">
                    重点文档条目
                  </span>
                  <ul>
                    {cat.items.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className="group/item -mx-2 flex min-h-11 items-center justify-between gap-2 rounded-md px-2 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 hover:text-linear-primary dark:text-linear-ink-muted dark:hover:bg-linear-surface-2 dark:hover:text-linear-primary-hover"
                        >
                          <span>{item.title}</span>
                          <ChevronRight className="h-3 w-3 shrink-0 text-zinc-500 transition-colors group-hover/item:text-linear-primary dark:text-linear-ink-subtle" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Footer Link */}
              <div className="mt-6 flex items-center text-sm">
                <Link
                  href={cat.href}
                  className="inline-flex min-h-11 items-center font-medium text-linear-primary underline-offset-4 hover:underline dark:text-linear-primary-hover"
                >
                  浏览全部 &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
