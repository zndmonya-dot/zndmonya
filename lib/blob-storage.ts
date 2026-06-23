import type { FileEntry } from './storage';
import { getBlobAccess } from './blob-access';

const BLOB_PREFIX = 'packages/';

export async function listBlobFiles(): Promise<FileEntry[]> {
  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: BLOB_PREFIX });
  return blobs
    .map((b) => ({
      name: b.pathname.replace(/^packages\//, ''),
      size: b.size,
      uploadedAt: b.uploadedAt.toISOString(),
    }))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function downloadBlobFile(name: string) {
  const { get } = await import('@vercel/blob');
  const pathname = `${BLOB_PREFIX}${name}`;
  const result = await get(pathname, { access: getBlobAccess() });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error('fetch failed');
  }
  const buffer = await new Response(result.stream).arrayBuffer();
  return {
    buffer,
    size: result.blob.size,
    contentType: result.blob.contentType,
  };
}

export async function deleteBlobFile(name: string) {
  const { del } = await import('@vercel/blob');
  await del(`${BLOB_PREFIX}${name}`);
}
