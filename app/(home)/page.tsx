import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-3">
      <h1 className="text-3xl font-bold">知识库</h1>
      <p className="text-fd-muted-foreground">
        部门文档统一入口，支持全文搜索，右上角可直接问 AI。
      </p>
      <p>
        打开{' '}
        <Link href="/docs" className="font-medium underline">
          /docs
        </Link>{' '}
        开始阅读。
      </p>
    </div>
  );
}
