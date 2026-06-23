import { readFileSync, writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { BlobReader, BlobWriter, ZipReader, ZipWriter, configure } from '@zip.js/zip.js';

configure({ useWebWorkers: false });

const dir = mkdtempSync(join(tmpdir(), 'vault-nested-zip-'));
const outPath = join(dir, 'parcel.zip');
const password = 'test-pass-123';

const content = 'hello nested';
const innerBlob = new Blob([content], { type: 'text/plain' });

const innerWriter = new ZipWriter(new BlobWriter('application/zip'), { zip64: true });
await innerWriter.add('folder/doc.txt', new BlobReader(innerBlob), { level: 6, useUnicodeFileNames: true });
const innerZip = await innerWriter.close();

const outerWriter = new ZipWriter(new BlobWriter('application/zip'), { zip64: true });
await outerWriter.add('files.zip', new BlobReader(innerZip), {
  password,
  zipCrypto: true,
  useUnicodeFileNames: true,
  level: 6,
});
const parcel = await outerWriter.close();
writeFileSync(outPath, Buffer.from(await parcel.arrayBuffer()));

const outerReader = new ZipReader(new BlobReader(new Blob([readFileSync(outPath)])));
const entries = await outerReader.getEntries();
if (entries.length !== 1) throw new Error(`expected 1 outer entry, got ${entries.length}`);

const innerBytes = await entries[0].getData(new BlobWriter(), { password });
const innerReader = new ZipReader(new BlobReader(new Blob([await innerBytes.arrayBuffer()])));
const innerEntries = await innerReader.getEntries();
const text = await (await innerEntries[0].getData(new BlobWriter())).text();
await innerReader.close();
await outerReader.close();

if (text !== content) throw new Error('nested round-trip failed');
console.log('OK nested zip', outPath);
rmSync(dir, { recursive: true, force: true });
