import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { translations } from '@/lib/layout.shared';
import './global.css';
import { DevClient } from '@fumadocs/local-md/dev/react-client';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider i18n={i18nProvider(translations)}>
          <DevClient />
          <style>{`::highlight(fd-search) { color: var(--color-fd-primary); text-decoration: underline; }`}</style>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
