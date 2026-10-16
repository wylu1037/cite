import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { translations } from '@/lib/layout.shared';
import './global.css';
import { DevClient } from '@fumadocs/local-md/dev/react-client';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={i18nProvider(translations)}>
          <DevClient />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
