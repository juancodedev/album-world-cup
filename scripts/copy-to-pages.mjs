import { mkdirSync, cpSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, '.vercel/output/static');
const openNextDir = join(root, '.open-next');

mkdirSync(outputDir, { recursive: true });

if (existsSync(join(openNextDir, 'worker.js'))) {
  cpSync(join(openNextDir, 'worker.js'), join(outputDir, '_worker.js'));
}

const assetsDir = join(openNextDir, 'assets');
if (existsSync(assetsDir)) {
  cpSync(assetsDir, outputDir, { recursive: true });
}

console.log('✅ Copied OpenNext output to .vercel/output/static');
