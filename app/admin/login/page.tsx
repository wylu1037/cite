'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ user, password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('账号或密码不正确');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-1 items-center justify-center bg-linear-canvas p-6">
      <Card className="w-full max-w-sm border-linear-hairline bg-linear-surface-1 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] border border-linear-primary/30 bg-linear-primary/15 text-linear-primary-hover">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-semibold tracking-tight text-linear-ink">
            知识库控制台登录
          </CardTitle>
          <CardDescription className="text-xs text-linear-ink-subtle">
            输入管理员账号密码以进入后台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-linear-ink-muted">
                账号
              </label>
              <Input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-linear-ink-muted">
                密码
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="rounded-[6px] border border-[#e5484d]/25 bg-[#e5484d]/10 p-2 text-xs text-[#ff6b6b]">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={busy}
              className="mt-2 w-full"
            >
              {busy ? '验证中…' : '登 录'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
