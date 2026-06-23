'use client';

import { Archive, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { fileExt, formatDate, formatDateFull, formatSize } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { FileEntry } from '@/lib/storage';

type Props = {
  files: FileEntry[];
  loading: boolean;
  error: string;
  busy: boolean;
  onRefresh: () => void;
  onRemove: (name: string) => void;
};

export function ReceiveStation({ files, loading, error, busy, onRefresh, onRemove }: Props) {
  return (
    <section className="flex flex-1 flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          ダウンロード
          {!loading && files.length > 0 && (
            <span className="ml-1.5 font-normal text-muted-foreground">({files.length})</span>
          )}
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onRefresh} disabled={loading || busy}>
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} aria-hidden />
          更新
        </Button>
      </div>

      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-12">
          <RefreshCw className="size-5 animate-spin text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">読み込み中…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center" role="alert">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && files.length === 0 && (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-10">
          <p className="text-sm text-muted-foreground">ファイルなし</p>
        </div>
      )}

      {!loading && files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.name}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm transition-colors hover:border-primary/25 hover:bg-background"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <Archive className="size-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground" title={f.name}>{f.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground" title={formatDateFull(f.uploadedAt)}>
                  {fileExt(f.name)} · {formatSize(f.size)} · {formatDate(f.uploadedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-90 transition-opacity group-hover:opacity-100">
                <a
                  href={`/api/download/${encodeURIComponent(f.name)}`}
                  download
                  className={buttonVariants({ size: 'sm' })}
                >
                  <Download aria-hidden />
                  保存
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(f.name)}
                  title="削除"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  <span className="sr-only">削除</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
