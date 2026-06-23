import { readFileSync, writeFileSync, unlinkSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { BlobReader, BlobWriter, ZipReader, ZipWriter, configure } from '@zip.js/zip.js';

configure({ useWebWorkers: false });

const dir = mkdtempSync(join(tmpdir(), 'vault-zip-test-'));
const outPath = join(dir, 'test.zip');
const password = 'test-pass-123';

const content = '新規 テキスト ドキュメント\nhello';
const blob = new Blob([content], { type: 'text/plain' });

const writer = new ZipWriter(new BlobWriter('application/zip'), { zip64: true });
await writer.add('新規 テキスト ドキュメント (2).txt', new BlobReader(blob), {
  level: 6,
  zip64: true,
  password,
  zipCrypto: true,
  useUnicodeFileNames: true,
});
const zipBlob = await writer.close();
writeFileSync(outPath, Buffer.from(await zipBlob.arrayBuffer()));

const reader = new ZipReader(new BlobReader(new Blob([readFileSync(outPath)])));
const entries = await reader.getEntries();
const entry = entries[0];
const extracted = await entry.getData(new BlobWriter(), { password });
const text = await (await extracted).text();
await reader.close();

if (text !== content) throw new Error(`round-trip failed: ${JSON.stringify(text)}`);

console.log('OK', outPath, 'size', zipBlob.size);
rmSync(dir, { recursive: true, force: true });
