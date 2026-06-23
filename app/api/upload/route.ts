import { NextResponse } from 'next/server';
import type { HandleUploadBody } from '@vercel/blob/client';
import { isAuthenticated } from '@/lib/auth';
import { getStorageConfigError, isLocalMode, saveLocalFile } from '@/lib/storage';

export async function POST(request: Request): Promise<NextResponse> {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const storageError = getStorageConfigError();
  if (storageError) {
    return NextResponse.json({ error: storageError }, { status: 503 });
  }

  if (isLocalMode()) {
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

  const { handleUpload } = await import('@vercel/blob/client');
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const safeName = pathname.replace(/[^a-zA-Z0-9._-]/g, '_');
        return {
          allowedContentTypes: [
            'application/zip',
            'application/x-zip-compressed',
            'application/x-7z-compressed',
            'application/gzip',
            'application/x-tar',
            'application/octet-stream',
          ],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
          pathname: `packages/${safeName}`,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'アップロードに失敗しました';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
