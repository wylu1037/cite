import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { zhCN } from '@fumadocs/language/zh-cn';
import { ShieldCheck } from 'lucide-react';
import { Brand } from '@/components/layout/brand';
import { i18n } from '@/lib/i18n';
import { brandOf } from '@/lib/shared';

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    zh: { displayName: '中文' },
    en: { displayName: 'English' },
  })
  .preset('zh', zhCN());

const nav = {
  zh: { docs: '文档', ask: '智能问答', admin: '后台管理' },
  en: { docs: 'Docs', ask: 'Ask AI', admin: 'Admin' },
};

export function baseOptions(locale: string): BaseLayoutProps {
  const t = locale === 'en' ? nav.en : nav.zh;
  const prefix = locale === i18n.defaultLanguage ? '' : `/${locale}`;

  return {
    nav: {
      title: <Brand locale={locale} />,
    },
    links: [
      { text: t.docs, url: `${prefix}/docs`, active: 'nested-url' },
      { text: t.ask, url: `${prefix}/ask` },
      {
        type: 'icon',
        icon: <ShieldCheck />,
        text: t.admin,
        label: t.admin,
        url: '/admin',
      },
    ],
  };
}

export { brandOf };
