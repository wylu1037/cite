import Link from 'next/link';
import { BookOpen, Sparkles, FolderTree, Plus, FileText } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] selection:bg-[#5e6ad2] selection:text-white">
      {/* Top sticky Linear navigation bar */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#23252a] bg-[#010102]/85 px-6 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 group">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#5e6ad2] text-xs font-bold text-white shadow-[0_0_12px_rgba(94,106,210,0.5)]">
              KB
            </span>
            <span className="font-semibold tracking-tight text-sm text-[#f7f8f8] group-hover:text-[#828fff] transition-colors">
              Knowledge Base Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex text-xs">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              文档列表
            </Link>
            <Link
              href="/admin/new"
              className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              新建文档
            </Link>
            <Link
              href="/admin/meta"
              className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] transition-colors"
            >
              <FolderTree className="h-3.5 w-3.5" />
              侧栏配置
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/docs"
            className="flex items-center gap-1.5 rounded-[6px] border border-[#23252a] bg-[#0f1011] px-3 py-1.5 text-[#d0d6e0] hover:border-[#34343a] hover:bg-[#141516] transition-colors"
            target="_blank"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#8a8f98]" />
            前台文档
          </Link>
          <Link
            href="/ask"
            className="flex items-center gap-1.5 rounded-[6px] border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 px-3 py-1.5 text-[#828fff] hover:bg-[#5e6ad2]/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask AI
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
