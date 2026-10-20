import { defineI18n } from 'fumadocs-core/i18n';

/**
 * 双语：中文为默认语言（URL 无前缀），英文走 /en。
 * 内容按目录分组：content/docs/zh/**、content/docs/en/**。
 * fallbackLanguage: null —— 未翻译的页面在英文站直接 404，不静默回退中文。
 */
export const i18n = defineI18n({
  languages: ['zh', 'en'],
  defaultLanguage: 'zh',
  hideLocale: 'default-locale',
  parser: 'dir',
  fallbackLanguage: null,
});

export type Locale = 'zh' | 'en';

export const isLocale = (v: string): v is Locale =>
  (i18n.languages as string[]).includes(v);
