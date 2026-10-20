import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './global.css';

const metadataBase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
  } catch {
    return new URL('http://localhost:3000');
  }
})();

export const metadata: Metadata = { metadataBase };

/**
 * 根布局只负责 <html>/<body>：语言由 proxy 写入 x-cite-locale 头，
 * 具体的 i18n Provider 在 app/[lang]/layout.tsx 与 app/admin/layout.tsx 里各自挂载。
 */
export default async function Layout({ children }: LayoutProps<'/'>) {
  const lang = (await headers()).get('x-cite-locale') ?? 'zh';

  return (
    <html lang={lang === 'en' ? 'en' : 'zh-CN'} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
