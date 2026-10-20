import { getSource } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { SidebarFooter } from '@/components/layout/sidebar-footer';
import { SidebarTabs, type SidebarTab } from '@/components/layout/sidebar-tabs';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  const docs = await getSource();
  const base = baseOptions(lang);
  // 文档 / 智能问答 改由搜索框下的 SidebarTabs 呈现，不再作为普通链接混在页面树上方
  const [docsLink, askLink] = (base.links ?? []).filter(
    (link) => link.type !== 'icon' && 'url' in link
  ) as { url: string; text: string }[];
  const tabs: SidebarTab[] = [
    { url: docsLink.url, text: docsLink.text, icon: 'docs' },
    { url: askLink.url, text: askLink.text, icon: 'ask' },
  ];

  return (
    <DocsLayout
      tree={docs.getPageTree(lang)}
      {...base}
      // 语言、主题、后台入口统一由 SidebarFooter 承载，关闭 fumadocs 内置的同类控件
      links={[]}
      i18n={false}
      themeSwitch={{
        enabled: false,
      }}
      sidebar={{
        banner: (
          <SidebarTabs
            tabs={tabs}
            label={lang === 'en' ? 'Sections' : '产品区'}
          />
        ),
        footer: <SidebarFooter locale={lang} />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
