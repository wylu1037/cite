import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { defineTranslations } from 'fumadocs-core/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { zhCN } from '@fumadocs/language/zh-cn';
import { appName } from './shared';

export const translations = defineTranslations()
  .extend(uiTranslations())
  .preset(zhCN());

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    links: [{ text: '问知识库', url: '/ask' }],
  };
}
