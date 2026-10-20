import path from 'node:path';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { i18n } from './i18n';
import { localMd } from '@fumadocs/local-md';
import { dynamicLoader, llms } from 'fumadocs-core/source';

export const contentDir = process.env.KB_CONTENT_DIR || 'content';

/**
 * 构建产物会把本模块打进多个 bundle（页面渲染的 ssr chunk 与 API 路由 chunk），
 * 模块级变量因此会被复制成多份实例——后台发布调 invalidateFile 会失效到另一份缓存上。
 * 挂到 globalThis 做进程级单例：全站（页面渲染 + API 路由）共用同一个内容源与编译缓存。
 */
function createDocsBundle() {
  const docs = localMd({
    dir: path.join(contentDir, 'docs'),
  });

  if (process.env.NODE_ENV === 'development') {
    void docs.devServer();
  }

  const loader = dynamicLoader(docs.dynamicSource(), {
    baseUrl: docsRoute,
    i18n,
    plugins: [lucideIconsPlugin()],
  });

  return { docs, loader };
}

const g = globalThis as typeof globalThis & {
  __kbDocsBundle?: ReturnType<typeof createDocsBundle>;
};
const bundle = (g.__kbDocsBundle ??= createDocsBundle());

const docs = bundle.docs;

// See https://fumadocs.dev/docs/headless/source-api for more info
export const docsLoader = bundle.loader;

export async function getSource() {
  return docsLoader.get();
}

export const docsLlms = llms(getSource, {
  renderPage: (page) => `# ${page.data.title} (${page.url})

${page.data.content}`,
});

/**
 * 后台发布/删除/回滚后调用：让运行时内容源与检索索引即时失效。
 * rel = 相对 content/docs 的文件路径，如 "getting-started/install.mdx"
 */
export function invalidateDoc(rel: string) {
  docs.invalidateFile(path.join(contentDir, 'docs', rel));
}
