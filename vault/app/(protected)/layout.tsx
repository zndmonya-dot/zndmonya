import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) redirect('/login');
  return children;
}
