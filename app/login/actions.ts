'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, verifyPassword } from '@/lib/auth';
import { SESSION_COOKIE } from '@/lib/constants';

export async function loginAction(
  _prevState: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  const password = formData.get('password') as string;
  if (!verifyPassword(password)) {
    return { error: 'パスワードが正しくありません' };
  }

  cookies().set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  const from = (formData.get('from') as string) || '';
  redirect(from && from !== '/' && from !== '/login' ? from : '/');
}
