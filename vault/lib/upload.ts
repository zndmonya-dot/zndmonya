/**
 * アップロード経路の切り替え。
 * - ローカル開発: FormData + XHR（進捗付き）→ /api/upload
 * - Vercel 本番: @vercel/blob/client のクライアント直アップロード
 */

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
  const { upload } = await import('@vercel/blob/client');
  await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    onUploadProgress: ({ percentage }) => onProgress(percentage),
  });
}
