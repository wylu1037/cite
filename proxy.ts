import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute, docsRoute } from '@/lib/shared';

/**
 * 双语路由（中文默认，URL 无前缀；英文 /en）。
 * 路由树在 app/[lang] 下，所以这里把无前缀路径内部重写到 /zh，
 * 并把真实语言通过 x-cite-locale 头给根布局用（<html lang>）。
 *
 * 只在 [lang] 覆盖的三类路径上重写：`/`、`/docs/**`、`/ask/**`。
 * /admin、/api、/og、/llms* 保持中文，不参与语言切换。
 */
const LANG_ROUTES = [/^\/$/, /^\/docs(\/|$)/, /^\/ask(\/|$)/];
const BYPASS = /^\/(api|admin|_next|og|llms)/;

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`
);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) markdown 协商（.md 后缀 / Accept: text/markdown）优先，始终走中文内容
  const suffix = rewriteSuffix(pathname);
  if (suffix) return NextResponse.rewrite(new URL(suffix, request.nextUrl));

  if (isMarkdownPreferred(request)) {
    const negotiated = rewriteDocs(pathname);
    if (negotiated) {
      return NextResponse.rewrite(new URL(negotiated, request.nextUrl), {
        headers: { Vary: 'Accept' },
      });
    }
  }

  // 2) 默认语言已无前缀，带 /zh 的地址 301 回无前缀，避免重复收录
  if (pathname === '/zh' || pathname.startsWith('/zh/')) {
    const stripped = pathname.slice(3) || '/';
    return NextResponse.redirect(new URL(stripped, request.nextUrl), 301);
  }

  // 3) 语言判定
  const isEn = pathname === '/en' || pathname.startsWith('/en/');
  const locale = isEn ? 'en' : 'zh';

  if (BYPASS.test(pathname) || isEn) {
    return withLocale(request, locale, pathname);
  }

  // 4) 无前缀 = 中文：内部重写到 /zh，URL 保持不变
  if (LANG_ROUTES.some((re) => re.test(pathname))) {
    return withLocale(
      request,
      locale,
      `/zh${pathname === '/' ? '' : pathname}`
    );
  }

  return withLocale(request, locale, pathname);
}

function withLocale(request: NextRequest, locale: string, target: string) {
  const headers = new Headers(request.headers);
  headers.set('x-cite-locale', locale);

  return NextResponse.rewrite(new URL(target, request.nextUrl), {
    request: { headers },
  });
}
