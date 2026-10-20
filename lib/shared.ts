import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Cite';

/** 双语品牌文案：产品名英文 Cite，中文配「出处」 */
export const brand = {
  zh: {
    name: '出处',
    full: 'Cite · 部门知识库',
    tagline: '每句话都有出处',
  },
  en: {
    name: 'Cite',
    full: 'Cite · Department Knowledge Base',
    tagline: 'Every answer has a source.',
  },
} as const;

export const brandOf = (locale: string) =>
  locale === 'en' ? brand.en : brand.zh;
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
