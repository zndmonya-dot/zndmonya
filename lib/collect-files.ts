export type StagedFile = { file: File; path: string };

function fileEntry(entry: FileSystemFileEntry, basePath: string): Promise<StagedFile> {
  return new Promise((resolve, reject) => {
    entry.file(
      (file) => resolve({ file, path: basePath + file.name }),
      reject,
    );
  });
}

async function readDirectory(dir: FileSystemDirectoryEntry, basePath: string): Promise<StagedFile[]> {
  const reader = dir.createReader();
  const prefix = basePath + dir.name + '/';
  const collected: StagedFile[] = [];

  const readBatch = (): Promise<void> =>
    new Promise((resolve, reject) => {
      reader.readEntries(async (entries) => {
        if (entries.length === 0) {
          resolve();
          return;
        }
        for (const entry of entries) {
          if (entry.isFile) {
            collected.push(await fileEntry(entry as FileSystemFileEntry, prefix));
          } else if (entry.isDirectory) {
            collected.push(...(await readDirectory(entry as FileSystemDirectoryEntry, prefix)));
          }
        }
        await readBatch();
        resolve();
      }, reject);
    });

  await readBatch();
  return collected;
}

async function walkEntry(entry: FileSystemEntry): Promise<StagedFile[]> {
  if (entry.isFile) {
    return [await fileEntry(entry as FileSystemFileEntry, '')];
  }
  if (entry.isDirectory) {
    return readDirectory(entry as FileSystemDirectoryEntry, '');
  }
  return [];
}

export async function collectDroppedFiles(dataTransfer: DataTransfer): Promise<StagedFile[]> {
  const items = dataTransfer.items;
  if (items?.length) {
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }
    if (entries.length > 0) {
      const nested = await Promise.all(entries.map(walkEntry));
      return nested.flat();
    }
  }

  return Array.from(dataTransfer.files).map((file) => ({ file, path: file.name }));
}

export function totalBytes(files: StagedFile[]): number {
  return files.reduce((sum, f) => sum + f.file.size, 0);
}
