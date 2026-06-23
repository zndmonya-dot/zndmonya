'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, isAuthConfigured, verifyPassword } from '@/lib/auth';
import { SESSION_COOKIE } from '@/lib/constants';

export async function loginAction(
  _prevState: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const password = formData.get('password') as string;
  if (!isAuthConfigured()) {
    return { error: 'サーバー設定が未完了です（VAULT_PASSWORD / SESSION_SECRET）' };
  }
  if (!verifyPassword(password)) {
    return { error: 'パスワードが正しくありません' };
  }

  const token = createSessionToken();
  if (!token) {
    return { error: 'セッションを開始できません（SESSION_SECRET を確認してください）' };
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  const from = (formData.get('from') as string) || '';
  redirect(from && from !== '/' && from !== '/login' ? from : '/');
}
