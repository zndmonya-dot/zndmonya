import { BlobReader, BlobWriter, ZipWriter, configure } from '@zip.js/zip.js';
import type { StagedFile } from '@/lib/collect-files';

let configured = false;

/**
 * 外側 ZIP に入れる内側アーカイブのファイル名。
 * 受け取り側が外側 ZIP を展開したあとに見える名前。
 */
const INNER_ZIP_NAME = 'files.zip';

function ensureConfig() {
  if (configured) return;
  configure({
    useWebWorkers: false,
    useCompressionStream: typeof CompressionStream !== 'undefined',
  });
  configured = true;
}

/** アップロード先に保存する ZIP のファイル名（タイムスタンプ付き） */
export function makeParcelName(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '-')
    .slice(0, 15);
  return `parcel-${stamp}.zip`;
}

const baseEntryOptions = {
  level: 6 as const,
  zip64: true as const,
  useUnicodeFileNames: true as const,
};

/** 選択ファイルをそのまま圧縮した内側 ZIP（平文） */
async function createInnerZip(
  files: StagedFile[],
  onProgress?: (percent: number, label: string) => void,
): Promise<Blob> {
  const writer = new ZipWriter(new BlobWriter('application/zip'), { zip64: true });
  const total = files.length;

  try {
    for (let i = 0; i < files.length; i++) {
      const { file, path } = files[i];
      const base = Math.round((i / total) * 85);
      onProgress?.(base, `ZIP 作成中 (${i + 1}/${total})`);

      await writer.add(path, new BlobReader(file), {
        ...baseEntryOptions,
        onprogress: (loaded, size) => {
          if (!size) return;
          const slice = Math.round((loaded / size) * (85 / total));
          onProgress?.(Math.min(84, base + slice), path);
        },
      });
    }

    onProgress?.(90, 'ZIP を仕上げています…');
    const blob = await writer.close();
    onProgress?.(92, '暗号化の準備…');
    return blob;
  } catch (err) {
    await writer.close().catch(() => {});
    throw err;
  }
}

/**
 * パスワード付き ZIP を生成する。
 *
 * 構造: 外側 ZIP（ZipCrypto）→ `files.zip` 1 エントリのみ暗号化
 *       内側 ZIP（平文）→ ユーザーが選んだファイル群
 *
 * Windows 標準の展開でも開けるよう AES ではなく ZipCrypto を使う。
 * パスワード入力は外側 ZIP の展開時に 1 回だけで済む。
 */
export async function createZip(
  files: StagedFile[],
  onProgress?: (percent: number, label: string) => void,
  password?: string,
): Promise<Blob> {
  ensureConfig();

  const innerBlob = await createInnerZip(files, onProgress);

  if (!password) {
    onProgress?.(100, '完了');
    return innerBlob;
  }

  const outerWriter = new ZipWriter(new BlobWriter('application/zip'), { zip64: true });

  try {
    onProgress?.(94, 'パスワードで保護しています…');
    await outerWriter.add(INNER_ZIP_NAME, new BlobReader(innerBlob), {
      ...baseEntryOptions,
      password,
      zipCrypto: true,
      onprogress: (loaded, size) => {
        if (!size) return;
        const pct = 94 + Math.round((loaded / size) * 5);
        onProgress?.(Math.min(99, pct), 'パスワードで保護しています…');
      },
    });

    onProgress?.(99, '完了処理…');
    const blob = await outerWriter.close();
    onProgress?.(100, '完了');
    return blob;
  } catch (err) {
    await outerWriter.close().catch(() => {});
    throw err;
  }
}

/** パスワードダイアログ用の選択内容サマリー */
export function describeStagedFiles(files: StagedFile[]): string {
  if (!files.length) return '0 件';

  const roots = new Set(files.map((f) => f.path.split('/')[0]));
  const size = files.length;

  if (roots.size === 1) {
    const root = [...roots][0];
    const nested = files.some((f) => f.path.includes('/'));
    if (nested) return `「${root}」(${size} 件)`;
    if (size === 1) return root;
    return `${size} 件`;
  }

  return `${roots.size} グループ · ${size} 件`;
}
