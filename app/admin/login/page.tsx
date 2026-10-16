'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <main className="flex flex-1 min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-[#010102]">
      <Card className="w-full max-w-sm border-[#23252a] bg-[#0f1011] shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#5e6ad2]/15 text-[#828fff] border border-[#5e6ad2]/30">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-semibold tracking-tight text-[#f7f8f8]">
            知识库控制台登录
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">
            输入管理员账号密码以进入后台
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#d0d6e0]">账号</label>
              <Input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#d0d6e0]">密码</label>
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
              <p className="text-xs text-[#ff6b6b] bg-[#e5484d]/10 border border-[#e5484d]/25 rounded-[6px] p-2">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={busy}
              className="w-full mt-2"
            >
              {busy ? '验证中…' : '登 录'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
