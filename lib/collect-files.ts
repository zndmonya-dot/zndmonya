export type StagedFile = { file: File; path: string };

function fileEntry(entry: FileSystemFileEntry, basePath: string): Promise<StagedFile> {
  return new Promise((resolve, reject) => {
    entry.file(
      (file) => resolve({ file, path: basePath + file.name }),
      reject,
    );
  });
}

/** ドロップされたフォルダを再帰的に読み込む */
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

async function walkDirectoryHandle(
  handle: FileSystemDirectoryHandle,
  basePath = '',
): Promise<StagedFile[]> {
  const collected: StagedFile[] = [];
  for await (const [name, entry] of handle.entries()) {
    const path = basePath + name;
    if (entry.kind === 'file') {
      collected.push({ file: await entry.getFile(), path });
    } else if (entry.kind === 'directory') {
      collected.push(...(await walkDirectoryHandle(entry, `${path}/`)));
    }
  }
  return collected;
}

function fromFileList(files: FileList | File[]): StagedFile[] {
  return Array.from(files).map((file) => ({
    file,
    path: file.webkitRelativePath || file.name,
  }));
}

export function collectSelectedFiles(list: FileList): StagedFile[] {
  return fromFileList(list);
}

export function collectSelectedDirectory(list: FileList): StagedFile[] {
  return fromFileList(list);
}

/** クリック選択: ファイル（File System Access API があれば優先） */
export async function browseFiles(): Promise<StagedFile[]> {
  if (typeof window.showOpenFilePicker === 'function') {
    try {
      const handles = await window.showOpenFilePicker({ multiple: true });
      return Promise.all(
        handles.map(async (handle) => {
          const file = await handle.getFile();
          return { file, path: file.name };
        }),
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return [];
      throw err;
    }
  }
  return [];
}

/** クリック選択: フォルダ（File System Access API があれば優先） */
export async function browseFolder(): Promise<StagedFile[]> {
  if (typeof window.showDirectoryPicker === 'function') {
    try {
      const handle = await window.showDirectoryPicker();
      return walkDirectoryHandle(handle, `${handle.name}/`);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return [];
      throw err;
    }
  }
  return [];
}

/**
 * ドロップゾーンからのファイル収集。
 * webkitGetAsEntry が使える場合はフォルダ構造を保持して再帰読み込みする。
 */
export async function collectDroppedFiles(dataTransfer: DataTransfer): Promise<StagedFile[]> {
  const items = dataTransfer.items;
  if (items?.length) {
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind !== 'file') continue;
      const entry = item.webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }
    if (entries.length > 0) {
      const nested = await Promise.all(entries.map(walkEntry));
      return nested.flat();
    }
  }

  if (dataTransfer.files?.length) {
    return fromFileList(dataTransfer.files);
  }

  return [];
}

export function totalBytes(files: StagedFile[]): number {
  return files.reduce((sum, f) => sum + f.file.size, 0);
}
