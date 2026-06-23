'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { totalBytes, type StagedFile } from '@/lib/collect-files';
import { MAX_UPLOAD_BYTES } from '@/lib/constants-client';
import { formatSize } from '@/lib/format';
import type { FileEntry } from '@/lib/storage';
import { createZip, makeParcelName } from '@/lib/zip-client';
import { shouldUseBlobUpload, uploadViaBlob, uploadViaForm } from '@/vault/lib/upload';

export type VaultPhase = 'idle' | 'collecting' | 'packing' | 'uploading';

export const PHASE_LABEL: Record<VaultPhase, string> = {
  idle: '',
  collecting: 'ファイルを読み込み',
  packing: 'ZIP を作成',
  uploading: 'アップロード',
};

type StorageMode = 'local' | 'blob' | 'unconfigured';

/**
 * ホーム画面の状態管理。
 * ファイル一覧の取得・ZIP 作成・アップロード・削除をまとめて扱う。
 */
export function useVault() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<StorageMode>('local');
  const [phase, setPhase] = useState<VaultPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');

  const busy = phase !== 'idle';
  const storageReady = mode !== 'unconfigured';

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/files', { cache: 'no-store' });
      const data = await res.json();
      const nextMode: StorageMode =
        data.mode === 'blob' ? 'blob' : data.mode === 'unconfigured' ? 'unconfigured' : 'local';
      setMode(nextMode);
      if (!res.ok) throw new Error(data.error);
      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const uploadStaged = useCallback(async (staged: StagedFile[], password: string) => {
    if (!staged.length) return;

    if (!storageReady) {
      toast.error('ストレージが未設定です。Vercel Blob を接続してください');
      return;
    }

    const trimmed = password.trim();
    if (!trimmed) {
      toast.error('ZIP パスワードを設定してください');
      return;
    }

    const bytes = totalBytes(staged);
    if (bytes > MAX_UPLOAD_BYTES) {
      toast.error(`上限 ${formatSize(MAX_UPLOAD_BYTES)} を超えています`);
      return;
    }

    const uploadFn = shouldUseBlobUpload(mode) ? uploadViaBlob : uploadViaForm;

    try {
      setPhase('packing');
      setProgress(0);

      const zipBlob = await createZip(staged, (pct, label) => {
        setProgress(Math.round(pct * 0.6));
        setStatusLabel(label);
      }, trimmed);

      if (zipBlob.size > MAX_UPLOAD_BYTES) {
        throw new Error(`サイズ上限（${formatSize(MAX_UPLOAD_BYTES)}）を超えています`);
      }

      const zipName = makeParcelName();
      const parcel = new File([zipBlob], zipName, { type: 'application/zip' });

      setPhase('uploading');
      setProgress(0);
      setStatusLabel(zipName);
      await uploadFn(parcel, (n) => setProgress(n));

      toast.success('アップロードが完了しました');
      await loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '処理に失敗しました');
    } finally {
      setPhase('idle');
      setProgress(0);
      setStatusLabel('');
    }
  }, [loadFiles, mode, storageReady]);

  const removeFile = useCallback(async (name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    const res = await fetch(`/api/download/${encodeURIComponent(name)}`, { method: 'DELETE' });
    if (res.ok) {
      toast.message('削除しました');
      loadFiles();
    } else {
      toast.error('削除に失敗しました');
    }
  }, [loadFiles]);

  return {
    files,
    loading,
    error,
    phase,
    progress,
    statusLabel,
    busy,
    storageReady,
    loadFiles,
    uploadStaged,
    removeFile,
  };
}
