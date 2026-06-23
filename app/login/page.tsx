import { FolderArchive } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { isAuthConfigured } from '@/lib/auth';
import { PageScene } from '@/vault/components/page-scene';

export const dynamic = 'force-dynamic';

const SITE_TITLE = 'ファイル転送サービス（仮）';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from = '' } = await searchParams;
  const configured = isAuthConfigured();

  return (
    <PageScene>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="vault-panel w-full max-w-sm p-6">
          <div className="relative flex items-center gap-2.5">
            <FolderArchive className="size-7 text-primary" strokeWidth={1.5} aria-hidden />
            <span className="text-sm font-semibold text-foreground">{SITE_TITLE}</span>
          </div>

          <h1 className="relative mt-6 text-base font-semibold text-foreground">ログイン</h1>

          {!configured && (
            <p className="relative mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
              <code className="font-mono">.env.local</code> を設定して再起動してください
            </p>
          )}

          <div className="relative mt-4">
            <LoginForm from={from} disabled={!configured} />
          </div>
        </div>
      </div>
    </PageScene>
  );
}
