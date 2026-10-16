'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, FilePlus, Sparkles } from 'lucide-react';

export function NewDocForm() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    let path = slug.trim().replace(/^\/+/, '');
    if (!path) return;
    if (!/\.(md|mdx)$/i.test(path)) path += '.mdx';
    const t = title.trim() || '未命名文档';
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
    <Card className="border-[#23252a] bg-[#0f1011] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#5e6ad2]/15 text-[#828fff] border border-[#5e6ad2]/30">
              <FilePlus className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base text-[#f7f8f8]">新建文档</CardTitle>
              <CardDescription className="text-xs text-[#8a8f98]">
                在指定板块创建新的 Markdown / MDX 知识库文档
              </CardDescription>
            </div>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <ArrowLeft className="h-3 w-3 mr-1" />
              返回列表
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#d0d6e0]">
              文件相对路径（使用 <code className="text-[#5e6ad2] font-mono">/</code> 区分目录板块）
            </label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="quickstart/install.mdx"
              className="font-mono text-xs"
              required
            />
            <p className="text-[11px] text-[#62666d]">
              示例：<span className="text-[#8a8f98]">develop/api-reference.mdx</span> 或 <span className="text-[#8a8f98]">ops/docker-guide.mdx</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#d0d6e0]">文档标题</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：安装与配置指南"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-[6px] bg-[#e5484d]/10 border border-[#e5484d]/25 text-xs text-[#ff6b6b]">
              {error}
            </div>
          )}

          <div className="rounded-[8px] border border-[#23252a] bg-[#141516] p-3 text-xs text-[#8a8f98]">
            <p>💡 提示：创建后将立即进入在线编辑器。首次保存为「草稿」，点击「发布」后站点即时可见，无需重新构建镜像。</p>
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
