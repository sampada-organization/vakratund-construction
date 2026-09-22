import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve('src/content');
const dest = path.resolve('api/content');
fs.mkdirSync(dest, { recursive: true });
for (const file of fs.readdirSync(src)) {
  if (!file.endsWith('.json')) continue;
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
}
console.log('synced src/content -> api/content');
