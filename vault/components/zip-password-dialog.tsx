'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StagedFile } from '@/lib/collect-files';
import { totalBytes } from '@/lib/collect-files';
import { formatSize } from '@/lib/format';
import { describeStagedFiles } from '@/lib/zip-client';

type Props = {
  open: boolean;
  files: StagedFile[];
  onConfirm: (password: string) => void;
  onCancel: () => void;
};

export function ZipPasswordDialog({ open, files, onConfirm, onCancel }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setConfirm('');
    setShow(false);
    setError('');
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const summary = describeStagedFiles(files);
  const size = formatSize(totalBytes(files));

  function submit() {
    const p = password.trim();
    const c = confirm.trim();
    if (!p) {
      setError('パスワードを入力してください');
      return;
    }
    if (p !== c) {
      setError('パスワードが一致しません');
      return;
    }
    onConfirm(p);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        aria-label="閉じる"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="zip-password-title"
        className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center gap-2 text-primary">
          <Lock className="size-4" aria-hidden />
          <h2 id="zip-password-title" className="text-sm font-semibold text-foreground">
            パスワードを設定
          </h2>
        </div>

        <p className="text-xs text-muted-foreground">
          {summary} · {size}
        </p>

        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground" htmlFor="zip-pw">パスワード</label>
            <div className="relative">
              <input
                ref={inputRef}
                id="zip-pw"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="new-password"
                className="flex h-9 w-full rounded-md border border-input bg-background py-1 pr-9 pl-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={show ? 'パスワードを隠す' : 'パスワードを表示'}
              >
                {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground" htmlFor="zip-pw-confirm">確認</label>
            <input
              id="zip-pw-confirm"
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoComplete="new-password"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs text-destructive" role="alert">{error}</p>
        )}

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          ダウンロードしたファイルを展開するときに、上記で設定したパスワードが必要となります。
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="button" size="sm" onClick={submit}>
            アップロード
          </Button>
        </div>
      </div>
    </div>
  );
}
