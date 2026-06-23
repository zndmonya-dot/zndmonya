'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { loginAction } from './actions';

export function LoginForm({ from, disabled }: { from: string; disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, { error: '' });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="from" value={from} />
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground" htmlFor="password">
          パスワード
        </label>
        <input
          className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          required
          disabled={disabled || pending}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" size="sm" disabled={disabled || pending} className="w-full">
        {pending ? '確認中…' : 'ログイン'}
      </Button>
      {state?.error && (
        <p className="text-center text-xs text-destructive" role="alert">{state.error}</p>
      )}
    </form>
  );
}
