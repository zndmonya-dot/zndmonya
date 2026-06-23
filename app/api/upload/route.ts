import { NextResponse } from 'next/server';
import type { HandleUploadBody } from '@vercel/blob/client';
import { isAuthenticated } from '@/lib/auth';
import { MAX_UPLOAD_BYTES } from '@/lib/constants-client';
import { getStorageConfigError, isLocalMode, saveLocalFile } from '@/lib/storage';

export const runtime = 'nodejs';

const BLOB_PREFIX = 'packages/';

function isBlobClientRequest(contentType: string): boolean {
  return contentType.includes('application/json');
}

/** アップロード API — ローカルは FormData、本番は Vercel Blob の handleUpload */
export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get('content-type') ?? '';

  // 開発環境: FormData で packages/ に直接保存
  if (!isBlobClientRequest(contentType)) {
    if (!isLocalMode()) {
      const storageError = getStorageConfigError();
      return NextResponse.json(
        { error: storageError ?? '本番では Vercel Blob 経由でアップロードしてください' },
        { status: 503 },
      );
    }

    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const saved = await saveLocalFile(file.name, buffer);
      return NextResponse.json({ ok: true, saved });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'アップロードに失敗しました';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const body = (await request.json()) as HandleUploadBody;

  // ブラウザからのトークン要求のみセッション認証（完了 Webhook は署名で検証）
  if (body.type === 'blob.generate-client-token') {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const storageError = getStorageConfigError();
    if (storageError) {
      return NextResponse.json({ error: storageError }, { status: 503 });
    }
  }

  const { handleUpload } = await import('@vercel/blob/client');

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(BLOB_PREFIX)) {
          throw new Error('無効なアップロード先です');
        }

        return {
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          allowedContentTypes: [
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream',
          ],
        };
      },
      onUploadCompleted: async () => {
        // 一覧は Blob の list で取得するため DB 更新は不要
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'アップロードに失敗しました';
    console.error('[upload]', message, err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
