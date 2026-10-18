import Link from 'next/link';
import { BookOpen, Sparkles, FolderTree, Plus, FileText } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-linear-canvas text-linear-ink selection:bg-linear-primary selection:text-white">
      {/* Top sticky Linear navigation bar */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-linear-hairline bg-linear-canvas/85 px-6 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="group flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-linear-primary text-xs font-bold text-white shadow-[0_0_12px_rgba(94,106,210,0.5)]">
              KB
            </span>
            <span className="text-sm font-semibold tracking-tight text-linear-ink transition-colors group-hover:text-linear-primary-hover">
              Knowledge Base Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-xs md:flex">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-linear-ink-subtle transition-colors hover:bg-linear-surface-2 hover:text-linear-ink"
            >
              <FileText className="h-3.5 w-3.5" />
              文档列表
            </Link>
            <Link
              href="/admin/new"
              className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-linear-ink-subtle transition-colors hover:bg-linear-surface-2 hover:text-linear-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              新建文档
            </Link>
            <Link
              href="/admin/meta"
              className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-linear-ink-subtle transition-colors hover:bg-linear-surface-2 hover:text-linear-ink"
            >
              <FolderTree className="h-3.5 w-3.5" />
              侧栏配置
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/docs"
            className="flex items-center gap-1.5 rounded-[6px] border border-linear-hairline bg-linear-surface-1 px-3 py-1.5 text-linear-ink-muted transition-colors hover:border-linear-hairline-strong hover:bg-linear-surface-2"
            target="_blank"
          >
            <BookOpen className="h-3.5 w-3.5 text-linear-ink-subtle" />
            前台文档
          </Link>
          <Link
            href="/ask"
            className="flex items-center gap-1.5 rounded-[6px] border border-linear-primary/30 bg-linear-primary/10 px-3 py-1.5 text-linear-primary-hover transition-colors hover:bg-linear-primary/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask AI
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
