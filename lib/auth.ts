import crypto from 'crypto';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/constants';

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET?.trim();
  return secret || null;
}

export function isAuthConfigured(): boolean {
  return Boolean(getSecret() && process.env.VAULT_PASSWORD?.trim());
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.VAULT_PASSWORD?.trim();
  if (!expected) return false;
  const input = password.trim();
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = crypto.createHmac('sha256', secret).update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const expected = crypto.createHmac('sha256', secret).update(exp).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function isAuthenticated(): boolean {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}
