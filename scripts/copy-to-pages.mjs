import { mkdirSync, cpSync, existsSync, readdirSync } from 'fs';
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

// Copy assets/* directly to output root (flatten so _next/static/ is at the root)
const assetsDir = join(openNextDir, 'assets');
if (existsSync(assetsDir)) {
  const items = readdirSync(assetsDir);
  for (const item of items) {
    cpSync(join(assetsDir, item), join(outputDir, item), {
      recursive: true,
      filter: (src) => !src.includes('node_modules'),
    });
  }
}

// Copy worker.js -> _worker.js for Cloudflare Pages
const workerJs = join(openNextDir, 'worker.js');
const underscoreWorker = join(outputDir, '_worker.js');
if (existsSync(workerJs)) {
  cpSync(workerJs, underscoreWorker);
}

console.log('Copied OpenNext output to .vercel/output/static');
