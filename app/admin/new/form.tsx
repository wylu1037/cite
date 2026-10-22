'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownSelect } from '@/components/ui/dropdown-select';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ArrowLeft,
  FilePlus,
  Folder,
  FileText,
  CheckCircle2,
  Sparkles,
  Plus,
} from 'lucide-react';
import type { DocCategory } from '@/lib/admin/meta';

interface NewDocFormProps {
  categories: DocCategory[];
}

export function NewDocForm({ categories }: NewDocFormProps) {
  const router = useRouter();
  // 优先选择第一个非根目录的分类，若没有则默认首项
  const initialDir =
    categories.find((c) => c.path !== '')?.path ?? categories[0]?.path ?? '';
  const [selectedDir, setSelectedDir] = useState<string>(initialDir);
  const [customDir, setCustomDir] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isCustom = selectedDir === '__custom__';
  const effectiveDir = isCustom
    ? customDir.trim().replace(/^\/+|\/+$/g, '')
    : selectedDir;
  const rawSlug = slug.trim().replace(/^\/+/, '');
  const cleanFileName = rawSlug
    ? /\.(md|mdx)$/i.test(rawSlug)
      ? rawSlug
      : `${rawSlug}.mdx`
    : '';
  const previewPath = effectiveDir
    ? `${effectiveDir}/${cleanFileName || '<文件名>.mdx'}`
    : cleanFileName || '<文件名>.mdx';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (isCustom && !customDir.trim()) {
      setError('请输入新目录英文标识');
      return;
    }
    if (!rawSlug) {
      setError('请输入文档文件名');
      return;
    }

    const path = effectiveDir
      ? `${effectiveDir}/${cleanFileName}`
      : cleanFileName;
    const t = title.trim() || rawSlug;
    const content = `---\ntitle: ${t}\ndescription: \n---\n\n# ${t}\n`;

    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/doc', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(`/admin/edit/${path}`);
    } else {
      setError(typeof data.error === 'string' ? data.error : '创建失败');
    }
  }

  return (
    <div className="w-full space-y-5">
      {/* Top Scope & Action Toolbar (对齐目录与侧栏的布局，无重复标题与多余分割线) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-linear-hairline bg-linear-surface-1 text-linear-primary-hover">
            <FilePlus className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-linear-ink">
              创建知识库文档
            </span>
            <span className="font-mono text-xs text-linear-ink-tertiary">
              Markdown / MDX
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'h-8 text-xs text-linear-ink-subtle hover:text-linear-ink'
            )}
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            <span>返回文档列表</span>
          </Link>
          <Button
            type="submit"
            form="new-doc-form"
            variant="primary"
            size="sm"
            disabled={busy}
            className="h-8 text-xs font-medium"
          >
            {busy ? '创建中…' : '创建并开始编辑'}
          </Button>
        </div>
      </div>

      {/* Responsive Grid Layout: Left Main Form, Right Live Preview & Guidance */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Form Details Card (7 cols on xl) */}
        <div className="xl:col-span-7">
          <Card className="border-linear-hairline bg-linear-surface-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-linear-ink">
                基本信息
              </CardTitle>
              <CardDescription className="text-xs text-linear-ink-subtle">
                设置文档归属板块、显示标题与磁盘英文路径
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="new-doc-form" onSubmit={submit} className="space-y-4">
                {/* 目录下拉选择框 */}
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-medium text-linear-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <Folder className="h-3.5 w-3.5 text-linear-primary" />
                      所属目录板块
                    </span>
                    <span className="text-xs text-linear-ink-subtle">
                      从已有目录选择
                    </span>
                  </label>
                  <DropdownSelect
                    value={selectedDir}
                    onChange={(val) => {
                      setSelectedDir(val);
                      setError('');
                    }}
                    options={[
                      ...categories.map((c) => ({
                        value: c.path,
                        label: c.title,
                        icon: <Folder className="h-3.5 w-3.5 text-linear-primary" />,
                      })),
                      {
                        value: '__custom__',
                        label: '➕ 新建目录 / 自定义板块...',
                        icon: <Plus className="h-3.5 w-3.5 text-linear-primary-hover" />,
                      },
                    ]}
                    triggerClassName="h-9 w-full bg-linear-surface-2"
                  />
                </div>

                {/* 如果选了新建自定义目录 */}
                {isCustom && (
                  <div className="space-y-1.5 rounded-lg border border-linear-primary/30 bg-linear-primary/5 p-3">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-linear-ink-muted">
                      <Folder className="h-3.5 w-3.5 text-linear-primary-hover" />
                      新目录英文标识（目录名）
                    </label>
                    <Input
                      value={customDir}
                      onChange={(e) => setCustomDir(e.target.value)}
                      placeholder="例如: guide 或 tools/cli"
                      className="font-mono text-xs bg-linear-surface-2 border-linear-hairline"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-linear-ink-subtle">
                      将在{' '}
                      <code className="font-mono text-linear-primary-hover">
                        content/docs/
                      </code>{' '}
                      下自动创建该新目录
                    </p>
                  </div>
                )}

                {/* 文档标题 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-linear-ink-muted">
                    文档标题
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：安装与配置指南"
                    className="text-xs bg-linear-surface-2 border-linear-hairline"
                    required
                  />
                </div>

                {/* 文件名 / Slug */}
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-medium text-linear-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-linear-primary" />
                      文件名 / 英文标识 (Slug)
                    </span>
                    <span className="text-xs text-linear-ink-tertiary">
                      自动补充 .mdx 扩展名
                    </span>
                  </label>
                  <div className="relative">
                    <Input
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setError('');
                      }}
                      placeholder="例如: install 或 docker-guide"
                      className="pr-14 font-mono text-xs bg-linear-surface-2 border-linear-hairline"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-linear-ink-tertiary select-none">
                      .mdx
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-[#e5484d]/25 bg-[#e5484d]/10 p-2.5 text-xs text-[#ff6b6b]">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Link
                    href="/admin"
                    className={cn(
                      buttonVariants({ variant: 'secondary', size: 'sm' }),
                      'h-8 text-xs'
                    )}
                  >
                    取消
                  </Link>
                  <Button type="submit" variant="primary" size="sm" disabled={busy} className="h-8 text-xs font-medium">
                    {busy ? '创建中…' : '创建并开始编辑'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Path Preview & Tips Cards (5 cols on xl) */}
        <div className="space-y-6 xl:col-span-5">
          {/* Card 1: 实时路径预览 */}
          <Card className="border-linear-hairline bg-linear-surface-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-linear-ink">
                <CheckCircle2 className="h-4 w-4 text-linear-primary-hover" />
                完整文件路径预览
              </CardTitle>
              <CardDescription className="text-xs text-linear-ink-subtle">
                根据所选板块与文件名实时生成的物理存储路径
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-linear-hairline bg-linear-surface-2 p-3 font-mono text-xs">
                <span className="text-linear-ink-tertiary">content/docs/</span>
                <span className="font-semibold text-linear-primary-hover">
                  {previewPath}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: 知识库写作与双态机制提示 */}
          <div className="rounded-xl border border-linear-hairline bg-linear-surface-1/40 p-4 text-xs text-linear-ink-subtle space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-linear-ink">
              <Sparkles className="h-3.5 w-3.5 text-linear-primary-hover" />
              <span>知识库发布机制</span>
            </div>
            <p className="leading-relaxed">
              创建后将立即进入沉浸式在线编辑器。首次保存为「草稿」，点击「发布」后站点即时可见，无需重新构建镜像，全流程支持 Git 版本追溯。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
