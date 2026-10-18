'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
    <Card className="border-linear-hairline bg-linear-surface-1 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-linear-primary/30 bg-linear-primary/15 text-linear-primary-hover">
              <FilePlus className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base text-linear-ink">
                新建文档
              </CardTitle>
              <CardDescription className="text-xs text-linear-ink-subtle">
                选择所属目录板块创建新的 Markdown / MDX 知识库文档
              </CardDescription>
            </div>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <ArrowLeft className="mr-1 h-3 w-3" />
              返回列表
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {/* 目录下拉选择框 */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-medium text-linear-ink-muted">
              <span className="flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-linear-primary" />
                所属目录板块
              </span>
              <span className="text-[11px] text-linear-ink-subtle">
                从已有目录下拉选择
              </span>
            </label>
            <Select
              value={selectedDir}
              onChange={(e) => {
                setSelectedDir(e.target.value);
                setError('');
              }}
              className="font-sans text-xs"
            >
              {categories.map((c) => (
                <option
                  key={c.path}
                  value={c.path}
                  className="bg-linear-surface-1 text-linear-ink"
                >
                  {c.title}
                </option>
              ))}
              <option
                value="__custom__"
                className="bg-linear-surface-1 font-medium text-linear-primary-hover"
              >
                ➕ 新建目录 / 自定义板块...
              </option>
            </Select>
          </div>

          {/* 如果选了新建自定义目录 */}
          {isCustom && (
            <div className="space-y-1.5 rounded-[8px] border border-linear-primary/30 bg-linear-primary/5 p-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-linear-ink-muted">
                <Folder className="h-3.5 w-3.5 text-linear-primary-hover" />
                新目录英文标识（目录名）
              </label>
              <Input
                value={customDir}
                onChange={(e) => setCustomDir(e.target.value)}
                placeholder="例如: guide 或 tools/cli"
                className="font-mono text-xs"
                required
                autoFocus
              />
              <p className="text-[11px] text-linear-ink-subtle">
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
              <span className="text-[11px] text-linear-ink-tertiary">
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
                className="pr-14 font-mono text-xs"
                required
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-linear-ink-tertiary select-none">
                .mdx
              </span>
            </div>
          </div>

          {/* 实时路径预览 */}
          <div className="flex items-center gap-2 rounded-[8px] border border-linear-hairline bg-linear-surface-2 p-2.5 text-xs text-linear-ink-subtle">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-linear-primary" />
            <div className="truncate">
              完整路径预览：
              <code className="ml-1 font-mono text-xs font-medium text-linear-primary-hover">
                content/docs/{previewPath}
              </code>
            </div>
          </div>

          {error && (
            <div className="rounded-[6px] border border-[#e5484d]/25 bg-[#e5484d]/10 p-2.5 text-xs text-[#ff6b6b]">
              {error}
            </div>
          )}

          <div className="rounded-[8px] border border-linear-hairline bg-linear-surface-2/60 p-3 text-xs text-linear-ink-subtle">
            <p>
              💡
              提示：创建后将立即进入在线编辑器。首次保存为「草稿」，点击「发布」后站点即时可见，无需重新构建镜像。
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Link href="/admin">
              <Button type="button" variant="secondary" size="sm">
                取消
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {busy ? '创建中…' : '创建并开始编辑'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
