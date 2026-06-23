import type { FileEntry } from './storage';

export async function listBlobFiles(): Promise<FileEntry[]> {
  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: 'packages/' });
  return blobs
    .map((b) => ({
      name: b.pathname.replace(/^packages\//, ''),
      size: b.size,
      uploadedAt: b.uploadedAt.toISOString(),
    }))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function downloadBlobFile(name: string) {
  const { head } = await import('@vercel/blob');
  const pathname = `packages/${name}`;
  const meta = await head(pathname);
  const blobRes = await fetch(meta.url, {
    headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!blobRes.ok) throw new Error('fetch failed');
  const buffer = await blobRes.arrayBuffer();
  return { buffer, size: meta.size, contentType: meta.contentType };
}

export async function deleteBlobFile(name: string) {
  const { del } = await import('@vercel/blob');
  await del(`packages/${name}`);
}
