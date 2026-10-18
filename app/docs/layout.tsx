import { getSource } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { SidebarFooter } from '@/components/layout/sidebar-footer';

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  const docs = await getSource();
  return (
    <DocsLayout
      tree={docs.getPageTree()}
      {...baseOptions()}
      themeSwitch={{
        enabled: false,
      }}
      sidebar={{
        footer: <SidebarFooter />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
