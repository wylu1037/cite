import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { translations } from '@/lib/layout.shared';
import { i18n } from '@/lib/i18n';
import { DevClient } from '@fumadocs/local-md/dev/react-client';

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;
  const locale = (i18n.languages as string[]).includes(lang)
    ? lang
    : i18n.defaultLanguage;

  return (
    <RootProvider i18n={i18nProvider(translations, locale)}>
      <DevClient />
      <style>{`::highlight(fd-search) { color: var(--color-fd-primary); text-decoration: underline; }`}</style>
      {children}
    </RootProvider>
  );
}
