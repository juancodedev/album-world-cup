import { mkdirSync, cpSync, existsSync, readdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, '.vercel/output/static');
const openNextDir = join(root, '.open-next');

mkdirSync(outputDir, { recursive: true });

if (!existsSync(openNextDir)) {
  console.error('.open-next directory not found. Run opennextjs-cloudflare build first.');
  process.exit(1);
}

// Copy everything from .open-next/ to output root
const items = readdirSync(openNextDir);
for (const item of items) {
  if (item === 'assets') {
    // Flatten assets/ so _next/static/ is at the root for Pages
    const assetsDir = join(openNextDir, 'assets');
    if (existsSync(assetsDir)) {
      const assetItems = readdirSync(assetsDir);
      for (const assetItem of assetItems) {
        cpSync(join(assetsDir, assetItem), join(outputDir, assetItem), {
          recursive: true,
          filter: (src) => !src.includes('node_modules'),
        });
      }
    }
  } else if (item !== 'node_modules') {
    cpSync(join(openNextDir, item), join(outputDir, item), {
      recursive: true,
      filter: (src) => !src.includes('node_modules'),
    });
  }
}

// Rename worker.js -> _worker.js for Cloudflare Pages
const workerJs = join(outputDir, 'worker.js');
const underscoreWorker = join(outputDir, '_worker.js');
if (existsSync(workerJs) && !existsSync(underscoreWorker)) {
  renameSync(workerJs, underscoreWorker);
}

console.log('Copied OpenNext output to .vercel/output/static');
