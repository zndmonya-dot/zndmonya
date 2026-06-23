import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { listBlobFiles } from '@/lib/blob-storage';
import { getStorageConfigError, isLocalMode, listLocalFiles } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const storageError = getStorageConfigError();
    if (storageError) {
      return NextResponse.json({ error: storageError, files: [], mode: 'unconfigured' }, { status: 503 });
    }
    const files = isLocalMode() ? listLocalFiles() : await listBlobFiles();
    return NextResponse.json({ files, mode: isLocalMode() ? 'local' : 'blob' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'ファイル一覧の取得に失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
