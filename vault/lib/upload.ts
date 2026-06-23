/**
 * アップロード経路の切り替え。
 * - ローカル開発: FormData + XHR（進捗付き）→ /api/upload
 * - Vercel 本番: @vercel/blob/client のクライアント直アップロード
 */

import { getBlobAccess } from '@/lib/blob-access';

const BLOB_PREFIX = 'packages/';
const MULTIPART_THRESHOLD = 100 * 1024 * 1024;

function blobPathname(filename: string): string {
  return `${BLOB_PREFIX}${filename}`;
}

function mapUploadError(err: unknown): Error {
  if (!(err instanceof Error)) return new Error('送信に失敗しました');

  const msg = err.message;
  if (msg.includes('client token') || msg.includes('clientToken')) {
    return new Error('ストレージへの接続に失敗しました。Blob の設定を確認してください');
  }
  if (msg.includes('Access denied') || msg.includes('content type') || msg.includes('Pathname mismatch')) {
    return new Error(`ストレージへのアップロードが拒否されました: ${msg}`);
  }
  return err;
}

/** 開発環境 — packages/ へ直接保存 */
export async function uploadViaForm(file: File, onProgress: (n: number) => void) {
  const form = new FormData();
  form.append('file', file);
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error || '送信に失敗しました'));
        } catch {
          reject(new Error('送信に失敗しました'));
        }
      }
    };
    xhr.onerror = () => reject(new Error('送信に失敗しました'));
    xhr.open('POST', '/api/upload');
    xhr.send(form);
  });
}

/** 本番 — Vercel Blob へクライアント直アップロード（Function body 制限を回避） */
export async function uploadViaBlob(file: File, onProgress: (n: number) => void) {
  try {
    const { upload } = await import('@vercel/blob/client');
    await upload(blobPathname(file.name), file, {
      access: getBlobAccess(),
      handleUploadUrl: '/api/upload',
      contentType: 'application/zip',
      multipart: file.size > MULTIPART_THRESHOLD,
      onUploadProgress: ({ percentage }) => onProgress(percentage),
    });
  } catch (err) {
    throw mapUploadError(err);
  }
}

/** localhost 以外では Blob 経路を優先（mode 判定ミス時の保険） */
export function shouldUseBlobUpload(mode: 'local' | 'blob' | 'unconfigured'): boolean {
  if (mode === 'blob' || mode === 'unconfigured') return true;
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host !== 'localhost' && host !== '127.0.0.1';
}
