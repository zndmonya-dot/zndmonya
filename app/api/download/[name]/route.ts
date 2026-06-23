import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { isAuthenticated } from '@/lib/auth';
import { deleteBlobFile, downloadBlobFile } from '@/lib/blob-storage';
import { deleteLocalFile, getStorageConfigError, isLocalMode, openLocalFileStream } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { name: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const name = decodeURIComponent(params.name);
  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`,
  };

  try {
    const storageError = getStorageConfigError();
    if (storageError) {
      return NextResponse.json({ error: storageError }, { status: 503 });
    }

    if (isLocalMode()) {
      const { stream, size } = openLocalFileStream(name);
      return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
        headers: { ...headers, 'Content-Length': String(size) },
      });
    }

    const { buffer, size, contentType } = await downloadBlobFile(name);
    return new NextResponse(buffer, {
      headers: { ...headers, 'Content-Type': contentType || headers['Content-Type'], 'Content-Length': String(size) },
    });
  } catch {
    return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { name: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const name = decodeURIComponent(params.name);

  try {
    const storageError = getStorageConfigError();
    if (storageError) {
      return NextResponse.json({ error: storageError }, { status: 503 });
    }

    if (isLocalMode()) deleteLocalFile(name);
    else await deleteBlobFile(name);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}
