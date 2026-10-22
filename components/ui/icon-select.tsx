'use client';

import * as React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import {
  BookOpen,
  FileText,
  Bookmark,
  Book,
  Library,
  Files,
  Notebook,
  Rocket,
  Compass,
  Sparkles,
  Lightbulb,
  Zap,
  Flame,
  Code,
  Terminal,
  Cpu,
  GitBranch,
  GitCommit,
  Braces,
  Binary,
  Workflow,
  Server,
  Database,
  Cloud,
  HardDrive,
  Layers,
  Boxes,
  Network,
  Container,
  Settings,
  Sliders,
  Wrench,
  Key,
  ShieldCheck,
  Lock,
  FolderTree,
  Folder,
  FolderOpen,
  Users,
  Share2,
  Globe,
  HelpCircle,
  Info,
  AlertCircle,
  BarChart3,
  Activity,
  Gauge,
  Puzzle,
  ChevronDown,
  Search,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// 精选主流知识库与技术文档常用图标字典
export const LUCIDE_ICONS: Record<
  string,
  { label: string; icon: LucideIcon; category: string }
> = {
  // 基础文档
  BookOpen: {
    label: '开放书籍 / 文档',
    icon: BookOpen,
    category: '文档与知识',
  },
  FileText: { label: '文本文件', icon: FileText, category: '文档与知识' },
  Book: { label: '书籍', icon: Book, category: '文档与知识' },
  Library: { label: '知识库 / 藏书', icon: Library, category: '文档与知识' },
  Files: { label: '多文档文件集', icon: Files, category: '文档与知识' },
  Notebook: { label: '笔记 / 手册', icon: Notebook, category: '文档与知识' },
  Bookmark: { label: '书签 / 重点', icon: Bookmark, category: '文档与知识' },

  // 上手与指引
  Rocket: { label: '火箭 / 快速起步', icon: Rocket, category: '指南与上手' },
  Compass: { label: '指南针 / 导航', icon: Compass, category: '指南与上手' },
  Sparkles: {
    label: '闪光 / AI与特性',
    icon: Sparkles,
    category: '指南与上手',
  },
  Lightbulb: {
    label: '灵感 / 最佳实践',
    icon: Lightbulb,
    category: '指南与上手',
  },
  Zap: { label: '闪电 / 极速与性能', icon: Zap, category: '指南与上手' },
  Flame: { label: '热点 / 热门技巧', icon: Flame, category: '指南与上手' },

  // 开发与接口
  Code: { label: '代码 / 语法', icon: Code, category: '开发与接口' },
  Terminal: {
    label: '终端 / 命令行 CLI',
    icon: Terminal,
    category: '开发与接口',
  },
  Braces: {
    label: '花括号 / API 与 JSON',
    icon: Braces,
    category: '开发与接口',
  },
  Cpu: { label: '处理器 / 引擎核心', icon: Cpu, category: '开发与接口' },
  GitBranch: { label: 'Git 分支', icon: GitBranch, category: '开发与接口' },
  GitCommit: {
    label: 'Git 提交 / 历史',
    icon: GitCommit,
    category: '开发与接口',
  },
  Binary: { label: '二进制 / 算法底层', icon: Binary, category: '开发与接口' },
  Workflow: {
    label: '工作流 / 流水线',
    icon: Workflow,
    category: '开发与接口',
  },

  // 部署运维与架构
  Server: { label: '服务器 / 后端服务', icon: Server, category: '架构与运维' },
  Database: {
    label: '数据库 / 存储引擎',
    icon: Database,
    category: '架构与运维',
  },
  Cloud: { label: '云计算 / 部署平台', icon: Cloud, category: '架构与运维' },
  HardDrive: {
    label: '硬盘 / 物理存储',
    icon: HardDrive,
    category: '架构与运维',
  },
  Container: {
    label: '容器 / Docker',
    icon: Container,
    category: '架构与运维',
  },
  Boxes: { label: '集群 / 微服务', icon: Boxes, category: '架构与运维' },
  Network: { label: '网络 / 拓扑连接', icon: Network, category: '架构与运维' },
  Layers: { label: '架构层 / 模块层级', icon: Layers, category: '架构与运维' },

  // 系统配置与安全
  Settings: {
    label: '系统设置 / 参数',
    icon: Settings,
    category: '配置与安全',
  },
  Sliders: {
    label: '调节器 / 偏好配置',
    icon: Sliders,
    category: '配置与安全',
  },
  Wrench: { label: '工具箱 / 运维工具', icon: Wrench, category: '配置与安全' },
  ShieldCheck: {
    label: '安全防护 / 权限核查',
    icon: ShieldCheck,
    category: '配置与安全',
  },
  Lock: { label: '密钥 / 加密认证', icon: Lock, category: '配置与安全' },
  Key: { label: 'API Key / 凭据', icon: Key, category: '配置与安全' },

  // 分类与目录
  FolderTree: {
    label: '目录树 / 导航栏',
    icon: FolderTree,
    category: '组织与导航',
  },
  Folder: { label: '分类目录', icon: Folder, category: '组织与导航' },
  FolderOpen: { label: '展开目录', icon: FolderOpen, category: '组织与导航' },
  Globe: { label: '国际化 / 全球网络', icon: Globe, category: '组织与导航' },
  Users: { label: '用户团队 / 权限组', icon: Users, category: '组织与导航' },
  Share2: { label: '共享与生态', icon: Share2, category: '组织与导航' },

  // 监控分析与帮助
  HelpCircle: {
    label: '常见问题 / FAQ',
    icon: HelpCircle,
    category: '帮助与分析',
  },
  Info: { label: '提示 / 详情说明', icon: Info, category: '帮助与分析' },
  AlertCircle: {
    label: '注意事项 / 警告',
    icon: AlertCircle,
    category: '帮助与分析',
  },
  Activity: {
    label: '运行健康度 / 监控',
    icon: Activity,
    category: '帮助与分析',
  },
  Gauge: { label: '仪表盘 / 指标度量', icon: Gauge, category: '帮助与分析' },
  BarChart3: {
    label: '数据报表 / 统计',
    icon: BarChart3,
    category: '帮助与分析',
  },
  Puzzle: { label: '插件 / 扩展系统', icon: Puzzle, category: '帮助与分析' },
};

export interface IconSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconSelect({ value, onChange, className }: IconSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const CurrentIcon =
    value && LUCIDE_ICONS[value] ? LUCIDE_ICONS[value].icon : null;

  // 搜索过滤（支持名称或描述搜索）
  const filteredEntries = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Object.entries(LUCIDE_ICONS);
    return Object.entries(LUCIDE_ICONS).filter(([name, item]) => {
      return (
        name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'group flex h-9 w-full items-center justify-between gap-2.5 rounded-lg border border-linear-hairline bg-linear-surface-2 px-3 text-xs font-medium text-linear-ink transition-colors hover:border-linear-hairline-strong focus:outline-none focus-visible:ring-1 focus-visible:ring-linear-primary/40',
          className
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {CurrentIcon ? (
            <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded bg-linear-primary/15 text-linear-primary-hover">
              <CurrentIcon className="h-3.5 w-3.5" />
            </div>
          ) : (
            <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded border border-dashed border-linear-hairline text-xs text-linear-ink-tertiary">
              无
            </div>
          )}
          <span
            className={cn(
              'truncate font-mono text-xs',
              !value && 'font-sans text-linear-ink-tertiary'
            )}
          >
            {value ? value : '未配置图标（点击下拉选择）'}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="rounded p-1 text-linear-ink-tertiary hover:bg-linear-surface-3 hover:text-linear-ink"
              title="清除图标"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-linear-ink-tertiary transition-transform duration-150 ease-out group-data-popup-open:rotate-180" />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="z-50 w-84 overflow-hidden rounded-xl border border-linear-hairline bg-linear-surface-1 p-2 text-xs shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl"
      >
        {/* 顶部搜索输入框 */}
        <div className="relative mb-2">
          <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-linear-ink-tertiary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索图标名称或类型..."
            className="h-8 border-linear-hairline bg-linear-surface-2 pr-2.5 pl-8 text-xs focus:border-linear-primary"
            autoFocus
          />
        </div>

        {/* 选项滚动列表 */}
        <ScrollArea
          className="h-64"
          viewportClassName="pr-2"
          contentClassName="space-y-0.5"
        >
          {/* 无图标选项 */}
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className={cn(
              'flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-start text-xs font-medium transition-colors',
              !value
                ? 'bg-linear-primary/15 font-semibold text-linear-primary-hover'
                : 'text-linear-ink-subtle hover:bg-linear-surface-2 hover:text-linear-ink'
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-linear-hairline text-xs text-linear-ink-tertiary">
                无
              </div>
              <span>无图标（使用前台默认）</span>
            </div>
            {!value && (
              <Check className="h-3.5 w-3.5 text-linear-primary-hover" />
            )}
          </button>

          {/* 如果输入了未匹配的自定义名称，允许直接采用 */}
          {query.trim() && !LUCIDE_ICONS[query.trim()] && (
            <button
              type="button"
              onClick={() => {
                onChange(query.trim());
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center justify-between rounded-md border border-dashed border-linear-primary/40 bg-linear-primary/5 px-2.5 py-1.5 text-xs text-linear-primary-hover transition-colors hover:bg-linear-primary/10"
            >
              <span>
                使用自定义图标名:{' '}
                <code className="font-mono font-semibold">{query.trim()}</code>
              </span>
              <Check className="h-3.5 w-3.5" />
            </button>
          )}

          {/* 图标列表 */}
          {filteredEntries.map(([iconName, item]) => {
            const Icon = item.icon;
            const isSelected = value === iconName;
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => {
                  onChange(iconName);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-start text-xs font-medium transition-colors',
                  isSelected
                    ? 'bg-linear-primary/15 font-semibold text-linear-primary-hover'
                    : 'text-linear-ink-muted hover:bg-linear-surface-2 hover:text-linear-ink'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-linear-hairline transition-colors',
                      isSelected
                        ? 'border-linear-primary/30 bg-linear-primary/20 text-linear-primary-hover'
                        : 'bg-linear-surface-2 text-linear-ink-subtle'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-mono text-linear-ink">
                      {iconName}
                    </span>
                    <span className="ml-1.5 text-linear-ink-tertiary">
                      {item.label}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-linear-primary-hover" />
                )}
              </button>
            );
          })}

          {filteredEntries.length === 0 && !query.trim() && (
            <div className="py-6 text-center text-xs text-linear-ink-tertiary">
              未找到匹配的图标
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
