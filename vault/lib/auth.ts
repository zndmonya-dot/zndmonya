import crypto from 'crypto';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/constants';

function getSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return secret;
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

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = crypto.createHmac('sha256', getSecret()).update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const expected = crypto.createHmac('sha256', getSecret()).update(exp).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function isAuthenticated(): boolean {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}
