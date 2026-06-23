import fs from 'fs';
import path from 'path';

const dirs = ['.next', path.join('node_modules', '.cache')];

for (const dir of dirs) {
  fs.rmSync(path.join(process.cwd(), dir), { recursive: true, force: true });
  console.log(`Removed ${dir}`);
}
