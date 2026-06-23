import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export type FileEntry = {
  name: string;
  size: number;
  uploadedAt: string;
};

export function isLocalMode(): boolean {
  return !process.env.BLOB_READ_WRITE_TOKEN;
}

const PACKAGES_DIR = path.resolve(process.cwd(), 'packages');

function ensureDir() {
  fs.mkdirSync(PACKAGES_DIR, { recursive: true });
}

export function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function listLocalFiles(): FileEntry[] {
  ensureDir();
  return fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => {
      const full = path.join(PACKAGES_DIR, e.name);
      const stat = fs.statSync(full);
      return {
        name: e.name,
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export function resolveLocalPath(name: string): string {
  const safe = path.basename(name);
  const full = path.resolve(PACKAGES_DIR, safe);
  if (!full.startsWith(PACKAGES_DIR)) {
    throw new Error('Invalid path');
  }
  return full;
}

export async function saveLocalFile(name: string, data: Buffer): Promise<FileEntry> {
  ensureDir();
  const safe = safeFilename(name);
  const full = resolveLocalPath(safe);
  fs.writeFileSync(full, data);
  const stat = fs.statSync(full);
  return { name: safe, size: stat.size, uploadedAt: stat.mtime.toISOString() };
}

export function readLocalFile(name: string): { buffer: Buffer; size: number } {
  const full = resolveLocalPath(name);
  if (!fs.existsSync(full)) throw new Error('Not found');
  const buffer = fs.readFileSync(full);
  return { buffer, size: buffer.length };
}

export function openLocalFileStream(name: string): { stream: Readable; size: number } {
  const full = resolveLocalPath(name);
  if (!fs.existsSync(full)) throw new Error('Not found');
  const { size } = fs.statSync(full);
  return { stream: fs.createReadStream(full), size };
}

export function deleteLocalFile(name: string): void {
  const full = resolveLocalPath(name);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}
