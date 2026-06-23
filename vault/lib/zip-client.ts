import { BlobReader, BlobWriter, ZipWriter, configure } from '@zip.js/zip.js';
import type { StagedFile } from '@/lib/collect-files';

let configured = false;

function ensureConfig() {
  if (configured) return;
  configure({
    useWebWorkers: false,
    useCompressionStream: typeof CompressionStream !== 'undefined',
  });
  configured = true;
}

export function makeParcelName(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '-')
    .slice(0, 15);
  return `parcel-${stamp}.zip`;
}

export async function createZip(
  files: StagedFile[],
  onProgress?: (percent: number, label: string) => void,
): Promise<Blob> {
  ensureConfig();

  const writer = new ZipWriter(new BlobWriter('application/zip'), { zip64: true });
  const total = files.length;

  try {
    for (let i = 0; i < files.length; i++) {
      const { file, path } = files[i];
      const base = Math.round((i / total) * 90);
      onProgress?.(base, `梱包中 (${i + 1}/${total})`);

      await writer.add(path, new BlobReader(file), {
        level: 6,
        zip64: true,
        onprogress: (loaded, size) => {
          if (!size) return;
          const slice = Math.round((loaded / size) * (90 / total));
          onProgress?.(Math.min(89, base + slice), `梱包中: ${path}`);
        },
      });
    }

    onProgress?.(95, '荷物をまとめています...');
    const blob = await writer.close();
    onProgress?.(100, '梱包完了');
    return blob;
  } catch (err) {
    await writer.close().catch(() => {});
    throw err;
  }
}
