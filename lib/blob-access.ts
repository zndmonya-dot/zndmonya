/** Blob の公開設定（ストア作成時の Public / Private に合わせる。既定は private） */
export type BlobAccess = 'public' | 'private';

export function getBlobAccess(): BlobAccess {
  return process.env.NEXT_PUBLIC_BLOB_ACCESS === 'public' ? 'public' : 'private';
}
