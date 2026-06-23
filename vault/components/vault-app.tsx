'use client';

import Link from 'next/link';
import { FolderArchive } from 'lucide-react';
import { logoutAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { DeliveryHub } from '@/vault/components/delivery-hub';
import { PageScene } from '@/vault/components/page-scene';
import { useVault } from '@/vault/hooks/use-vault';

const SITE_TITLE = 'ファイル転送サービス（仮）';

/** 認証済みホーム画面 — ヘッダー + 転送パネル */
export function VaultApp() {
  const vault = useVault();

  return (
    <PageScene>
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FolderArchive className="size-7 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">{SITE_TITLE}</span>
        </Link>
        <form action={logoutAction} className="shrink-0">
          <Button type="submit" variant="outline" size="sm" className="bg-card/60 backdrop-blur-sm">
            ログアウト
          </Button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-10 sm:px-8">
        <DeliveryHub
          phase={vault.phase}
          progress={vault.progress}
          statusLabel={vault.statusLabel}
          busy={vault.busy}
          storageReady={vault.storageReady}
          files={vault.files}
          loading={vault.loading}
          error={vault.error}
          onUpload={vault.uploadStaged}
          onRefresh={vault.loadFiles}
          onRemove={vault.removeFile}
        />
      </main>
    </PageScene>
  );
}
